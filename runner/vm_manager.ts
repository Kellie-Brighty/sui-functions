import ivm from 'isolated-vm';

/**
 * Executes the provided code in a secure sandbox.
 * @param code The JS code string to execute.
 */
export async function executeInSandbox(code: string): Promise<any> {
    // Create a new isolate with 128MB memory limit
    const isolate = new ivm.Isolate({ memoryLimit: 128 });

    // Create a new context
    const context = await isolate.createContext();

    // Get a Reference{} to the global object within the context
    const jail = context.global;

    // This is the critical step: Inject a global 'log' function
    // that maps back to the host's console.log
    await jail.set('log', new ivm.Reference(function(...args: any[]) {
        console.log('[VM]', ...args);
    }));

    // Prepend a small shim to map console.log to our injected log function
    const shimmedCode = `
        globalThis.console = {
            log: (...args) => log.applySync(undefined, args, { arguments: { copy: true } })
        };
        (function() {
            ${code}
        })()
    `;

    try {
        // Compile the code
        const script = await isolate.compileScript(shimmedCode);

        // Execute with a 5 second timeout and copy the result from the sandbox
        const result = await script.run(context, { timeout: 5000, copy: true });
        
        return result;
    } catch (error: any) {
        throw new Error(`Execution failed: ${error.message}`);
    } finally {
        // Clean up
        context.release();
        isolate.dispose();
    }
}
