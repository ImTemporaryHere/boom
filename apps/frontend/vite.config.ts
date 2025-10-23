import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: '0.0.0.0',
    port: 4200,
    hmr: {
      clientPort: 4200,
    },
    watch: {
      usePolling: true, // Required for Docker
    },
  },
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
  },
});
