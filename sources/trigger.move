#[allow(duplicate_alias)]
module sui_functions::trigger {
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::table::{Self, Table};
    use std::string::{String};

    /// Errors
    const EFunctionNotFound: u64 = 0;
    const ENotOwner: u64 = 1;

    /// User-owned Project object
    public struct Project has key, store {
        id: UID,
        name: String,
        description: String,
        owner: address,
        functions: Table<String, FunctionMetadata>
    }

    /// Metadata for a registered function
    public struct FunctionMetadata has store, drop {
        walrus_blob_id: String,
        version: u64,
        owner: address
    }

    /// Event emitted when a new project is created
    public struct ProjectCreated has copy, drop {
        project_id: ID,
        owner: address,
        name: String
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
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let project_id = object::uid_to_inner(&id);

        let project = Project {
            id,
            name,
            description,
            owner,
            functions: table::new(ctx)
        };

        event::emit(ProjectCreated {
            project_id,
            owner,
            name
        });

        transfer::public_transfer(project, owner);
    }

    /// Register a new function inside a project
    public entry fun register_function(
        project: &mut Project,
        name: String,
        walrus_blob_id: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);

        let metadata = FunctionMetadata {
            walrus_blob_id,
            version: 1,
            owner: sender
        };
        table::add(&mut project.functions, name, metadata);
    }

    /// Trigger a function execution
    public entry fun call_function(
        project: &Project,
        name: String,
        input_data: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&project.functions, name), EFunctionNotFound);
        
        let metadata = table::borrow(&project.functions, name);
        
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
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(project.owner == sender, ENotOwner);
        assert!(table::contains(&project.functions, name), EFunctionNotFound);

        let metadata = table::borrow_mut(&mut project.functions, name);
        metadata.walrus_blob_id = new_walrus_blob_id;
        metadata.version = metadata.version + 1;
    }

    /// Submit the result of a function execution back to the blockchain
    public entry fun submit_result(
        project: &Project,
        name: String,
        result_data: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&project.functions, name), EFunctionNotFound);
        
        event::emit(ExecutionCompleted {
            project_id: object::id(project),
            function_name: name,
            runner: tx_context::sender(ctx),
            result_data
        });
    }
}
