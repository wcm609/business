<template>
  <div class="products container page">
    <!-- 首屏展示区 -->
    <section class="hero rise-in">
      <div class="hero__copy">
        <p class="eyebrow">{{ t('list.eyebrow') }}</p>
        <h1 class="hero__title" v-html="t('list.heroTitle')"></h1>
        <p class="hero__desc" v-html="t('list.heroDesc')"></p>

        <div class="hero__actions">
          <button type="button" class="hero__cta" @click="scrollToCatalog">
            {{ t('list.startShopping') }}
            <el-icon :size="15"><ArrowDown /></el-icon>
          </button>
          <div class="hero__stats">
            <div class="hero__stat">
              <strong>{{ products.length }}</strong>
              <span>{{ t('list.selected') }}</span>
            </div>
            <div class="hero__stat">
              <strong>{{ favoritesCount }}</strong>
              <span>{{ t('list.favorites') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="hero__visual" aria-hidden="true">
        <span class="hero__ring"></span>
        <div class="hero__frame">
          <img :src="PRODUCT_IMAGE" alt="" />
        </div>
        <span class="hero__float hero__float--top">
          <el-icon :size="13"><CircleCheck /></el-icon>{{ t('footer.genuine') }}
        </span>
        <span class="hero__float hero__float--bottom">
          <el-icon :size="13"><Van /></el-icon>{{ t('footer.fastShipping') }}
        </span>
      </div>
    </section>

    <!-- 商品目录 -->
    <section ref="catalogRef" class="catalog">
      <header class="catalog__head">
        <div>
          <h2 class="section-title">{{ t('list.allProducts') }}</h2>
          <p class="catalog__count">
            {{ t('list.count', { count: total }) }}
            <span v-if="connection.offline" class="catalog__mode">{{ t('list.demoData') }}</span>
          </p>
        </div>

        <div class="segmented" role="tablist" :aria-label="t('list.scopeAria')">
          <button
            v-for="tab in scopeTabs"
            :key="tab.value"
            type="button"
            role="tab"
            class="segmented__item"
            :class="{ 'is-active': scope === tab.value }"
            :aria-selected="scope === tab.value"
            @click="scope = tab.value"
          >
            {{ t(tab.labelKey) }}
            <span v-if="tab.value === 'favorites'" class="segmented__count">{{ favoritesCount }}</span>
          </button>
        </div>
      </header>

      <!-- 检索与排序 -->
      <div class="toolbar">
        <div class="toolbar__search">
          <el-icon :size="16" class="toolbar__search-icon"><Search /></el-icon>
          <input
            v-model="searchKeyword"
            type="search"
            class="toolbar__input"
            :placeholder="t('list.searchPlaceholder')"
            :aria-label="t('nav.searchAria')"
          />
          <button
            v-if="searchKeyword"
            type="button"
            class="toolbar__clear"
            :aria-label="t('list.clearSearch')"
            @click="searchKeyword = ''"
          >
            <el-icon :size="13"><Close /></el-icon>
          </button>
        </div>

        <div class="toolbar__chips" role="group" :aria-label="t('list.filterAria')">
          <button
            v-for="item in stockFilters"
            :key="item.value"
            type="button"
            class="chip"
            :class="{ 'is-active': stockFilter === item.value }"
            @click="stockFilter = item.value"
          >
            {{ t(item.labelKey) }}
          </button>
        </div>

        <el-select v-model="sortKey" class="toolbar__sort" size="large" :aria-label="t('list.sortLabel')">
          <el-option
            v-for="item in sortOptions"
            :key="item.value"
            :label="t(item.labelKey)"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 加载骨架 -->
      <div v-if="loading" class="grid" aria-busy="true" :aria-label="t('list.loadingAria')">
        <div v-for="n in PAGE_SIZE" :key="n" class="skeleton">
          <div class="skeleton__media"></div>
          <div class="skeleton__body">
            <div class="skeleton__line skeleton__line--title"></div>
            <div class="skeleton__line"></div>
            <div class="skeleton__line skeleton__line--short"></div>
            <div class="skeleton__foot">
              <div class="skeleton__line skeleton__line--price"></div>
              <div class="skeleton__line skeleton__line--stock"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else-if="total === 0"
        :icon="emptyMeta.icon"
        :title="emptyMeta.title"
        :description="emptyMeta.description"
      >
        <el-button type="primary" round @click="resetFilters">{{ t('list.reset') }}</el-button>
      </EmptyState>

      <!-- 商品网格 -->
      <div v-else class="grid">
        <ProductCard
          v-for="(product, index) in pagedProducts"
          :key="product.productId"
          :product="product"
          :index="index"
        />
      </div>

      <!-- 分页 -->
      <footer v-if="!loading && totalPages > 1" class="catalog__foot">
        <p class="catalog__page-info">
          {{ t('list.pageInfo', { current: currentPage, total: totalPages, count: total }) }}
        </p>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="PAGE_SIZE"
          :total="total"
          background
          layout="prev, pager, next"
          hide-on-single-page
        />
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowDown,
  CircleCheck,
  Close,
  Search,
  Star,
  Van
} from '@element-plus/icons-vue'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { LOW_STOCK, PAGE_SIZE, PRODUCT_IMAGE } from '../config'
import { productApi } from '../api'
import { connection } from '../api/request'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../i18n'
import { showError } from '../utils'

const route = useRoute()
const { t } = useI18n()
const { count: favoritesCount, has: isFavorite } = useFavorites()

/* ---------------- 数据 ---------------- */
const products = ref([])
const loading = ref(true)

/* ---------------- 筛选与排序 ---------------- */
const searchKeyword = ref('')
const scope = ref('all')
const stockFilter = ref('all')
const sortKey = ref('default')
const currentPage = ref(1)

const scopeTabs = [
  { labelKey: 'list.tabAll', value: 'all' },
  { labelKey: 'list.tabFavorites', value: 'favorites' }
]

const stockFilters = [
  { labelKey: 'list.filterAll', value: 'all' },
  { labelKey: 'list.filterInStock', value: 'in-stock' },
  { labelKey: 'list.filterLow', value: 'low-stock' }
]

const sortOptions = [
  { labelKey: 'list.sortDefault', value: 'default' },
  { labelKey: 'list.sortPriceAsc', value: 'price-asc' },
  { labelKey: 'list.sortPriceDesc', value: 'price-desc' },
  { labelKey: 'list.sortStock', value: 'stock' },
  { labelKey: 'list.sortNewest', value: 'newest' }
]

/* ---------------- 计算属性 ---------------- */
const filteredProducts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  let list = [...products.value]

  if (keyword) {
    list = list.filter((item) =>
      `${item.productName || ''} ${item.productDescription || ''}`.toLowerCase().includes(keyword)
    )
  }

  if (scope.value === 'favorites') {
    list = list.filter((item) => isFavorite(item.productId))
  }

  if (stockFilter.value === 'in-stock') {
    list = list.filter((item) => Number(item.productStock) > 0)
  } else if (stockFilter.value === 'low-stock') {
    list = list.filter((item) => {
      const stock = Number(item.productStock)
      return stock > 0 && stock < LOW_STOCK
    })
  }

  switch (sortKey.value) {
    case 'price-asc':
      list.sort((a, b) => Number(a.productPrice) - Number(b.productPrice))
      break
    case 'price-desc':
      list.sort((a, b) => Number(b.productPrice) - Number(a.productPrice))
      break
    case 'stock':
      list.sort((a, b) => Number(b.productStock) - Number(a.productStock))
      break
    case 'newest':
      list.sort((a, b) =>
        String(b.productCreateTime || '').localeCompare(String(a.productCreateTime || ''))
      )
      break
    default:
      break
  }

  return list
})

const total = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

const emptyMeta = computed(() => {
  if (scope.value === 'favorites') {
    return {
      icon: Star,
      title: t('list.emptyFavoritesTitle'),
      description: t('list.emptyFavoritesDesc')
    }
  }
  return {
    icon: Search,
    title: t('list.emptySearchTitle'),
    description: searchKeyword.value
      ? t('list.emptySearchDesc', { keyword: searchKeyword.value })
      : t('list.emptyFilterDesc')
  }
})

/* ---------------- 交互 ---------------- */
const catalogRef = ref(null)

const scrollToCatalog = () => {
  catalogRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const resetFilters = () => {
  searchKeyword.value = ''
  stockFilter.value = 'all'
  sortKey.value = 'default'
  scope.value = 'all'
}

// 条件变化后回到第一页，避免停留在空白页
watch([searchKeyword, scope, stockFilter, sortKey], () => {
  currentPage.value = 1
})

// 页码越界时自动收敛（例如取消收藏后总页数减少）
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

// 与地址栏联动：导航栏搜索 / 收藏入口
watch(
  () => route.query,
  (query) => {
    // 地址栏是筛选条件的唯一来源：没有参数时恢复默认视图
    searchKeyword.value = query.keyword !== undefined ? String(query.keyword) : ''
    scope.value = query.view === 'favorites' ? 'favorites' : 'all'
  },
  { immediate: true }
)

/* ---------------- 数据加载 ---------------- */
const loadProducts = async () => {
  loading.value = true
  try {
    const res = await productApi.list()
    const data = res.data
    products.value = Array.isArray(data) ? data : data?.records || []
  } catch (error) {
    products.value = []
    showError(error, t('toast.loadProductsFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)
</script>

<style scoped>
.products {
  display: flex;
  flex-direction: column;
  gap: 44px;
}

/* ================= 首屏 ================= */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 32px;
  padding: 48px 52px;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(120% 130% at 0% 0%, #ffffff 0%, #fbf7f0 45%, #f3ece1 100%);
  box-shadow: var(--shadow-md);
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(25, 23, 19, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(25, 23, 19, 0.03) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(80% 80% at 20% 10%, #000 10%, transparent 70%);
  pointer-events: none;
}

.hero__copy,
.hero__visual {
  position: relative;
  z-index: 1;
}

.hero__title {
  margin-top: 18px;
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.035em;
  color: var(--c-ink);
}

.hero__title em {
  font-style: normal;
  color: var(--c-brand);
}

.hero__desc {
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--c-ink-2);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 28px;
  margin-top: 34px;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 26px;
  border-radius: var(--radius-pill);
  background: var(--c-solid);
  color: var(--c-on-solid);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 14px 26px -16px rgba(25, 23, 19, 0.8);
  transition: all var(--dur) var(--ease-soft);
}

.hero__cta:hover {
  background: var(--c-brand);
  transform: translateY(-2px);
  box-shadow: var(--shadow-brand);
}

.hero__cta .el-icon {
  transition: transform var(--dur) var(--ease-soft);
}

.hero__cta:hover .el-icon {
  transform: translateY(3px);
}

.hero__stats {
  display: flex;
  gap: 28px;
}

.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero__stat strong {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-ink);
  font-variant-numeric: tabular-nums;
}

.hero__stat span {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--c-ink-3);
}

/* 右侧商品展示 */
.hero__visual {
  display: grid;
  place-items: center;
  min-height: 280px;
}

.hero__ring {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px dashed rgba(194, 68, 47, 0.28);
  animation: spin 40s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hero__frame {
  position: relative;
  width: 220px;
  height: 264px;
  border: 1px solid rgba(25, 23, 19, 0.06);
  border-radius: 26px;
  background: linear-gradient(160deg, #fffdfa 0%, #f6f0e6 100%);
  box-shadow: 0 30px 60px -34px rgba(25, 23, 19, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  transform: rotate(4deg);
  transition: transform var(--dur-slow) var(--ease-out);
}

.hero:hover .hero__frame {
  transform: rotate(2deg) translateY(-6px);
}

.hero__frame img {
  position: absolute;
  inset: 18px;
  width: calc(100% - 36px);
  height: calc(100% - 36px);
  object-fit: contain;
  mix-blend-mode: multiply;
}

.hero__float {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.hero__float .el-icon {
  color: var(--c-success);
}

.hero__float--top {
  top: 12px;
  right: 4px;
  transform: rotate(-3deg);
}

.hero__float--bottom {
  bottom: 18px;
  left: 0;
  transform: rotate(2deg);
}

/* ================= 目录 ================= */
.catalog {
  display: flex;
  flex-direction: column;
  gap: 22px;
  scroll-margin-top: calc(var(--nav-height) + 20px);
}

.catalog__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.catalog__count {
  margin-top: 6px;
  font-size: 13px;
  color: var(--c-ink-3);
}

.catalog__mode {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--c-gold-soft);
  font-size: 11px;
  color: #7a5a27;
}

/* 分段控件 */
.segmented {
  display: inline-flex;
  padding: 4px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
}

.segmented__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-2);
  transition: all var(--dur) var(--ease-soft);
}

.segmented__item:hover {
  color: var(--c-ink);
}

.segmented__item.is-active {
  background: var(--c-solid);
  color: var(--c-on-solid);
  box-shadow: 0 8px 16px -10px rgba(25, 23, 19, 0.8);
}

.segmented__count {
  font-size: 11px;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
}

.toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 240px;
  height: 42px;
  padding: 0 10px 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: var(--c-bg-soft);
  color: var(--c-ink-3);
  transition: all var(--dur) var(--ease-soft);
}

.toolbar__search:focus-within {
  border-color: var(--c-brand);
  background: #fff;
  box-shadow: 0 0 0 4px var(--c-brand-ring);
}

.toolbar__search-icon {
  flex-shrink: 0;
}

.toolbar__input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--c-ink);
}

.toolbar__input::-webkit-search-cancel-button {
  display: none;
}

.toolbar__clear {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--c-ink-3);
  background: var(--c-surface-2);
  transition: all var(--dur-fast) ease;
}

.toolbar__clear:hover {
  color: var(--c-ink);
  background: var(--c-surface-3);
}

.toolbar__chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: transparent;
  font-size: 12.5px;
  color: var(--c-ink-2);
  transition: all var(--dur) var(--ease-soft);
}

.chip:hover {
  border-color: var(--c-line-strong);
  background: var(--c-bg-soft);
}

.chip.is-active {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
  color: var(--c-brand-dark);
  font-weight: 600;
}

.toolbar__sort {
  width: 152px;
  flex-shrink: 0;
}

/* ================= 商品网格 ================= */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

/* 骨架屏 */
.skeleton {
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
}

.skeleton__media {
  aspect-ratio: 1 / 1.06;
  background: linear-gradient(100deg, #f1ece4 30%, #f8f4ee 50%, #f1ece4 70%);
  background-size: 300% 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
}

.skeleton__line {
  height: 10px;
  border-radius: var(--radius-pill);
  background: linear-gradient(100deg, #f1ece4 30%, #f8f4ee 50%, #f1ece4 70%);
  background-size: 300% 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton__line--title {
  width: 72%;
  height: 14px;
}

.skeleton__line--short {
  width: 48%;
}

.skeleton__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
}

.skeleton__line--price {
  width: 38%;
  height: 18px;
}

.skeleton__line--stock {
  width: 24%;
}

@keyframes shimmer {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -150% 0;
  }
}

/* ================= 分页 ================= */
.catalog__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.catalog__page-info {
  font-size: 13px;
  color: var(--c-ink-3);
}

/* ================= 响应式 ================= */
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 36px 30px;
  }

  .hero__visual {
    display: none;
  }
}

@media (max-width: 760px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .catalog__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar__sort {
    width: 100%;
  }

  .toolbar__chips {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .products {
    gap: 30px;
  }

  .hero {
    padding: 26px 20px;
    border-radius: var(--radius-lg);
  }

  .hero__title {
    font-size: 28px;
  }

  .hero__desc {
    margin-top: 14px;
    font-size: 13px;
  }

  .hero__actions {
    margin-top: 24px;
    gap: 18px;
  }

  .hero__stat strong {
    font-size: 19px;
  }

  .grid {
    /* 小屏保持两列，首屏能看到更多商品 */
    gap: 14px;
  }

  .segmented {
    width: 100%;
  }

  .segmented__item {
    flex: 1;
    justify-content: center;
  }
}</style>
