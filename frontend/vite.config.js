import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Necessário para localizar as pastas

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      // Isto obriga o Vite a usar SEMPRE a mesma cópia do React
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    }
  },
  optimizeDeps: {
    // Isto força o Vite a pré-processar estas bibliotecas juntas para evitar conflitos
    include: ['react', 'react-dom', 'react-i18next', 'i18next'],
  },
})