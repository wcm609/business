<template>
  <footer class="footer">
    <div class="container footer__main">
      <div class="footer__brand">
        <div class="brand">
          <span class="brand__mark">
            <el-icon :size="18"><ShoppingBag /></el-icon>
          </span>
          <span class="brand__text">
            <strong>{{ t('common.brand') }}</strong>
            <small>{{ t('common.brandEn') }}</small>
          </span>
        </div>
        <p class="footer__slogan">{{ t('footer.slogan') }}</p>
        <p class="footer__tech">{{ t('footer.tech') }}</p>
      </div>

      <nav class="footer__links" aria-label="Footer navigation">
        <div>
          <h4>{{ t('footer.shop') }}</h4>
          <RouterLink to="/products">{{ t('footer.allProducts') }}</RouterLink>
          <RouterLink to="/orders">{{ t('footer.myOrders') }}</RouterLink>
          <RouterLink to="/profile">{{ t('footer.profile') }}</RouterLink>
        </div>
        <div>
          <h4>{{ t('footer.guarantees') }}</h4>
          <span>{{ t('footer.genuine') }}</span>
          <span>{{ t('footer.returns') }}</span>
          <span>{{ t('footer.fastShipping') }}</span>
        </div>
      </nav>

      <div class="footer__promise">
        <p class="eyebrow">{{ t('footer.service') }}</p>
        <p class="footer__promise-text" v-html="t('footer.serviceText')"></p>
      </div>
    </div>

    <div class="container footer__bottom">
      <span>{{ t('footer.copyright', { year }) }}</span>
      <span>{{ t('footer.imageNote') }}</span>
    </div>
  </footer>
</template>

<script setup>
import { ShoppingBag } from '@element-plus/icons-vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  margin-top: 24px;
  border-top: 1px solid var(--c-line);
  background: rgba(255, 255, 255, 0.6);
}

.footer__main {
  display: grid;
  grid-template-columns: 1.4fr 1.4fr 1fr;
  gap: 48px;
  padding: 48px 0 36px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #fff;
  background: var(--grad-brand);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand__text strong {
  font-size: 16px;
  font-weight: 700;
}

.brand__text small {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--c-ink-3);
}

.footer__slogan {
  margin-top: 16px;
  font-size: 13px;
  color: var(--c-ink-2);
}

.footer__tech {
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-ink-3);
}

.footer__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.footer__links h4 {
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--c-ink);
}

.footer__links a,
.footer__links span {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--c-ink-3);
}

.footer__links a {
  transition: color var(--dur) var(--ease-soft), transform var(--dur) var(--ease-soft);
}

.footer__links a:hover {
  color: var(--c-brand);
  transform: translateX(2px);
}

.footer__promise-text {
  margin-top: 14px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--c-ink-2);
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0 26px;
  border-top: 1px solid var(--c-line);
  font-size: 12px;
  color: var(--c-ink-3);
}

@media (max-width: 860px) {
  .footer__main {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 36px 0 28px;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
