import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ir.freightcalculator.app',
  appName: 'محاسبه کرایه بار',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
