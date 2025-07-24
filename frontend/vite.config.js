// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,         // Cho phép truy cập từ máy khác
    port: 5173          // Có thể thay bằng 3000 nếu bạn thích
  }
})