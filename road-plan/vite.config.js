import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Determinamos el entorno (local o producción)
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/road-plan/' : '/',
});
