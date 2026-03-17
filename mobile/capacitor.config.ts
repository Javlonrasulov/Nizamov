import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.crm.agent.delivery',
  appName: 'CRM Agent',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
