<template>
  <div class="detail container page">
    <!-- 面包屑 -->
    <nav class="crumbs" aria-label="Breadcrumb">
      <RouterLink to="/products" class="crumbs__link">{{ t('detail.allProducts') }}</RouterLink>
      <span class="crumbs__sep">/</span>
      <span class="crumbs__current">{{ product?.productName || t('detail.title') }}</span>
    </nav>

    <!-- 加载骨架 -->
    <div v-if="loading" class="detail__skeleton" aria-busy="true">
      <div class="detail__skeleton-img"></div>
      <div class="detail__skeleton-info">
        <div class="line line--lg"></div>
        <div class="line line--md"></div>
        <div class="line line--full"></div>
        <div class="line line--full"></div>
        <div class="line line--md"></div>
      </div>
    </div>

    <!-- 商品不存在 -->
    <EmptyState
      v-else-if="!product"
      :title="t('detail.notFoundTitle')"
      :description="t('detail.notFoundDesc')"
    >
      <el-button type="primary" round @click="router.push('/products')">
        {{ t('detail.backToList') }}
      </el-button>
    </EmptyState>

    <template v-else>
      <div class="detail__main">
        <!-- 左侧：商品展示 -->
        <section class="gallery">
          <div class="gallery__frame">
            <span class="gallery__badge">
              <el-icon :size="12"><StarFilled /></el-icon>
              {{ t('detail.badge') }}
            </span>
            <img class="gallery__img" :src="PRODUCT_IMAGE" :alt="product.productName" />
            <span class="gallery__index">1 / 1</span>
          </div>

          <ul class="promises">
            <li>
              <el-icon :size="16"><CircleCheck /></el-icon>
              <div>
                <strong>{{ t('detail.promiseGenuineTitle') }}</strong>
                <span>{{ t('detail.promiseGenuineDesc') }}</span>
              </div>
            </li>
            <li>
              <el-icon :size="16"><RefreshLeft /></el-icon>
              <div>
                <strong>{{ t('detail.promiseReturnTitle') }}</strong>
                <span>{{ t('detail.promiseReturnDesc') }}</span>
              </div>
            </li>
            <li>
              <el-icon :size="16"><Van /></el-icon>
              <div>
                <strong>{{ t('detail.promiseFastTitle') }}</strong>
                <span>{{ t('detail.promiseFastDesc') }}</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- 右侧：商品信息 -->
        <section class="info">
          <p class="eyebrow">{{ t('detail.title') }}</p>
          <h1 class="info__title">{{ product.productName }}</h1>

          <div class="info__meta">
            <span class="stock-pill" :class="`is-${stockState.tone}`">{{ stockState.text }}</span>
            <span class="info__id">{{ t('detail.productId', { id: product.productId }) }}</span>
          </div>

          <div class="info__price">
            <span class="info__price-symbol">¥</span>
            <span class="info__price-value">{{ formatPrice(product.productPrice) }}</span>
            <span class="info__price-note">{{ t('detail.priceNote') }}</span>
          </div>

          <p class="info__desc">{{ product.productDescription || t('detail.descFallback') }}</p>

          <dl class="specs">
            <div>
              <dt>{{ t('detail.specStock') }}</dt>
              <dd>{{ t('detail.stockCount', { count: product.productStock }) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.specDate') }}</dt>
              <dd>{{ formatDay(product.productCreateTime) || t('profile.noData') }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.specShipping') }}</dt>
              <dd>{{ t('detail.specShippingValue') }}</dd>
            </div>
          </dl>

          <!-- 购买面板 -->
          <div class="buybox">
            <div class="buybox__row">
              <span class="buybox__label">{{ t('detail.qty') }}</span>
              <div class="stepper" role="group" :aria-label="t('detail.qty')">
                <button
                  type="button"
                  class="stepper__btn"
                  :aria-label="t('detail.decrease')"
                  :disabled="quantity <= 1"
                  @click="quantity = Math.max(1, quantity - 1)"
                >
                  <el-icon :size="12"><Minus /></el-icon>
                </button>
                <span class="stepper__value">{{ quantity }}</span>
                <button
                  type="button"
                  class="stepper__btn"
                  :aria-label="t('detail.increase')"
                  :disabled="quantity >= maxQuantity"
                  @click="quantity = Math.min(maxQuantity, quantity + 1)"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
              <span class="buybox__stock">{{ t('detail.maxQty', { count: maxQuantity }) }}</span>
            </div>

            <div class="buybox__row buybox__row--top">
              <label class="buybox__label" for="address">{{ t('detail.address') }}</label>
              <el-input
                id="address"
                v-model="address"
                type="textarea"
                :rows="2"
                maxlength="80"
                resize="none"
                :placeholder="t('detail.addressPlaceholder')"
              />
            </div>

            <div class="buybox__total">
              <span>{{ t('detail.total') }}</span>
              <strong>¥{{ formatPrice(totalPrice) }}</strong>
            </div>

            <div class="buybox__actions">
              <el-button
                size="large"
                class="buybox__cart"
                :disabled="soldOut"
                @click="addToCart"
              >
                <el-icon><ShoppingCart /></el-icon>
                {{ t('detail.addToCart') }}
              </el-button>
              <el-button
                type="primary"
                size="large"
                class="buybox__buy"
                :loading="ordering"
                :disabled="soldOut"
                @click="buyNow"
              >
                {{ t('detail.buyNow') }}
              </el-button>
              <button
                type="button"
                class="buybox__fav"
                :class="{ 'is-active': favorited }"
                :aria-label="favorited ? t('detail.unfavorite') : t('detail.favorite')"
                @click="toggleFavorite"
              >
                <el-icon :size="19">
                  <StarFilled v-if="favorited" />
                  <Star v-else />
                </el-icon>
              </button>
            </div>

            <p class="buybox__hint">
              <el-icon :size="12"><Lock /></el-icon>
              {{ t('detail.hint') }}
            </p>
          </div>
        </section>
      </div>

      <!-- 猜你喜欢 -->
      <section v-if="relatedProducts.length" class="related">
        <header class="related__head">
          <div>
            <h2 class="section-title">{{ t('detail.related') }}</h2>
            <p class="related__desc">{{ t('detail.relatedDesc') }}</p>
          </div>
          <RouterLink to="/products" class="related__more">
            {{ t('common.viewAll') }}
            <el-icon :size="13"><ArrowRight /></el-icon>
          </RouterLink>
        </header>
        <div class="related__grid">
          <ProductCard
            v-for="(item, index) in relatedProducts"
            :key="item.productId"
            :product="item"
            :index="index"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  CircleCheck,
  Lock,
  Minus,
  Plus,
  RefreshLeft,
  ShoppingCart,
  Star,
  StarFilled,
  Van
} from '@element-plus/icons-vue'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { LOW_STOCK, PRODUCT_IMAGE } from '../config'
import { orderApi, productApi } from '../api'
import { useCart } from '../composables/useCart'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../i18n'
import { formatDay, formatPrice, readStorage, showError, writeStorage } from '../utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { add } = useCart()
const { has, toggle } = useFavorites()

const product = ref(null)
const relatedProducts = ref([])
const loading = ref(true)
const ordering = ref(false)
const quantity = ref(1)
const address = ref(readStorage('cola_last_address', ''))

/** 最大可购数量：不能超过库存 */
const maxQuantity = computed(() => Math.max(1, Number(product.value?.productStock) || 1))
const soldOut = computed(() => Number(product.value?.productStock) <= 0)
const totalPrice = computed(
  () => (Number(product.value?.productPrice) || 0) * Number(quantity.value)
)
const favorited = computed(() => (product.value ? has(product.value.productId) : false))

const stockState = computed(() => {
  const stock = Number(product.value?.productStock) || 0
  if (stock <= 0) return { text: t('detail.stockOut'), tone: 'muted' }
  if (stock < LOW_STOCK) return { text: t('detail.stockLow', { count: stock }), tone: 'warning' }
  return { text: t('detail.stockIn'), tone: 'success' }
})

watch(address, (value) => writeStorage('cola_last_address', value))

/* ---------------- 数据加载 ---------------- */
const loadProduct = async (productId) => {
  loading.value = true
  try {
    // 先取列表：既能定位商品，也能同时准备「猜你喜欢」数据
    const listRes = await productApi.list()
    const list = Array.isArray(listRes.data) ? listRes.data : listRes.data?.records || []
    const found = list.find((item) => String(item.productId) === String(productId))

    if (found) {
      product.value = found
    } else {
      const detailRes = await productApi.detail(productId)
      product.value = detailRes.data
    }

    relatedProducts.value = list
      .filter((item) => String(item.productId) !== String(productId))
      .slice(0, 4)

    quantity.value = 1
  } catch (error) {
    product.value = null
    showError(error, t('toast.loadDetailFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProduct(route.params.id))

// 同一页面切换商品时重新加载
watch(
  () => route.params.id,
  (id) => {
    if (id) loadProduct(id)
  }
)

/* ---------------- 操作 ---------------- */
const addToCart = () => {
  if (soldOut.value) return
  add(product.value, quantity.value)
  ElMessage.success(t('toast.addedToCart'))
}

const toggleFavorite = () => {
  const active = toggle(product.value.productId)
  ElMessage.success(active ? t('toast.addedFavorite') : t('toast.removedFavorite'))
}

const buyNow = async () => {
  if (soldOut.value) return
  if (!address.value.trim()) {
    ElMessage.warning(t('cart.needAddress'))
    return
  }

  ordering.value = true
  try {
    await orderApi.create({
      productId: product.value.productId,
      orderQuantity: quantity.value,
      orderAddress: address.value.trim()
    })
    ElMessage.success(t('toast.orderSuccess'))
    router.push('/orders')
  } catch (error) {
    showError(error, t('toast.orderFailed'))
  } finally {
    ordering.value = false
  }
}
</script>

<style scoped>
/* ---------- 面包屑 ---------- */
.crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  font-size: 13px;
  color: var(--c-ink-3);
}

.crumbs__link {
  transition: color var(--dur) var(--ease-soft);
}

.crumbs__link:hover {
  color: var(--c-brand);
}

.crumbs__sep {
  color: var(--c-line-strong);
}

.crumbs__current {
  overflow: hidden;
  color: var(--c-ink-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 主体 ---------- */
.detail__main {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 44px;
  padding: 36px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-xl);
  background: var(--c-surface);
  box-shadow: var(--shadow-md);
}

/* 左侧图 */
.gallery__frame {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1 / 1.04;
  padding: 26px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(120% 100% at 50% 0%, #ffffff 0%, #f8f4ed 55%, #efe8dd 100%);
  box-shadow: inset 0 0 0 1px var(--c-line);
}

.gallery__img {
  position: absolute;
  inset: 18%;
  width: 64%;
  height: 64%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform var(--dur-slow) var(--ease-out);
}

.gallery__frame:hover .gallery__img {
  transform: scale(1.04);
}

.gallery__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--c-media-ink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.gallery__index {
  position: absolute;
  right: 18px;
  bottom: 16px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  font-size: 11px;
  color: var(--c-ink-2);
  font-variant-numeric: tabular-nums;
}

.promises {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.promises li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-bg-soft);
}

.promises .el-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--c-success);
}

.promises strong {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink);
}

.promises span {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--c-ink-3);
}

/* 右侧信息 */
.info__title {
  margin-top: 12px;
  font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
  color: var(--c-ink);
}

.info__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
}

.stock-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: 600;
}

.stock-pill.is-success {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.stock-pill.is-warning {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.stock-pill.is-muted {
  background: var(--c-surface-2);
  color: var(--c-ink-3);
}

.info__id {
  font-size: 12px;
  color: var(--c-ink-3);
  font-variant-numeric: tabular-nums;
}

.info__price {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 22px;
  padding: 18px 22px;
  border-radius: var(--radius-md);
  background: linear-gradient(120deg, var(--c-brand-soft), #fdf7f2 70%);
}

.info__price-symbol {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-brand);
}

.info__price-value {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

.info__price-note {
  margin-left: auto;
  font-size: 12px;
  color: var(--c-ink-3);
}

.info__desc {
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--c-ink-2);
}

/* 规格表 */
.specs {
  margin-top: 22px;
  border-top: 1px solid var(--c-line);
}

.specs > div {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 11px 0;
  border-bottom: 1px solid var(--c-line);
}

.specs dt {
  width: 76px;
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--c-ink-3);
}

.specs dd {
  font-size: 13.5px;
  color: var(--c-ink);
  font-weight: 500;
}

/* 购买面板 */
.buybox {
  margin-top: 24px;
  padding: 22px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-bg-soft);
}

.buybox__row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.buybox__row--top {
  align-items: flex-start;
  margin-top: 16px;
}

.buybox__label {
  width: 68px;
  flex-shrink: 0;
  padding-top: 2px;
  font-size: 13px;
  color: var(--c-ink-2);
}

.buybox__row--top .buybox__label {
  padding-top: 10px;
}

.stepper {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: #fff;
}

.stepper__btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--c-ink-2);
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

.stepper__btn:hover:not(:disabled) {
  color: var(--c-brand);
  background: var(--c-brand-soft);
}

.stepper__btn:disabled {
  color: var(--c-line-strong);
  cursor: not-allowed;
}

.stepper__value {
  min-width: 38px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.buybox__stock {
  font-size: 12px;
  color: var(--c-ink-3);
}

.buybox__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed var(--c-line-strong);
  font-size: 13px;
  color: var(--c-ink-2);
}

.buybox__total strong {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

.buybox__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.buybox__cart {
  flex: 1;
  height: 48px;
}

.buybox__buy {
  flex: 1;
  height: 48px;
  font-weight: 600;
}

.buybox__fav {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: #fff;
  color: var(--c-ink-3);
  transition: all var(--dur) var(--ease-soft);
}

.buybox__fav:hover {
  color: var(--c-gold);
  border-color: var(--c-gold);
  transform: translateY(-2px);
}

.buybox__fav.is-active {
  color: var(--c-gold);
  border-color: var(--c-gold);
  background: var(--c-gold-soft);
}

.buybox__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 11.5px;
  color: var(--c-ink-3);
}

/* ---------- 猜你喜欢 ---------- */
.related {
  margin-top: 48px;
}

.related__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.related__desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--c-ink-3);
}

.related__more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-2);
  transition: color var(--dur) var(--ease-soft), gap var(--dur) var(--ease-soft);
}

.related__more:hover {
  gap: 8px;
  color: var(--c-brand);
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

/* ---------- 骨架屏 ---------- */
.detail__skeleton {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 44px;
  padding: 36px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-xl);
  background: var(--c-surface);
}

.detail__skeleton-img,
.detail__skeleton-info .line {
  background: linear-gradient(100deg, #f1ece4 30%, #f8f4ee 50%, #f1ece4 70%);
  background-size: 300% 100%;
  animation: shimmer 1.4s infinite linear;
}

.detail__skeleton-img {
  aspect-ratio: 1 / 1.04;
  border-radius: var(--radius-lg);
}

.detail__skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.detail__skeleton-info .line {
  height: 14px;
  border-radius: var(--radius-pill);
}

.line--lg {
  width: 70%;
  height: 28px;
}

.line--md {
  width: 45%;
}

.line--full {
  width: 100%;
}

@keyframes shimmer {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -150% 0;
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 1000px) {
  .detail__main {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 24px;
  }

  .gallery__frame {
    aspect-ratio: 1 / 0.8;
    padding: 30px;
  }

  .related__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .detail__skeleton {
    grid-template-columns: 1fr;
    padding: 24px;
  }
}

@media (max-width: 560px) {
  .promises {
    grid-template-columns: 1fr;
  }

  .buybox {
    padding: 18px;
  }

  .buybox__actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px;
    gap: 8px;
  }

  .buybox__cart,
  .buybox__buy {
    min-width: 0;
    padding: 0 8px;
    font-size: 13px;
  }

  .buybox__cart .el-icon {
    display: none;
  }

  .buybox__fav {
    width: 44px;
    height: 44px;
  }

  .related__grid {
    grid-template-columns: 1fr;
  }
}
</style>
