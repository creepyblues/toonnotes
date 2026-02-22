import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/webview/index.html'),
      output: {
        dir: resolve(__dirname, 'dist'),
      },
    },
    cssCodeSplit: false,
    minify: true,
  },
  resolve: {
    alias: {
      '@toonnotes/editor-core': resolve(__dirname, '../editor-core/src'),
    },
  },
});
