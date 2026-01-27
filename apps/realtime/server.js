/**
 * Royal Suzuky - Standalone Realtime Server
 * Socket.io server for real-time features
 */

const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Create HTTP server
const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'royal-suzuky-realtime',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    res.writeHead(404);
    res.end();
});

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

// Connection handling
io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

    // Join room for specific dealer or user
    socket.on('join:dealer', (dealerId) => {
        socket.join(`dealer:${dealerId}`);
        console.log(`Socket ${socket.id} joined dealer:${dealerId}`);
    });

    socket.on('join:user', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    // Handle inventory updates
    socket.on('inventory:update', (data) => {
        io.to(`dealer:${data.dealerId}`).emit('inventory:changed', data);
    });

    // Handle order updates
    socket.on('order:update', (data) => {
        io.to(`dealer:${data.dealerId}`).emit('order:changed', data);
        if (data.customerId) {
            io.to(`user:${data.customerId}`).emit('order:changed', data);
        }
    });

    // Handle sales updates (for live monitor)
    socket.on('sale:new', (data) => {
        io.to(`dealer:${data.dealerId}`).emit('sale:received', data);
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
        console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id} - ${reason}`);
    });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         Royal Suzuky Realtime Server                       ║
╠════════════════════════════════════════════════════════════╣
║  Status:     RUNNING                                       ║
║  Port:       ${PORT.toString().padEnd(45)}║
║  CORS:       ${CORS_ORIGIN.substring(0, 45).padEnd(45)}║
║  Transport:  WebSocket + Polling                           ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    io.close(() => {
        httpServer.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});
