<template>
  <div class="products-page">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称..."
            clearable
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
        </div>
        <el-select
          v-model="sortOrder"
          placeholder="价格排序"
          size="large"
          class="sort-select"
          @change="handleSort"
        >
          <el-option label="📊 默认排序" value="" />
          <el-option label="↑ 价格从低到高" value="asc" />
          <el-option label="↓ 价格从高到低" value="desc" />
        </el-select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loader">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>
      <p class="loading-text">正在加载商品...</p>
    </div>

    <!-- 空数据 -->
    <div v-else-if="products.length === 0" class="empty-container">
      <div class="empty-icon">🔍</div>
      <p class="empty-text">没有找到匹配的商品</p>
      <el-button type="primary" class="reset-btn" @click="resetFilter">重置筛选</el-button>
    </div>

    <!-- 商品网格 -->
    <template v-else>
      <div class="product-grid">
        <div
          v-for="(product, index) in products"
          :key="product.productId"
          class="product-card"
          :style="{ '--delay': `${index * 0.05}s` }"
        >
          <div class="product-image">
            <div class="image-overlay"></div>
            <el-image
              :src="product.productImage || `https://via.placeholder.com/400x400/f0f2f5/c0c4cc?text=${encodeURIComponent(product.productName)}`"
              fit="cover"
              class="image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon :size="40"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="image-actions">
              <el-button size="small" round @click.stop="viewDetail(product)">
                <el-icon><View /></el-icon> 详情
              </el-button>
              <el-button size="small" type="primary" round @click.stop="buyNow(product)">
                <el-icon><ShoppingCart /></el-icon> 购买
              </el-button>
            </div>
            <span v-if="product.productStock < 10" class="stock-badge">
              仅剩 {{ product.productStock }} 件
            </span>
          </div>

          <div class="product-info">
            <h3 class="product-name" :title="product.productName">{{ product.productName }}</h3>
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.productPrice }}</span>
            </div>
            <div class="product-meta">
              <div class="product-stock" :class="{ 'stock-warning': product.productStock < 10 }">
                <template v-if="product.productStock < 10">
                  🔥 库存紧张
                </template>
                <template v-else>
                  📦 库存 {{ product.productStock }} 件
                </template>
              </div>
            </div>
            <p class="product-desc">{{ product.productDescription || '暂无描述' }}</p>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Picture,
  View,
  ShoppingCart
} from '@element-plus/icons-vue'
import { productApi } from '../api'

const router = useRouter()
const route = useRoute()

const products = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const sortOrder = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
  fetchProducts()
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize: pageSize.value }
    if (searchKeyword.value.trim()) {
      params.productName = searchKeyword.value.trim()
    }
    const res = await productApi.list(params)
    if (res.code === 200) {
      const data = res.data
      if (Array.isArray(data)) {
        products.value = data
        total.value = data.length
      } else if (data.records) {
        products.value = data.records
        total.value = data.total || data.records.length
      } else {
        products.value = []
        total.value = 0
      }
    }
  } catch (e) {
    products.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleSort = () => {
  if (sortOrder.value === 'asc') {
    products.value = [...products.value].sort((a, b) => a.productPrice - b.productPrice)
  } else if (sortOrder.value === 'desc') {
    products.value = [...products.value].sort((a, b) => b.productPrice - a.productPrice)
  } else {
    fetchProducts()
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

const resetFilter = () => {
  searchKeyword.value = ''
  sortOrder.value = ''
  currentPage.value = 1
  fetchProducts()
}

const viewDetail = (product) => {
  router.push(`/product/${product.productId}`)
}

const buyNow = (product) => {
  router.push(`/product/${product.productId}`)
}
</script>

<style scoped>
.products-page {
  max-width: 1200px;
  margin: 84px auto 40px;
  padding: 0 20px;
  min-height: 60vh;
}

/* 筛选栏 */
.filter-bar {
  margin-bottom: 28px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.filter-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 280px;
  max-width: 460px;
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px 0 0 10px;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
  border-right: none;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
}

.search-btn {
  border-radius: 0 10px 10px 0 !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-select {
  width: 180px;
}

.sort-select :deep(.el-select__wrapper) {
  border-radius: 10px;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
}

.sort-select :deep(.el-select__wrapper:hover),
.sort-select :deep(.el-select__wrapper.is-focus) {
  border-color: #409EFF;
}

/* 加载动画 */
.loading-container {
  text-align: center;
  padding: 120px 0;
}

.loader {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.loader-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409EFF;
  animation: dotBounce 1.4s ease-in-out infinite both;
}

.loader-dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dot:nth-child(2) { animation-delay: -0.16s; }
.loader-dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

.loading-text {
  color: #909399;
  font-size: 14px;
}

/* 空数据 */
.empty-container {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin-bottom: 24px;
}

.reset-btn {
  border-radius: 20px;
  padding: 10px 32px;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 商品图片 */
.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;
}

.product-image .image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.product-card:hover .image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.03));
  z-index: 1;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.image-actions {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  display: flex;
  gap: 8px;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .image-actions {
  transform: translateX(-50%) translateY(0);
}

.image-actions .el-button {
  backdrop-filter: blur(8px);
  font-size: 12px;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
}

.image-actions .el-button--primary {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  color: #fff !important;
}

/* 库存紧张小标签 */
.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: linear-gradient(135deg, #f56c6c, #e04040);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
}

/* 商品信息 */
.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 8px;
}

.price-symbol {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 600;
}

.price-value {
  font-size: 22px;
  color: #f56c6c;
  font-weight: 700;
  margin-left: 1px;
}

.product-meta {
  margin-bottom: 8px;
}

.product-stock {
  font-size: 13px;
  color: #909399;
}

.stock-warning {
  color: #f56c6c;
  font-weight: 600;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.product-desc {
  font-size: 13px;
  color: #909399;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

/* 分页 */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 36px;
  padding: 20px 0;
}

.pagination-wrap :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-left { flex-direction: column; }
  .search-box { max-width: 100%; }
  .sort-select { width: 100%; }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
}
</style>
