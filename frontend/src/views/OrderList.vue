<template>
  <div class="orders container page">
    <!-- 页头 -->
    <header class="orders__head">
      <div>
        <p class="eyebrow">{{ t('orders.eyebrow') }}</p>
        <h1 class="page-title">{{ t('orders.title') }}</h1>
        <p class="page-subtitle">{{ t('orders.subtitle') }}</p>
      </div>
      <el-button round class="orders__back" @click="router.push('/products')">
        <el-icon><ArrowLeft /></el-icon>
        {{ t('orders.continueShopping') }}
      </el-button>
    </header>

    <!-- 状态筛选 -->
    <div class="tabs" role="tablist" :aria-label="t('orders.title')">
      <button
        v-for="tab in orderTabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="tabs__item"
        :class="{ 'is-active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ t(tab.labelKey) }}
        <span class="tabs__count">{{ countOf(tab.key) }}</span>
      </button>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="order-list" aria-busy="true">
      <div v-for="n in 3" :key="n" class="order-skeleton">
        <div class="order-skeleton__head">
          <span class="line line--sm"></span>
          <span class="line line--xs"></span>
        </div>
        <div class="order-skeleton__body">
          <span class="order-skeleton__img"></span>
          <div class="order-skeleton__lines">
            <span class="line line--md"></span>
            <span class="line line--full"></span>
            <span class="line line--sm"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else-if="filteredOrders.length === 0"
      :icon="ShoppingCart"
      :title="emptyText.title"
      :description="emptyText.description"
    >
      <el-button type="primary" round @click="router.push('/products')">
        <el-icon><ShoppingBag /></el-icon>
        {{ t('common.browse') }}
      </el-button>
    </EmptyState>

    <!-- 订单列表 -->
    <div v-else class="order-list">
      <article v-for="order in filteredOrders" :key="order.orderId" class="order">
        <header class="order__head">
          <div class="order__meta">
            <span class="order__id">
              {{ t('orders.orderId') }} <strong>#{{ order.orderId }}</strong>
            </span>
            <span class="order__sep" aria-hidden="true"></span>
            <time class="order__time">{{ formatDate(order.orderCreateTime) }}</time>
          </div>
          <span class="status" :class="`status--${getOrderStatus(order.orderStatus).tone}`">
            <i class="status__dot" aria-hidden="true"></i>
            {{ t(getOrderStatus(order.orderStatus).labelKey) }}
          </span>
        </header>

        <div class="order__body">
          <RouterLink :to="`/product/${order.productId}`" class="order__thumb">
            <img :src="PRODUCT_IMAGE" alt="" />
          </RouterLink>

          <div class="order__product">
            <RouterLink :to="`/product/${order.productId}`" class="order__name">
              {{ order.productName || t('orders.productFallback', { id: order.productId }) }}
            </RouterLink>
            <p class="order__desc">{{ order.productDescription || t('card.descFallback') }}</p>
            <div class="order__tags">
              <span>{{ t('orders.quantity', { count: order.orderQuantity }) }}</span>
              <span>{{ t('orders.unitPrice', { price: formatPrice(order.productPrice) }) }}</span>
            </div>
          </div>

          <div class="order__amount">
            <span>{{ t('orders.amount') }}</span>
            <strong>¥{{ formatPrice(order.orderPrice) }}</strong>
          </div>
        </div>

        <footer class="order__foot">
          <p class="order__address">
            <el-icon :size="13"><Location /></el-icon>
            {{ order.orderAddress || t('orders.addressMissing') }}
          </p>

          <div class="order__actions">
            <el-button
              v-if="Number(order.orderStatus) === 0"
              round
              @click="handleCancel(order)"
            >
              {{ t('orders.cancel') }}
            </el-button>
            <el-button
              v-if="Number(order.orderStatus) === 0"
              type="primary"
              round
              :loading="processingId === order.orderId"
              @click="handlePay(order)"
            >
              {{ t('orders.pay') }}
            </el-button>
            <el-button
              v-if="Number(order.orderStatus) === 1"
              type="primary"
              round
              :loading="processingId === order.orderId"
              @click="handleConfirm(order)"
            >
              {{ t('orders.confirm') }}
            </el-button>
            <el-button
              v-if="Number(order.orderStatus) === 3"
              round
              @click="router.push(`/product/${order.productId}`)"
            >
              {{ t('orders.buyAgain') }}
            </el-button>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Location, ShoppingBag, ShoppingCart } from '@element-plus/icons-vue'
import EmptyState from '../components/EmptyState.vue'
import { PRODUCT_IMAGE } from '../config'
import { orderApi } from '../api'
import { useI18n } from '../i18n'
import { formatDate, formatPrice, getOrderStatus, orderTabs, showError } from '../utils'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const orders = ref([])
const loading = ref(true)
const activeTab = ref('all')
const processingId = ref(null)

/* ---------------- 计算 ---------------- */
const filteredOrders = computed(() => {
  const list = [...orders.value].sort((a, b) =>
    String(b.orderCreateTime || '').localeCompare(String(a.orderCreateTime || ''))
  )
  if (activeTab.value === 'all') return list
  return list.filter((order) => String(order.orderStatus) === activeTab.value)
})

const countOf = (key) => {
  if (key === 'all') return orders.value.length
  return orders.value.filter((order) => String(order.orderStatus) === key).length
}

const emptyText = computed(() => {
  if (activeTab.value === 'all') {
    return {
      title: t('orders.emptyAllTitle'),
      description: t('orders.emptyAllDesc')
    }
  }
  const tab = orderTabs.find((item) => item.key === activeTab.value)
  return {
    title: t('orders.emptyFilterTitle', { status: tab ? t(tab.labelKey) : '' }),
    description: t('orders.emptyFilterDesc')
  }
})

/* ---------------- 数据加载 ---------------- */
const loadOrders = async () => {
  loading.value = true
  try {
    const res = await orderApi.list()
    orders.value = Array.isArray(res.data) ? res.data : res.data?.records || []
  } catch (error) {
    orders.value = []
    showError(error, t('orders.loadError'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (typeof route.query.tab === 'string') {
    const valid = orderTabs.some((tab) => tab.key === route.query.tab)
    activeTab.value = valid ? route.query.tab : 'all'
  }
  loadOrders()
})

watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === 'string' && orderTabs.some((item) => item.key === tab)) {
      activeTab.value = tab
    }
  }
)

/* ---------------- 订单操作 ---------------- */
const handlePay = async (order) => {
  processingId.value = order.orderId
  try {
    await orderApi.pay(order.orderId)
    ElMessage.success(t('orders.paySuccess'))
    await loadOrders()
  } catch (error) {
    showError(error, t('orders.payFailed'))
  } finally {
    processingId.value = null
  }
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(t('orders.cancelMessage'), t('orders.cancelTitle'), {
      confirmButtonText: t('orders.cancelConfirm'),
      cancelButtonText: t('orders.cancelBack'),
      type: 'warning'
    })
  } catch {
    return
  }

  processingId.value = order.orderId
  try {
    await orderApi.cancel(order.orderId)
    ElMessage.success(t('orders.cancelSuccess'))
    await loadOrders()
  } catch (error) {
    showError(error, t('orders.cancelFailed'))
  } finally {
    processingId.value = null
  }
}

const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm(t('orders.confirmMessage'), t('orders.confirmTitle'), {
      confirmButtonText: t('orders.confirmConfirm'),
      cancelButtonText: t('orders.confirmBack'),
      type: 'info'
    })
  } catch {
    return
  }

  processingId.value = order.orderId
  try {
    await orderApi.confirm(order.orderId)
    ElMessage.success(t('orders.confirmSuccess'))
    await loadOrders()
  } catch (error) {
    showError(error, t('orders.confirmFailed'))
  } finally {
    processingId.value = null
  }
}
</script>

<style scoped>
.orders__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.orders__back {
  height: 42px;
}

/* ---------- 状态标签 ---------- */
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px;
  margin-bottom: 22px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
}

.tabs__item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-2);
  transition: all var(--dur) var(--ease-soft);
}

.tabs__item:hover {
  color: var(--c-ink);
  background: var(--c-bg-soft);
}

.tabs__item.is-active {
  background: var(--c-solid);
  color: var(--c-on-solid);
  box-shadow: 0 8px 18px -12px rgba(25, 23, 19, 0.9);
}

.tabs__count {
  min-width: 20px;
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  background: rgba(25, 23, 19, 0.07);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.tabs__item.is-active .tabs__count {
  background: rgba(255, 255, 255, 0.18);
}

/* ---------- 订单列表 ---------- */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order {
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--dur) var(--ease-soft), transform var(--dur) var(--ease-soft),
    border-color var(--dur) var(--ease-soft);
  animation: rise-in 0.4s var(--ease-out) both;
}

.order:hover {
  transform: translateY(-2px);
  border-color: var(--c-line-strong);
  box-shadow: var(--shadow-md);
}

.order__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--c-line);
  background: var(--c-bg-soft);
}

.order__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.order__id {
  font-size: 12.5px;
  color: var(--c-ink-3);
}

.order__id strong {
  color: var(--c-ink);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.02em;
}

.order__sep {
  width: 1px;
  height: 12px;
  background: var(--c-line-strong);
}

.order__time {
  font-size: 12px;
  color: var(--c-ink-3);
  font-variant-numeric: tabular-nums;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status--warning {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.status--brand {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.status--success {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.status--muted {
  background: var(--c-surface-2);
  color: var(--c-ink-3);
}

/* 主体 */
.order__body {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 22px;
}

.order__thumb {
  position: relative;
  flex-shrink: 0;
  width: 84px;
  height: 100px;
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #fbfaf7, #f1ece4);
  transition: transform var(--dur) var(--ease-soft);
}

.order__thumb:hover {
  transform: translateY(-2px) rotate(-1deg);
}

.order__thumb img {
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  object-fit: contain;
  mix-blend-mode: multiply;
}

.order__product {
  flex: 1;
  min-width: 0;
}

.order__name {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-ink);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--dur) var(--ease-soft);
}

.order__name:hover {
  color: var(--c-brand);
}

.order__desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--c-ink-3);
}

.order__tags {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--c-ink-3);
  font-variant-numeric: tabular-nums;
}

.order__amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.order__amount span {
  font-size: 11.5px;
  color: var(--c-ink-3);
}

.order__amount strong {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

/* 底部 */
.order__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 22px;
  border-top: 1px solid var(--c-line);
  background: var(--c-bg-soft);
}

.order__address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--c-ink-2);
}

.order__address .el-icon {
  flex-shrink: 0;
  color: var(--c-ink-3);
}

.order__actions {
  display: flex;
  gap: 10px;
}

/* ---------- 骨架 ---------- */
.order-skeleton {
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
}

.order-skeleton__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  background: var(--c-bg-soft);
}

.order-skeleton__body {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 22px;
}

.order-skeleton__img {
  width: 84px;
  height: 100px;
  border-radius: var(--radius-md);
}

.order-skeleton__lines {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.order-skeleton__img,
.order-skeleton .line {
  background: linear-gradient(100deg, #f1ece4 30%, #f8f4ee 50%, #f1ece4 70%);
  background-size: 300% 100%;
  animation: shimmer 1.4s infinite linear;
}

.line {
  height: 12px;
  border-radius: var(--radius-pill);
}

.line--xs {
  width: 60px;
}

.line--sm {
  width: 120px;
}

.line--md {
  width: 42%;
  height: 16px;
}

.line--full {
  width: 90%;
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
@media (max-width: 700px) {
  .orders__head {
    align-items: flex-start;
  }

  .order__body {
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px;
  }

  .order__product {
    flex-basis: calc(100% - 110px);
  }

  .order__amount {
    width: 100%;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px dashed var(--c-line);
  }

  .order__amount strong {
    font-size: 19px;
  }

  .order__foot {
    padding: 14px 16px;
  }

  .order__actions {
    width: 100%;
    justify-content: flex-end;
  }

  .order__head {
    padding: 12px 16px;
  }

  .tabs__item {
    flex: 1 1 auto;
    justify-content: center;
    padding: 0 12px;
  }
}
</style>
