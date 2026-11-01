import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const API_TARGET = process.env.API_TARGET || 'http://localhost:8080'

/** 后端未启动只提示一次，避免每个请求都刷屏 */
let offlineNotified = false

/**
 * Vite 默认会把 ECONNREFUSED 打印成一大段 http proxy error 堆栈。
 * 后端未启动是本地演示模式的正常情况，这里过滤掉该条日志，
 * 改由下面的 proxy error handler 输出一条友好提示。
 */
const logger = createLogger()
const originalError = logger.error
logger.error = (message, options) => {
  const text = typeof message === 'string' ? message : String(message ?? '')
  const isBackendRefused =
    text.includes('http proxy error') && text.includes('ECONNREFUSED')

  if (isBackendRefused) return
  originalError(message, options)
}

export default defineConfig({
  customLogger: logger,
  plugins: [vue()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 后端未启动时返回 503，前端据此自动切换到本地演示数据
        configure(proxy) {
          proxy.on('error', (error, request, response) => {
            if (!offlineNotified) {
              offlineNotified = true
              console.warn(
                `\n[proxy] 后端 ${API_TARGET} 未启动，接口已切换为本地演示数据。` +
                  '启动后端后刷新页面即可。\n'
              )
            }

            if (response && !response.headersSent) {
              response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            response?.end?.(
              JSON.stringify({ code: 503, message: '后端服务未启动，已切换为演示数据' })
            )
          })
        }
      }
    }
  }
})
