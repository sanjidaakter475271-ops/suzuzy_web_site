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

    // Broadcast endpoint for server-to-server communication
    if (req.url === '/broadcast' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { event, data } = JSON.parse(body);
                if (event) {
                    // Broadcast to all relevant rooms
                    if (data.service_number) {
                        io.to(`job:${data.service_number}`).emit(event, data);
                    }
                    if (data.job_no) {
                        io.to(`job:${data.job_no}`).emit(event, data);
                    }
                    if (data.dealer_id) {
                        io.to(`dealer:${data.dealer_id}`).emit(event, data);
                    }
                    if (data.user_id) {
                        io.to(`user:${data.user_id}`).emit(event, data);
                    }
                    if (data.technicianId || data.technician_id) {
                        const tId = data.technicianId || data.technician_id;
                        io.to(`technician:${tId}`).emit(event, data);
                    }
                    if (data.dealer_id || data.dealerId) {
                        const dId = data.dealer_id || data.dealerId;
                        io.to(`dealer:${dId}`).emit(event, data);
                    }
                    // Also generic broadcast
                    io.emit(event, data);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'broadcasted' }));
                } else {
                    throw new Error('Missing event name');
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
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
    path: '/socket.io/',
    transports: ['websocket', 'polling']
});

// Authentication Middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long-!!!123";

io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
        // Allow anonymous connections (for public tracking)
        socket.user = { role: 'anonymous' };
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach user info to socket
        socket.user = decoded;
        next();
    } catch (err) {
        // If token provided but invalid, still allow as anonymous if it's for public tracking
        console.warn('Invalid token provided, falling back to anonymous');
        socket.user = { role: 'anonymous' };
        next();
    }
});

// Connection handling
io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id} (${socket.user.role})`);

    // Join room for specific job (Publicly accessible)
    socket.on('join:job', (jobNo) => {
        socket.join(`job:${jobNo}`);
        console.log(`Socket ${socket.id} joined job:${jobNo}`);
    });

    // Join room for specific dealer or user
    socket.on('join:dealer', (dealerId) => {
        socket.join(`dealer:${dealerId}`);
        console.log(`Socket ${socket.id} joined dealer:${dealerId}`);
    });

    socket.on('join:user', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    socket.on('join:technician', (staffId) => {
        socket.join(`technician:${staffId}`);
        console.log(`Socket ${socket.id} joined technician:${staffId}`);
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

    // Handle technician location updates
    socket.on('technician:location', (data) => {
        // Broadcast to relevant rooms (e.g. dealer room where admin is watching)
        if (data.dealerId) {
            io.to(`dealer:${data.dealerId}`).emit('technician:location:update', data);
        }
        // Also broadcast globally if needed or to a specific workshop room
        io.emit('technician:location:update', data);
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
