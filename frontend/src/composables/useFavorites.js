/**
 * 商品收藏（全局单例 + localStorage 持久化）
 * 只存商品 ID，商品详情仍以接口数据为准。
 */
import { computed, reactive, watch } from 'vue'
import { readStorage, writeStorage } from '../utils'

const STORAGE_KEY = 'cola_favorites'

const state = reactive({
  ids: readStorage(STORAGE_KEY, [])
})

watch(
  () => state.ids,
  (ids) => writeStorage(STORAGE_KEY, ids),
  { deep: true }
)

const has = (productId) => state.ids.some((id) => String(id) === String(productId))

/** 切换收藏，返回切换后的状态 */
const toggle = (productId) => {
  const index = state.ids.findIndex((id) => String(id) === String(productId))
  if (index >= 0) {
    state.ids.splice(index, 1)
    return false
  }
  state.ids.push(productId)
  return true
}

const clear = () => {
  state.ids = []
}

const count = computed(() => state.ids.length)

export const useFavorites = () => ({ favorites: state, count, has, toggle, clear })
