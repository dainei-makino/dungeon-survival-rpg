import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src/html',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { main: resolve(__dirname, 'src/html/index.html') }
    }
  }
});
