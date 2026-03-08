import type { CapacitorConfig } from '@capacitor/cli';
import { Style } from '@capacitor/status-bar';

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
      overlaysWebView: true,
      style: Style.Dark,
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
