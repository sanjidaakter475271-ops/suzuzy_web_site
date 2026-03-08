import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suzuki.servicepro',
  appName: 'Suzuki Service Pro',
  webDir: 'dist',
  android: {
    backgroundColor: '#020617',
    allowMixedContent: true,
  },
  plugins: {
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
