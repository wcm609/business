/**
 * 主题（浅色 / 深色）
 *
 * - 持久化到 localStorage
 * - 首次进入时若没有偏好，跟随系统 prefers-color-scheme
 * - 同时设置 data-theme（供项目样式使用）和 .dark（供 Element Plus 使用）
 */
import { computed, reactive } from 'vue'

const STORAGE_KEY = 'cola_theme'
const THEMES = ['light', 'dark']

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(saved)) return saved
  } catch {
    /* 忽略存储异常 */
  }

  // index.html 的预加载脚本会提前写入 data-theme，避免首屏闪烁
  const preset = document.documentElement.dataset.theme
  if (THEMES.includes(preset)) return preset

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const state = reactive({
  theme: getInitialTheme()
})

const applyTheme = (theme) => {
  const isDark = theme === 'dark'
  const root = document.documentElement

  root.dataset.theme = theme
  root.classList.toggle('dark', isDark)

  // 让移动端浏览器的地址栏颜色跟随主题
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    isDark ? '#141210' : '#f6f4ef'
  )
}

applyTheme(state.theme)

export const theme = computed(() => state.theme)
export const isDark = computed(() => state.theme === 'dark')

export const setTheme = (next) => {
  if (!THEMES.includes(next)) return
  state.theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 忽略存储异常 */
  }
  applyTheme(next)
}

export const toggleTheme = () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark')
}

export const useTheme = () => ({
  theme,
  isDark,
  setTheme,
  toggleTheme
})
