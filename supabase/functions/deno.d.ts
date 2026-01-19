/**
 * Local Deno type definitions to resolve "Cannot find name 'Deno'" errors
 * when the Deno extension or runtime is not available.
 */

declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        toObject(): { [index: string]: string };
    }

    export const env: Env;

    export interface ServeOptions {
        port?: number;
        hostname?: string;
        onListen?: (params: { hostname: string; port: number }) => void;
        onError?: (error: unknown) => Response | Promise<Response>;
        signal?: AbortSignal;
    }

    export type ServeHandler = (
        request: Request,
        info: { remoteAddr: { transport: "tcp" | "udp"; hostname: string; port: number } }
    ) => Response | Promise<Response>;

    export function serve(handler: ServeHandler): void;
    export function serve(options: ServeOptions, handler: ServeHandler): void;

    export namespace errors {
        class WorkerRequestCancelled extends Error { }
        class WorkerAlreadyRetired extends Error { }
        class NotFound extends Error { }
        class PermissionDenied extends Error { }
        class ConnectionRefused extends Error { }
        class ConnectionReset extends Error { }
        class ConnectionAborted extends Error { }
        class NotConnected extends Error { }
        class AddrInUse extends Error { }
        class AddrNotAvailable extends Error { }
        class BrokenPipe extends Error { }
        class AlreadyExists extends Error { }
        class InvalidData extends Error { }
        class TimedOut extends Error { }
        class Interrupted extends Error { }
        class WriteZero extends Error { }
        class UnexpectedEof extends Error { }
        class BadResource extends Error { }
        class Http extends Error { }
        class Busy extends Error { }
        class NotSupported extends Error { }
    }
}
