// Custom entrypoint for Next.js standalone output to add Socket.io support
const http = require('http');
const path = require('path');
const { initSocket } = require('./server/socket');

// Load the compiled Next.js handler from the standalone output
// Relative to this file inside the container
const nextServerPath = path.join(__dirname, 'server.js');
const { startServer } = require(nextServerPath);

/**
 * Note: Next.js standalone server.js usually starts its own server if run directly.
 * However, we can use the 'next/dist/server/lib/render-server' directly or
 * just wrap the http.createServer call if we can intercept it.
 * 
 * Since Next.js standalone server is a generated file, the most reliable way 
 * to share a port is to use a proxy, but we want a native solution.
 * 
 * Better way: Use the 'next' server directly in a unified script.
 */

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// We'll use the Next.js standalone server as a handler if possible, 
// but it's easier to just use the unified script we created earlier 
// IF we ensure all dependencies are copied.
console.log(`Starting unified server on ${hostname}:${port}...`);
require('./server-unified.js');
