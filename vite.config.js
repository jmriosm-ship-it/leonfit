import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()], 
    base: '/leonfit/',
    server: { port: 5175 }
})
