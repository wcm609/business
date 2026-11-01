/**
 * 轻量国际化（i18n）
 *
 * 项目只需中 / 英两种语言，且没有插值以外的复杂需求，
 * 因此不引入额外依赖，用 reactive + 文案字典实现：
 * - t(key, params) 支持 {name} 占位符
 * - 切换语言后所有调用 t() 的组件会自动重新渲染
 * - 语言持久化到 localStorage，并同步 <html lang>
 */
import { computed, reactive } from 'vue'
import zh from './zh'
import en from './en'

const STORAGE_KEY = 'cola_locale'
const SUPPORTED = ['zh', 'en']
const dictionaries = { zh, en }

const readLocale = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED.includes(saved)) return saved
  } catch {
    /* localStorage 不可用时使用默认语言 */
  }
  return 'zh'
}

const state = reactive({
  locale: readLocale()
})

/** 解析 "a.b.c" 形式的扁平键 */
const resolve = (dictionary, key) => dictionary?.[key]

const applyDocumentLang = () => {
  document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : 'en'
}

applyDocumentLang()

/**
 * 翻译函数
 * @param {string} key 文案键
 * @param {Record<string, string|number>} params 占位符参数
 */
export const t = (key, params = {}) => {
  const current = resolve(dictionaries[state.locale], key)
  const fallback = resolve(dictionaries.zh, key)
  const template = current ?? fallback ?? key

  if (typeof template !== 'string') return key

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match
  )
}

/** 当前语言 */
export const locale = computed(() => state.locale)

/** 切换语言 */
export const setLocale = (next) => {
  if (!SUPPORTED.includes(next)) return
  state.locale = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 忽略存储异常 */
  }
  applyDocumentLang()
}

export const toggleLocale = () => {
  setLocale(state.locale === 'zh' ? 'en' : 'zh')
}

/** 组件内使用 */
export const useI18n = () => ({
  locale,
  t,
  setLocale,
  toggleLocale
})
