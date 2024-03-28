import wasm from 'vite-plugin-wasm'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [wasm()],
  resolve: {
    alias: {
      events: 'eventemitter3',
    },
  },
})
