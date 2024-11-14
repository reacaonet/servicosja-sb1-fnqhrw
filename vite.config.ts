import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    proxy: {
      '/api/v3': {
        target: 'https://sandbox.asaas.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'access_token': process.env.VITE_ASAAS_API_KEY
        }
      }
    }
  }
});