<template>
  <article
    class="pcard"
    :class="{ 'is-soldout': soldOut }"
    :style="{ '--delay': `${Math.min(index, 8) * 45}ms` }"
    tabindex="0"
    role="link"
    :aria-label="`${t('card.viewDetail')}: ${product.productName}`"
    @click="openDetail"
    @keydown.enter.self="openDetail"
  >
    <!-- 商品图：全站统一使用 images.jpg -->
    <div class="pcard__media">
      <span v-if="soldOut" class="pcard__badge pcard__badge--muted">{{ t('card.soldOut') }}</span>
      <span v-else-if="lowStock" class="pcard__badge">
        {{ t('card.lowStock', { count: product.productStock }) }}
      </span>

      <button
        type="button"
        class="pcard__fav"
        :class="{ 'is-active': favorited }"
        :aria-label="favorited ? t('card.removeFavorite') : t('card.addFavorite')"
        @click.stop="toggleFavorite"
      >
        <el-icon :size="16">
          <StarFilled v-if="favorited" />
          <Star v-else />
        </el-icon>
      </button>

      <img
        class="pcard__img"
        :src="PRODUCT_IMAGE"
        :alt="product.productName"
        loading="lazy"
        decoding="async"
      />

      <div class="pcard__actions">
        <button
          type="button"
          class="pcard__action"
          :disabled="soldOut"
          @click.stop="addToCart"
        >
          {{ t('card.addToCart') }}
        </button>
        <button type="button" class="pcard__action pcard__action--solid" @click.stop="openDetail">
          {{ t('card.viewDetail') }}
        </button>
      </div>
    </div>

    <div class="pcard__body">
      <h3 class="pcard__name" :title="product.productName">{{ product.productName }}</h3>
      <p class="pcard__desc">{{ product.productDescription || t('card.descFallback') }}</p>

      <div class="pcard__meta">
        <span class="pcard__price">
          <small>¥</small>{{ formatPrice(product.productPrice) }}
        </span>
        <span class="pcard__stock" :class="{ 'is-low': lowStock }">
          {{ soldOut ? t('card.outOfStock') : t('card.stock', { count: product.productStock }) }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { LOW_STOCK, PRODUCT_IMAGE } from '../config'
import { useCart } from '../composables/useCart'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../i18n'
import { formatPrice } from '../utils'

const props = defineProps({
  product: { type: Object, required: true },
  index: { type: Number, default: 0 }
})

const router = useRouter()
const { t } = useI18n()
const { add } = useCart()
const { has, toggle } = useFavorites()

const soldOut = computed(() => Number(props.product.productStock) <= 0)
const lowStock = computed(
  () => !soldOut.value && Number(props.product.productStock) < LOW_STOCK
)
const favorited = computed(() => has(props.product.productId))

const openDetail = () => {
  router.push(`/product/${props.product.productId}`)
}

const addToCart = () => {
  if (soldOut.value) return
  add(props.product, 1)
  ElMessage.success(t('toast.addedToCart'))
}

const toggleFavorite = () => {
  const active = toggle(props.product.productId)
  ElMessage.success(active ? t('toast.addedFavorite') : t('toast.removedFavorite'))
}
</script>

<style scoped>
.pcard {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  opacity: 1;
  animation: rise-in 0.5s var(--ease-out) var(--delay) both;
  transition: transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out),
    border-color var(--dur) var(--ease-soft);
}

.pcard:hover {
  transform: translateY(-6px);
  border-color: var(--c-line-strong);
  box-shadow: var(--shadow-md);
}

.pcard:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 3px;
}

/* ---------- 图片区 ---------- */
.pcard__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1.06;
  background:
    radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f7f3ec 55%, #efe9df 100%);
}

.pcard__img {
  width: 100%;
  height: 100%;
  padding: 16% 12% 10%;
  object-fit: contain;
  /* 商品图为白底，正片叠底后可自然融入暖色卡片背景 */
  mix-blend-mode: multiply;
  transition: transform var(--dur-slow) var(--ease-out);
}

.pcard:hover .pcard__img {
  transform: scale(1.045);
}

.pcard.is-soldout .pcard__img {
  filter: grayscale(1);
  opacity: 0.55;
}

.pcard__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--c-media-ink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.pcard__badge--muted {
  background: var(--c-ink-3);
}

.pcard__fav {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  color: var(--c-ink-3);
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(6px);
  opacity: 0;
  transform: translateY(-4px);
  transition: all var(--dur) var(--ease-soft);
}

.pcard:hover .pcard__fav,
.pcard:focus-within .pcard__fav {
  opacity: 1;
  transform: translateY(0);
}

.pcard__fav:hover {
  color: var(--c-brand);
  transform: scale(1.08);
}

.pcard__fav.is-active {
  color: var(--c-gold);
  opacity: 1;
  transform: translateY(0);
}

/* 悬停时浮出的快捷操作 */
.pcard__actions {
  position: absolute;
  inset: auto 12px 12px;
  z-index: 2;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity var(--dur) var(--ease-out), transform var(--dur) var(--ease-out);
}

.pcard:hover .pcard__actions,
.pcard:focus-within .pcard__actions {
  opacity: 1;
  transform: translateY(0);
}

.pcard__action {
  flex: 1;
  height: 36px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.92);
  color: var(--c-ink);
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  transition: all var(--dur) var(--ease-soft);
}

.pcard__action:hover {
  background: #fff;
}

.pcard__action--solid {
  background: var(--c-solid);
  color: var(--c-on-solid);
}

.pcard__action--solid:hover {
  background: var(--c-brand);
}
.pcard__action:disabled {
  background: rgba(255, 255, 255, 0.6);
  color: var(--c-ink-3);
  cursor: not-allowed;
}

/* ---------- 信息区 ---------- */
.pcard__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px 18px;
}

.pcard__name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--c-ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcard__desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.6em;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--c-ink-3);
}

.pcard__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

.pcard__price {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

.pcard__price small {
  margin-right: 1px;
  font-size: 12px;
  font-weight: 600;
}

.pcard__stock {
  font-size: 12px;
  color: var(--c-ink-3);
}

.pcard__stock.is-low {
  color: var(--c-warning);
  font-weight: 600;
}

/* 触屏设备没有 hover，收藏与快捷操作直接展示 */
@media (hover: none) {
  .pcard__fav,
  .pcard__actions {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 520px) {
  .pcard__body {
    padding: 13px 14px 15px;
  }

  .pcard__name {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 2.9em;
    font-size: 14px;
    white-space: normal;
  }

  /* 小屏隐藏描述，让价格与名称更聚焦 */
  .pcard__desc {
    display: none;
  }

  .pcard__price {
    font-size: 17px;
  }
}
</style>
