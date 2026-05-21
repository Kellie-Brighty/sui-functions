#[allow(duplicate_alias)]
module sui_functions::trigger {
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string::{String};

    /// Errors
    const EFunctionNotFound: u64 = 0;
    const ENotOwner: u64 = 1;
    const ENotAuthorizedRunner: u64 = 2;
    const EFunctionNotVerified: u64 = 3;
    const EInsufficientFunds: u64 = 4;

    /// Status constants
    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// Global almighty platform auditor blob ID (immutable check)
    const GLOBAL_AUDITOR_BLOB_ID: vector<u8> = b"TJgeWW4t-MOv1K2klEsC0eDTDZbmcUu610eHptXD9mA";

    /// User-owned Project object
    public struct Project has key, store {
        id: UID,
        name: String,
        description: String,
        owner: address,
        runner_address: address,
        functions: Table<String, FunctionMetadata>,
        vault: Balance<SUI>
    }

    /// Global treasury to collect protocol fees
    public struct ProtocolTreasury has key {
        id: UID,
        balance: Balance<SUI>,
        base_compute_fee: u64
    }

    /// Admin capability to allow platform fee withdrawal
    public struct AdminCap has key, store {
        id: UID
    }

    /// Metadata for a registered function
    public struct FunctionMetadata has store, drop {
        walrus_blob_id: String,
        version: u64,
        owner: address,
        status: u8,
        trigger_type: u8,
        trigger_config: String
    }

    /// Event emitted when a new project is created
    public struct ProjectCreated has copy, drop {
        project_id: ID,
        owner: address,
        name: String
    }

    /// Event emitted when a function is registered/updated and requires auditing
    public struct VerificationRequested has copy, drop {
        project_id: ID,
        function_name: String,
        walrus_blob_id: String,
        auditor_blob_id: String
    }

    /// Event emitted when a function execution is triggered
    public struct ExecutionTriggered has copy, drop {
        project_id: ID,
        function_name: String,
        walrus_blob_id: String,
        caller: address,
        input_data: String
    }

    /// Event emitted when the backend runner completes execution and submits the result
    public struct ExecutionCompleted has copy, drop {
        project_id: ID,
        function_name: String,
        runner: address,
        result_data: String
    }

    /// Create a new Project and transfer it to the creator's wallet
    public entry fun create_project(
        name: String,
        description: String,
        treasury: &mut ProtocolTreasury,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let creation_fee = 100_000_000; // 0.1 SUI
        assert!(coin::value(&payment) >= creation_fee, EInsufficientFunds);
        
        let fee_coin = coin::split(&mut payment, creation_fee, ctx);
        balance::join(&mut treasury.balance, coin::into_balance(fee_coin));
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let project_id = object::uid_to_inner(&id);

        let project = Project {
            id,
            name,
            description,
            owner,
            runner_address: @0x0,
            functions: table::new(ctx),
            vault: balance::zero()
        };

        event::emit(ProjectCreated {
            project_id,
            owner,
            name
        });

        transfer::public_share_object(project);
    }

    /// Initialize the protocol treasury (usually called once by protocol admin)
    fun init(ctx: &mut TxContext) {
        let treasury = ProtocolTreasury {
            id: object::new(ctx),
            balance: balance::zero(),
            base_compute_fee: 7_000_000 // default 0.007 SUI
        };
        transfer::share_object(treasury);

        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Deposit SUI coins into a project's vault
    public entry fun deposit_funds(
        project: &mut Project,
        payment: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let coin_balance = coin::into_balance(payment);
        balance::join(&mut project.vault, coin_balance);
    }

    /// Update the authorized runner address for the project
    public entry fun set_runner_address(
        project: &mut Project,
        runner_address: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        project.runner_address = runner_address;
    }

    /// Register a new function inside a project
    public entry fun register_function(
        project: &mut Project,
        name: String,
        walrus_blob_id: String,
        trigger_type: u8,
        trigger_config: String,
        treasury: &mut ProtocolTreasury,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let deployment_fee = 50_000_000; // 0.05 SUI
        assert!(coin::value(&payment) >= deployment_fee, EInsufficientFunds);
        
        let fee_coin = coin::split(&mut payment, deployment_fee, ctx);
        balance::join(&mut treasury.balance, coin::into_balance(fee_coin));
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);

        // Security Rule: Every registered function must start as STATUS_PENDING
        let status = STATUS_PENDING;

        let metadata = FunctionMetadata {
            walrus_blob_id,
            version: 1,
            owner: sender,
            status,
            trigger_type,
            trigger_config
        };
        table::add(&mut project.functions, name, metadata);

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID)
        });
    }

    /// Confirm or reject the verification of a pending function
    public entry fun confirm_verification(
        project: &mut Project,
        name: String,
        approved: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // Only the authorized runner node can sign off on verification results
        assert!(project.runner_address == sender, ENotAuthorizedRunner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let metadata = table::borrow_mut(&mut project.functions, name);
        if (approved) {
            metadata.status = STATUS_VERIFIED;
        } else {
            metadata.status = STATUS_REJECTED;
        };
    }

    /// Trigger off-chain execution of a function
    public entry fun call_function(
        project: &Project,
        name: String,
        input_data: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&project.functions, name), EFunctionNotFound);
        let metadata = table::borrow(&project.functions, name);
        
        // Assert that the function is verified by the platform auditor before running
        assert!(metadata.status == STATUS_VERIFIED, EFunctionNotVerified);

        event::emit(ExecutionTriggered {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id: metadata.walrus_blob_id,
            caller: tx_context::sender(ctx),
            input_data
        });
    }

    /// Update an existing function's Walrus ID inside a project
    public entry fun update_function(
        project: &mut Project,
        name: String,
        new_walrus_blob_id: String,
        treasury: &mut ProtocolTreasury,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let deployment_fee = 50_000_000; // 0.05 SUI
        assert!(coin::value(&payment) >= deployment_fee, EInsufficientFunds);
        
        let fee_coin = coin::split(&mut payment, deployment_fee, ctx);
        balance::join(&mut treasury.balance, coin::into_balance(fee_coin));
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        // Security Rule: Updates force the function back to STATUS_PENDING until verified again
        let status = STATUS_PENDING;

        let metadata = table::borrow_mut(&mut project.functions, name);
        metadata.walrus_blob_id = new_walrus_blob_id;
        metadata.version = metadata.version + 1;
        metadata.status = status;

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id: new_walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID)
        });
    }

    /// Update trigger type and config for an existing function
    public entry fun update_trigger_config(
        project: &mut Project,
        name: String,
        new_trigger_type: u8,
        new_trigger_config: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let metadata = table::borrow_mut(&mut project.functions, name);
        metadata.trigger_type = new_trigger_type;
        metadata.trigger_config = new_trigger_config;
    }

    /// Re-request verification for a function
    public entry fun request_verification(
        project: &Project,
        name: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let metadata = table::borrow(&project.functions, name);

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id: metadata.walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID)
        });
    }

    /// Event emitted when a project is deleted
    public struct ProjectDeleted has copy, drop {
        project_id: ID,
        owner: address
    }

    /// Event emitted when a function is deleted
    public struct FunctionDeleted has copy, drop {
        project_id: ID,
        function_name: String
    }

    /// Delete/destroy a Project workspace object (reclaims storage rebate)
    public entry fun delete_project(
        project: Project,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);

        let Project {
            id,
            name: _,
            description: _,
            owner,
            runner_address: _,
            functions,
            vault
        } = project;

        let project_id = object::uid_to_inner(&id);
        object::delete(id);
        table::destroy_empty(functions);

        // Refund any remaining balance to the owner
        let remaining_coin = coin::from_balance(vault, ctx);
        transfer::public_transfer(remaining_coin, owner);

        event::emit(ProjectDeleted {
            project_id,
            owner
        });
    }

    /// Delete a function from a project registry
    public entry fun delete_function(
        project: &mut Project,
        name: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let _ = table::remove(&mut project.functions, name);

        event::emit(FunctionDeleted {
            project_id: object::id(project),
            function_name: name
        });
    }

    public entry fun submit_result(
        project: &mut Project,
        treasury: &mut ProtocolTreasury,
        function_name: String,
        result_data: String,
        ctx: &mut TxContext
    ) {
        // Assert runner authorization
        let runner = tx_context::sender(ctx);
        assert!(runner == project.runner_address, ENotAuthorizedRunner);
        assert!(table::contains(&project.functions, function_name), EFunctionNotFound);

        // Constant fee mapping
        let compute_fee = treasury.base_compute_fee;
        assert!(balance::value(&project.vault) >= compute_fee, EInsufficientFunds);

        // Extract fee
        let mut extracted_fee = balance::split(&mut project.vault, compute_fee);

        // 15% to protocol treasury
        let protocol_cut = (compute_fee * 15) / 100;
        let protocol_fee = balance::split(&mut extracted_fee, protocol_cut);
        balance::join(&mut treasury.balance, protocol_fee);

        // 85% to runner
        let runner_payment = coin::from_balance(extracted_fee, ctx);
        transfer::public_transfer(runner_payment, runner);
        
        event::emit(ExecutionCompleted {
            project_id: object::id(project),
            function_name,
            runner,
            result_data
        });
    }
    public entry fun withdraw_fees(
        _admin: &AdminCap,
        treasury: &mut ProtocolTreasury,
        ctx: &mut TxContext
    ) {
        let amount = balance::value(&treasury.balance);
        let coin = coin::take(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    /// Admin updates the base compute fee globally
    public entry fun update_compute_fee(
        _admin: &AdminCap,
        treasury: &mut ProtocolTreasury,
        new_fee: u64,
        _ctx: &mut TxContext
    ) {
        treasury.base_compute_fee = new_fee;
    }

    /// Admin can forcefully delete a workspace. The internal vault is refunded to the owner.
    public entry fun admin_delete_workspace(
        _admin: &AdminCap,
        project: Project,
        ctx: &mut TxContext
    ) {
        let Project { id, owner, name: _, description: _, runner_address: _, functions, vault } = project;
        table::drop(functions);
        
        if (balance::value(&vault) > 0) {
            let vault_coin = coin::from_balance(vault, ctx);
            transfer::public_transfer(vault_coin, owner);
        } else {
            balance::destroy_zero(vault);
        };
        object::delete(id);
    }
}
