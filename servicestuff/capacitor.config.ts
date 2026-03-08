import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suzuki.servicepro',
  appName: 'Suzuki Service Pro',
  webDir: 'dist',
  android: {
    backgroundColor: '#020617',
    allowMixedContent: true,
    adjustMarginsForEdgeToEdge: 'auto',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#020617',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    BarcodeScannerPlugin: {
      lensFacing: 'back',
    },
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
