import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' macht den Build portabel (GitHub Pages, lokale Datei, jedes Unterverzeichnis)
export default defineConfig({
  plugins: [react()],
  base: './',
})
