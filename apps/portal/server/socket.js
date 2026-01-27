const { Server } = require("socket.io");

/**
 * Initializes Socket.io on an existing HTTP server
 * @param {import('http').Server} httpServer 
 */
function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        path: "/api/socket/io",
        addTrailingSlash: false
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
}

module.exports = { initSocket };

// Support running standalone for local dev
if (require.main === module) {
    const { createServer } = require("http");
    const httpServer = createServer();
    initSocket(httpServer);
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`Socket.io standalone server running on port ${PORT}`);
    });
}
