import ivm from 'isolated-vm';

/**
 * Executes the provided code in a secure sandbox.
 * @param code The JS code string to execute.
 */
export async function executeInSandbox(code: string, inputData: string = '{}'): Promise<any> {
    // Create a new isolate with 128MB memory limit
    const isolate = new ivm.Isolate({ memoryLimit: 128 });

    // Create a new context
    const context = await isolate.createContext();

    // Get a Reference{} to the global object within the context
    const jail = context.global;

    // Inject inputData variable
    await jail.set('rawInputData', inputData);

    // 1. Inject console.log mapping
    await jail.set('log', new ivm.Reference(function(...args: any[]) {
        console.log('[VM]', ...args);
    }));

    // 2. Inject async fetch shim mapping
    await jail.set('fetchShim', new ivm.Reference(async function(url: string) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            return text;
        } catch (e: any) {
            return JSON.stringify({ error: e.message });
        }
    }));

    // Prepend shims for console.log, async fetch, TextEncoder and TextDecoder
    const shimmedCode = `
        globalThis.console = {
            log: (...args) => log.applySync(undefined, args, { arguments: { copy: true } })
        };
        globalThis.fetch = async (url) => {
            const text = await fetchShim.apply(undefined, [url], { result: { promise: true, copy: true } });
            return {
                text: async () => text,
                json: async () => JSON.parse(text)
            };
        };
        globalThis.TextEncoder = class TextEncoder {
            encode(str) {
                const arr = new Uint8Array(str.length);
                for (let i = 0; i < str.length; i++) {
                    arr[i] = str.charCodeAt(i) & 0xff;
                }
                return arr;
            }
        };
        globalThis.TextDecoder = class TextDecoder {
            decode(arr) {
                let str = "";
                for (let i = 0; i < arr.length; i++) {
                    str += String.fromCharCode(arr[i]);
                }
                return str;
            }
        };
        globalThis.inputData = rawInputData;
        try {
            globalThis.input = JSON.parse(rawInputData);
        } catch (e) {
            globalThis.input = {};
        }
        (async function() {
            ${code}
        })()
    `;

    try {
        // Compile the code
        const script = await isolate.compileScript(shimmedCode);

        // Execute with a 5 second timeout, copying the result, and supporting async/Promise resolution
        const result = await script.run(context, { timeout: 5000, copy: true, promise: true });
        
        return result;
    } catch (error: any) {
        throw new Error(`Execution failed: ${error.message}`);
    } finally {
        // Clean up
        context.release();
        isolate.dispose();
    }
}
