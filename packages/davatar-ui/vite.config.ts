import * as path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  lib: {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    name: 'davatar-ui',
    fileName: 'index.js',
  },
  plugins: [react()],
});
