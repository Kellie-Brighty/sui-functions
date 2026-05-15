#[allow(duplicate_alias)]
module sui_functions::trigger {
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::table::{Self, Table};
    use std::string::{String};

    /// Errors
    const EFunctionNotFound: u64 = 0;

    /// Shared Registry object
    public struct Registry has key {
        id: UID,
        functions: Table<String, FunctionMetadata>
    }

    /// Metadata for a registered function
    public struct FunctionMetadata has store, drop {
        walrus_blob_id: String,
        version: u64,
        owner: address
    }

    /// Event emitted when a function execution is triggered
    public struct ExecutionTriggered has copy, drop {
        function_name: String,
        walrus_blob_id: String,
        caller: address,
        input_data: String
    }

    /// Initialize the registry
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            functions: table::new(ctx)
        };
        transfer::share_object(registry);
    }

    /// Register a new function mapping a name to a Walrus Blob ID
    public entry fun register_function(
        registry: &mut Registry,
        name: String,
        walrus_blob_id: String,
        ctx: &mut TxContext
    ) {
        let metadata = FunctionMetadata {
            walrus_blob_id,
            version: 1,
            owner: tx_context::sender(ctx)
        };
        table::add(&mut registry.functions, name, metadata);
    }

    /// Trigger a function execution
    public entry fun call_function(
        registry: &Registry,
        name: String,
        input_data: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.functions, name), EFunctionNotFound);
        
        let metadata = table::borrow(&registry.functions, name);
        
        event::emit(ExecutionTriggered {
            function_name: name,
            walrus_blob_id: metadata.walrus_blob_id,
            caller: tx_context::sender(ctx),
            input_data
        });
    }

    /// Update an existing function's Walrus ID
    public entry fun update_function(
        registry: &mut Registry,
        name: String,
        new_walrus_blob_id: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.functions, name), EFunctionNotFound);
        let metadata = table::borrow_mut(&mut registry.functions, name);
        
        // Only owner can update
        assert!(metadata.owner == tx_context::sender(ctx), 1);
        
        metadata.walrus_blob_id = new_walrus_blob_id;
        metadata.version = metadata.version + 1;
    }
}
