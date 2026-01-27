const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./server/socket');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Attach Socket.io to the same HTTP server
    initSocket(httpServer);

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
        console.log(`> Realtime (Socket.io) attached on the same port at /api/socket/io`);
    });
});
