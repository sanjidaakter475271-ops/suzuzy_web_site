import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

// Helper to get the actual local Wi-Fi / Ethernet IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  let portalApiUrl = env.VITE_PORTAL_API_URL;
  let realtimeUrl = env.VITE_REALTIME_URL;

  // Auto-detect IP for local development
  if (mode === 'development') {
    const localIp = getLocalIp();
    portalApiUrl = `http://${localIp}:3000`;
    realtimeUrl = `http://${localIp}:3001`;
  }

  return {
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-router'],
                    'ui-vendor': ['lucide-react', 'framer-motion', 'clsx', 'tailwind-merge'],
                    'network-vendor': ['axios', 'socket.io-client'],
                    'capacitor-vendor': [
                        '@capacitor/core',
                        '@capacitor/status-bar',
                        '@capacitor/geolocation',
                        '@capacitor/network'
                    ]
                }
            }
        }
    },
    server: {
      port: 3003,
      host: '0.0.0.0',
    },
    define: {
      // Magically override the environment variables for the app
      'import.meta.env.VITE_PORTAL_API_URL': JSON.stringify(portalApiUrl),
      'import.meta.env.VITE_REALTIME_URL': JSON.stringify(realtimeUrl),
    },
    plugins: [
      react(),
      {
        name: 'env-logger',
        configureServer(server) {
          server.httpServer?.on('listening', () => {
            setTimeout(() => {
              const isLocal = mode === 'development' || portalApiUrl.includes('localhost') || portalApiUrl.includes('192.168') || portalApiUrl.includes('10.');
              const modeLabel = isLocal ? '\x1b[33mLOCAL DEV\x1b[0m' : '\x1b[32mPRODUCTION (RENDER)\x1b[0m';

              console.log(`\n  \x1b[34m➜\x1b[0m  Back-End:  ${portalApiUrl} (Auto-detected)`);
              console.log(`  \x1b[34m➜\x1b[0m  Realtime:  ${realtimeUrl}`);
              console.log(`  \x1b[34m➜\x1b[0m  Mode:      ${modeLabel}\n`);
            }, 100);
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      exclude: ['@capacitor/core', '@capacitor/android', '@capacitor/preferences', '@capacitor/network'],
      include: ['lucide-react', 'axios', 'socket.io-client']
    }
  };
});

