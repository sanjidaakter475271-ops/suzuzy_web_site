/**
 * broadcast: Sends a signal to the Socket.io server to wake up clients.
 * Use this in your Server Actions after a successful mutation.
 */
export async function broadcast(event: string, data: Record<string, unknown> = {}) {
    const SOCKET_API = process.env.INTERNAL_SOCKET_URL || "http://localhost:3001/broadcast";

    try {
        await fetch(SOCKET_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event, data })
        });
    } catch (error) {
        // Fail silently so we don't block the main thread if socket server is down
        console.warn("Failed to broadcast signal:", error);
    }
}
