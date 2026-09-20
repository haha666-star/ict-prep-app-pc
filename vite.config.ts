import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'ICT 网络备考助手 · 桌面版',
        short_name: 'ICT备考PC',
        description: '华为ICT大赛网络赛道备考工作台（桌面版）',
        theme_color: '#050914',
        background_color: '#050914',
        display: 'standalone',
        start_url: './',
        scope: './',
        lang: 'zh-CN',
        icons: [
          {
            src: './icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: './icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: './icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // 新版本部署后自动清理旧版本预缓存
        cleanupOutdatedCaches: true,
        // 只预缓存「应用外壳」，assets 下的 hash 资源走运行时缓存：
        // 首屏不再一次性拉全站（原来预缓存 24 个资源 ≈1MB+）
        globPatterns: [
          'index.html',
          'favicon.svg',
          'manifest.webmanifest',
          'icons/*.svg',
          'icons/*.png',
        ],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 10485760,
        runtimeCaching: [
          {
            // 哈希资源（js/css）：先返回缓存、后台更新，长期缓存 30 天
            urlPattern: ({ url }) =>
              url.pathname.includes('/assets/') &&
              /\.(js|css)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 只对 echarts/zrender 单独分包（图表库体积大且独立）。
        // 注意：不可把 react 相关包拆进 react-vendor——vendor chunk 内依赖 React 的
        // 模块（framer-motion、radix 等）会因 chunk 加载时序取到 undefined，触发
        // "Cannot read properties of undefined (reading 'createContext')" 白屏（已实测确认）。
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) return 'echarts';
          }
          if (id.includes('/src/data/quizzes')) return 'quiz-data';
          if (id.includes('/src/data/')) return 'knowledge-data';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
