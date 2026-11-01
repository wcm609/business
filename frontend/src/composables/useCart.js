/**
 * 购物车（全局单例 + localStorage 持久化）
 * 数据仅保留渲染与下单必需字段，商品信息以服务端为准再次计算价格。
 */
import { computed, reactive, watch } from 'vue'
import { readStorage, writeStorage } from '../utils'

const STORAGE_KEY = 'cola_cart'
const MAX_QUANTITY = 99

const state = reactive({
  items: readStorage(STORAGE_KEY, [])
})

// 任意字段变化后同步到本地存储（含跨标签页刷新后的恢复）
watch(
  () => state.items,
  (items) => writeStorage(STORAGE_KEY, items),
  { deep: true }
)

const clampQuantity = (value, stock) => {
  const max = Math.max(1, Math.min(MAX_QUANTITY, Number(stock) || MAX_QUANTITY))
  return Math.min(Math.max(1, Number(value) || 1), max)
}

const add = (product, quantity = 1) => {
  if (!product) return
  const stock = Number(product.productStock) || 0
  if (stock <= 0) return

  const existing = state.items.find((item) => String(item.productId) === String(product.productId))
  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + quantity, stock)
    // 服务端价格可能变化，顺带刷新本地快照
    existing.productPrice = Number(product.productPrice)
    existing.productStock = stock
    return
  }

  state.items.push({
    productId: product.productId,
    productName: product.productName,
    productPrice: Number(product.productPrice) || 0,
    productStock: stock,
    quantity: clampQuantity(quantity, stock)
  })
}

const updateQuantity = (productId, quantity) => {
  const item = state.items.find((entry) => String(entry.productId) === String(productId))
  if (!item) return
  if (Number(quantity) <= 0) {
    remove(productId)
    return
  }
  item.quantity = clampQuantity(quantity, item.productStock)
}

const remove = (productId) => {
  state.items = state.items.filter((item) => String(item.productId) !== String(productId))
}

const clear = () => {
  state.items = []
}

const count = computed(() =>
  state.items.reduce((total, item) => total + Number(item.quantity || 0), 0)
)

const totalPrice = computed(() =>
  state.items.reduce(
    (total, item) => total + Number(item.productPrice || 0) * Number(item.quantity || 0),
    0
  )
)

const isEmpty = computed(() => state.items.length === 0)

export const useCart = () => ({
  cart: state,
  count,
  totalPrice,
  isEmpty,
  add,
  updateQuantity,
  remove,
  clear
})
