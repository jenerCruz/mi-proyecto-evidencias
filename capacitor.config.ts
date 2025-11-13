// capacitor.config.ts (o .json)
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tusiniciales.evidencia', // Usa tu ID de paquete aquí
  appName: 'Evidencia Gist Sync',
  webDir: 'www', // Esta es la carpeta que contiene index.html
  bundledWebRuntime: false
};

export default config;
