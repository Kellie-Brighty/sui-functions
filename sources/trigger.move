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
    use sui::clock::{Self, Clock};

    /// Errors
    const EFunctionNotFound: u64 = 0;
    const ENotOwner: u64 = 1;
    const ENotAuthorizedRunner: u64 = 2;
    const EFunctionNotVerified: u64 = 3;
    const EInsufficientFunds: u64 = 4;
    const EInsufficientStake: u64 = 5;
    const ETooFrequent: u64 = 6;

    /// Status constants
    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// Global almighty platform auditor blob ID (immutable check)
    const GLOBAL_AUDITOR_BLOB_ID: vector<u8> = b"TJgeWW4t-MOv1K2klEsC0eDTDZbmcUu610eHptXD9mA";

    public struct ExecutionRecord has store, drop {
        assigned_runner: address,
        timestamp_ms: u64,
        completed: bool
    }

    /// User-owned Project object
    public struct Project has key, store {
        id: UID,
        name: String,
        description: String,
        owner: address,
        runner_address: address,
        execution_mode: u8,
        functions: Table<String, FunctionMetadata>,
        vault: Balance<SUI>,
        execution_nonce: u64,
        executions: Table<u64, ExecutionRecord>,
        verification_nonce: u64,
        verifications: Table<u64, ExecutionRecord>
    }

    public struct PublicPoolRegistry has key {
        id: UID,
        active_nodes: vector<address>,
        stakes: Table<address, u64>
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
        trigger_config: String,
        last_execution_time: u64
    }

    /// Represents a staked Node Operator in the network
    public struct NodeOperator has key, store {
        id: UID,
        owner: address,
        runner_address: address,
        staked_sui: Balance<SUI>
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
        auditor_blob_id: String,
        assigned_runner: address,
        nonce: u64
    }

    /// Event emitted when a function execution is triggered
    public struct ExecutionTriggered has copy, drop {
        project_id: ID,
        function_name: String,
        walrus_blob_id: String,
        caller: address,
        input_data: String,
        execution_mode: u8,
        assigned_runner: address,
        nonce: u64
    }

    /// Event emitted when the backend runner completes execution and submits the result
    public struct ExecutionCompleted has copy, drop {
        project_id: ID,
        function_name: String,
        runner: address,
        result_data: String
    }

    /// Event emitted when an operator stakes SUI
    public struct NodeStaked has copy, drop {
        operator_id: ID,
        owner: address,
        amount: u64
    }

    /// Event emitted when an operator links a runner address
    public struct RunnerLinked has copy, drop {
        operator_id: ID,
        owner: address,
        runner_address: address
    }

    /// Event emitted when an operator unstakes SUI
    public struct NodeUnstaked has copy, drop {
        operator_id: ID,
        owner: address,
        amount: u64
    }

    public struct ProjectDeleted has copy, drop {
        project_id: ID,
        owner: address
    }

    public struct FunctionDeleted has copy, drop {
        project_id: ID,
        function_name: String
    }

    fun assign_public_runner(registry: &PublicPoolRegistry, clock: &Clock): address {
        let len = std::vector::length(&registry.active_nodes);
        if (len == 0) return @0x0;
        let index = (clock::timestamp_ms(clock) % (len as u64));
        *std::vector::borrow(&registry.active_nodes, index)
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
            execution_mode: 0,
            functions: table::new(ctx),
            vault: balance::zero(),
            execution_nonce: 0,
            executions: table::new(ctx),
            verification_nonce: 0,
            verifications: table::new(ctx)
        };

        event::emit(ProjectCreated {
            project_id,
            owner,
            name
        });

        transfer::public_share_object(project);
    }

    /// Initialize the protocol treasury and registry
    fun init(ctx: &mut TxContext) {
        let treasury = ProtocolTreasury {
            id: object::new(ctx),
            balance: balance::zero(),
            base_compute_fee: 7_000_000 // default 0.007 SUI
        };
        transfer::share_object(treasury);

        let registry = PublicPoolRegistry {
            id: object::new(ctx),
            active_nodes: std::vector::empty(),
            stakes: table::new(ctx)
        };
        transfer::share_object(registry);

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

    /// Stake SUI to become a Node Operator (Minimum 0.5 SUI)
    public entry fun stake_node(
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let min_stake = 500_000_000; // 0.5 SUI
        let amount = coin::value(&payment);
        assert!(amount >= min_stake, EInsufficientStake);
        
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let operator_id = object::uid_to_inner(&id);

        let operator = NodeOperator {
            id,
            owner,
            runner_address: @0x0,
            staked_sui: coin::into_balance(payment)
        };

        event::emit(NodeStaked {
            operator_id,
            owner,
            amount
        });

        transfer::public_transfer(operator, owner);
    }

    /// Update execution mode (0 = Public Compute, 1 = Dedicated Runner)
    public entry fun update_execution_mode(
        project: &mut Project,
        new_mode: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(new_mode == 0 || new_mode == 1, 99);
        project.execution_mode = new_mode;
    }

    /// Link a runner address to a staked NodeOperator
    public entry fun link_runner_address(
        operator: &mut NodeOperator,
        runner_address: address,
        registry: &mut PublicPoolRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(operator.owner == sender, ENotOwner);
        operator.runner_address = runner_address;

        if (!table::contains(&registry.stakes, runner_address)) {
            std::vector::push_back(&mut registry.active_nodes, runner_address);
            table::add(&mut registry.stakes, runner_address, balance::value(&operator.staked_sui));
        } else {
            let stake_ref = table::borrow_mut(&mut registry.stakes, runner_address);
            *stake_ref = balance::value(&operator.staked_sui);
        };

        event::emit(RunnerLinked {
            operator_id: object::id(operator),
            owner: sender,
            runner_address
        });
    }

    /// Unstake and destroy the NodeOperator object, refunding SUI
    public entry fun unstake_node(
        operator: NodeOperator,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(operator.owner == sender, ENotOwner);

        let NodeOperator {
            id,
            owner,
            runner_address: _,
            staked_sui
        } = operator;

        let operator_id = object::uid_to_inner(&id);
        let amount = balance::value(&staked_sui);

        object::delete(id);
        
        let refund_coin = coin::from_balance(staked_sui, ctx);
        transfer::public_transfer(refund_coin, owner);

        event::emit(NodeUnstaked {
            operator_id,
            owner,
            amount
        });
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
        registry: &PublicPoolRegistry,
        clock: &Clock,
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
            trigger_config,
            last_execution_time: 0
        };
        table::add(&mut project.functions, name, metadata);

        let assigned_runner = if (project.execution_mode == 1) {
            project.runner_address
        } else {
            assign_public_runner(registry, clock)
        };
        
        let nonce = project.verification_nonce;
        project.verification_nonce = nonce + 1;
        table::add(&mut project.verifications, nonce, ExecutionRecord {
            assigned_runner,
            timestamp_ms: clock::timestamp_ms(clock),
            completed: false
        });

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID),
            assigned_runner,
            nonce
        });
    }

    /// Confirm or reject the verification of a pending function
    public entry fun confirm_verification(
        project: &mut Project,
        name: String,
        approved: bool,
        nonce: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);
        assert!(table::contains(&project.verifications, nonce), 999);

        let record = table::borrow_mut(&mut project.verifications, nonce);
        assert!(!record.completed, 888);

        if (project.execution_mode == 1) {
            assert!(sender == project.runner_address, ENotAuthorizedRunner);
        } else {
            if (sender != record.assigned_runner) {
                assert!(clock::timestamp_ms(clock) >= record.timestamp_ms + 10_000, ENotAuthorizedRunner);
            };
        };

        record.completed = true;

        let metadata = table::borrow_mut(&mut project.functions, name);
        if (approved) {
            metadata.status = STATUS_VERIFIED;
        } else {
            metadata.status = STATUS_REJECTED;
        };
    }

    /// Trigger off-chain execution of a function
    public entry fun call_function(
        project: &mut Project,
        name: String,
        input_data: String,
        registry: &PublicPoolRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&project.functions, name), EFunctionNotFound);
        
        let walrus_blob_id;
        {
            let metadata = table::borrow_mut(&mut project.functions, name);
            assert!(metadata.status == STATUS_VERIFIED, EFunctionNotVerified);

            // Enforce 15 seconds cooldown to prevent duplicate triggers
            let current_time = clock::timestamp_ms(clock);
            let cooldown_period = 15000;
            assert!(current_time >= metadata.last_execution_time + cooldown_period, ETooFrequent);
            metadata.last_execution_time = current_time;

            walrus_blob_id = metadata.walrus_blob_id;
        };

        let assigned_runner = if (project.execution_mode == 1) {
            project.runner_address
        } else {
            assign_public_runner(registry, clock)
        };

        let nonce = project.execution_nonce;
        project.execution_nonce = nonce + 1;
        table::add(&mut project.executions, nonce, ExecutionRecord {
            assigned_runner,
            timestamp_ms: clock::timestamp_ms(clock),
            completed: false
        });

        event::emit(ExecutionTriggered {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id,
            caller: tx_context::sender(ctx),
            input_data,
            execution_mode: project.execution_mode,
            assigned_runner,
            nonce
        });
    }

    /// Update an existing function's Walrus ID inside a project
    public entry fun update_function(
        project: &mut Project,
        name: String,
        new_walrus_blob_id: String,
        treasury: &mut ProtocolTreasury,
        mut payment: Coin<SUI>,
        registry: &PublicPoolRegistry,
        clock: &Clock,
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
        metadata.last_execution_time = 0;

        let assigned_runner = if (project.execution_mode == 1) {
            project.runner_address
        } else {
            assign_public_runner(registry, clock)
        };
        
        let nonce = project.verification_nonce;
        project.verification_nonce = nonce + 1;
        table::add(&mut project.verifications, nonce, ExecutionRecord {
            assigned_runner,
            timestamp_ms: clock::timestamp_ms(clock),
            completed: false
        });

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id: new_walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID),
            assigned_runner,
            nonce
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
        project: &mut Project,
        name: String,
        registry: &PublicPoolRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let metadata = table::borrow(&project.functions, name);

        let assigned_runner = if (project.execution_mode == 1) {
            project.runner_address
        } else {
            assign_public_runner(registry, clock)
        };
        
        let nonce = project.verification_nonce;
        project.verification_nonce = nonce + 1;
        table::add(&mut project.verifications, nonce, ExecutionRecord {
            assigned_runner,
            timestamp_ms: clock::timestamp_ms(clock),
            completed: false
        });

        // Emit verification request with the global platform auditor ID
        event::emit(VerificationRequested {
            project_id: object::id(project),
            function_name: name,
            walrus_blob_id: metadata.walrus_blob_id,
            auditor_blob_id: std::string::utf8(GLOBAL_AUDITOR_BLOB_ID),
            assigned_runner,
            nonce
        });
    }

    /// Delete/destroy a Project workspace object (reclaims storage rebate)
    public entry fun delete_project(
        project: Project,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);

        let Project { id, owner, name: _, description: _, runner_address: _, execution_mode: _, functions, vault, execution_nonce: _, executions, verification_nonce: _, verifications } = project;
        let project_id = object::uid_to_inner(&id);
        
        table::drop(functions);
        table::drop(executions);
        table::drop(verifications);
        object::delete(id);

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
        nonce: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let runner = tx_context::sender(ctx);
        assert!(table::contains(&project.functions, function_name), EFunctionNotFound);
        assert!(table::contains(&project.executions, nonce), 999);

        let record = table::borrow_mut(&mut project.executions, nonce);
        assert!(!record.completed, 888);

        if (project.execution_mode == 1) {
            assert!(runner == project.runner_address, ENotAuthorizedRunner);
        } else {
            if (runner != record.assigned_runner) {
                assert!(clock::timestamp_ms(clock) >= record.timestamp_ms + 10_000, ENotAuthorizedRunner);
            };
        };

        record.completed = true;

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
        let Project { id, owner, name: _, description: _, runner_address: _, execution_mode: _, functions, vault, execution_nonce: _, executions, verification_nonce: _, verifications } = project;
        table::drop(functions);
        table::drop(executions);
        table::drop(verifications);
        
        if (balance::value(&vault) > 0) {
            let vault_coin = coin::from_balance(vault, ctx);
            transfer::public_transfer(vault_coin, owner);
        } else {
            balance::destroy_zero(vault);
        };
        object::delete(id);
    }
}
