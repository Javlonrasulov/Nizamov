import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const singlefile = process.env.SINGLEFILE_BUILD === '1'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // dev.sainur.uz: ba'zi nginx sozlamalarida /assets/*.js HTML qaytaradi;
    // SINGLEFILE_BUILD=1 — bitta index.html (ichida JS/CSS), alohida asset so'rovi yo'q.
    ...(singlefile ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
