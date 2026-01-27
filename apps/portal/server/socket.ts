import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer((req, res) => {
    // Simple internal webhook for Next.js to trigger events
    if (req.method === "POST" && req.url === "/broadcast") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            try {
                const { event, data } = JSON.parse(body);
                io.emit(event, data);
                res.writeHead(200);
                res.end("ok");
            } catch (e) {
                res.writeHead(400);
                res.end("invalid json");
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Configure this for production later
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
