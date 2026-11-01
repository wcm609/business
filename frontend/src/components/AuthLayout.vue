<template>
  <div class="auth">
    <!-- 背景装饰 -->
    <div class="auth__glow auth__glow--left" aria-hidden="true"></div>
    <div class="auth__glow auth__glow--right" aria-hidden="true"></div>

    <!-- 主题 / 语言切换 -->
    <AppSettings class="auth__settings" />

    <div class="auth__shell">
      <!-- 左侧品牌展示区（小屏隐藏） -->
      <aside class="auth__aside">
        <RouterLink to="/login" class="brand" :aria-label="t('common.brand')">
          <span class="brand__mark">
            <el-icon :size="20"><ShoppingBag /></el-icon>
          </span>
          <span class="brand__text">
            <strong>{{ t('common.brand') }}</strong>
            <small>{{ t('common.brandEn') }}</small>
          </span>
        </RouterLink>

        <div class="auth__copy">
          <p class="eyebrow">{{ t('auth.sideEyebrow') }}</p>
          <h1 class="auth__title" v-html="t('auth.sideTitle')"></h1>
          <p class="auth__desc" v-html="t('auth.sideDesc')"></p>
        </div>

        <figure class="auth__visual">
          <div class="auth__visual-frame">
            <img :src="PRODUCT_IMAGE" :alt="t('auth.sideCaptionA')" />
          </div>
          <figcaption class="auth__visual-caption">
            <span>{{ t('auth.sideCaptionA') }}</span>
            <strong>{{ t('auth.sideCaptionB') }}</strong>
          </figcaption>
          <span class="auth__visual-chip">{{ t('auth.sideBadge') }}</span>
        </figure>

        <ul class="auth__points">
          <li><el-icon :size="13"><CircleCheck /></el-icon>{{ t('auth.pointGenuine') }}</li>
          <li><el-icon :size="13"><Van /></el-icon>{{ t('auth.pointFast') }}</li>
          <li><el-icon :size="13"><RefreshLeft /></el-icon>{{ t('auth.pointReturns') }}</li>
        </ul>
      </aside>

      <!-- 右侧表单区 -->
      <section class="auth__panel">
        <div class="auth__panel-inner">
          <slot />
        </div>

        <p class="auth__copyright">{{ t('auth.copyright', { year }) }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { CircleCheck, RefreshLeft, ShoppingBag, Van } from '@element-plus/icons-vue'
import AppSettings from './AppSettings.vue'
import { PRODUCT_IMAGE } from '../config'
import { useI18n } from '../i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<style scoped>
.auth {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 24px;
  overflow: hidden;
  background: var(--c-bg);
}

/* 背景光晕 */
.auth__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.auth__glow--left {
  top: -140px;
  left: -120px;
  width: 460px;
  height: 460px;
  background: rgba(194, 68, 47, 0.16);
}

.auth__glow--right {
  right: -160px;
  bottom: -180px;
  width: 520px;
  height: 520px;
  background: rgba(176, 138, 79, 0.18);
}

.auth__settings {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
}

.auth__shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  width: min(1120px, 100%);
  /* 水平居中；垂直方向由容器 align-items 控制，短屏时改为顶部对齐 */
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: 30px;
  background: var(--c-surface);
  box-shadow: var(--shadow-lg);
  animation: rise-in 0.6s var(--ease-out) both;
}

/* ---------- 左侧展示 ---------- */
.auth__aside {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 38px 42px;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 0% 0%, #ffffff 0%, #faf6ef 48%, #f3ede3 100%);
  border-right: 1px solid var(--c-line);
}

.auth__aside::after {
  /* 极淡的网格纹理，增加纸张质感 */
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(25, 23, 19, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(25, 23, 19, 0.035) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(90% 70% at 30% 10%, #000 20%, transparent 75%);
  pointer-events: none;
}

.auth__aside > * {
  position: relative;
  z-index: 1;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand__text strong {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand__text small {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--c-ink-3);
}

.auth__copy {
  margin-top: 44px;
}

.auth__title {
  margin-top: 16px;
  font-size: clamp(34px, 3.6vw, 46px);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}

.auth__title em {
  position: relative;
  font-style: normal;
  color: var(--c-brand);
}

.auth__title em::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 8px;
  border-radius: 4px;
  background: rgba(194, 68, 47, 0.14);
  z-index: -1;
}

.auth__desc {
  margin-top: 18px;
  max-width: 380px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--c-ink-2);
}

/* 商品展示组合 */
.auth__visual {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin: 30px 0 auto;
}

.auth__visual-frame {
  position: relative;
  width: 168px;
  height: 196px;
  flex-shrink: 0;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 48px -30px rgba(25, 23, 19, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transform: rotate(-3deg);
  transition: transform var(--dur-slow) var(--ease-out);
}

.auth__aside:hover .auth__visual-frame {
  transform: rotate(-1deg) translateY(-4px);
}

.auth__visual-frame img {
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  object-fit: contain;
  mix-blend-mode: multiply;
}

.auth__visual-caption {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 10px;
}

.auth__visual-caption span {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-ink-3);
}

.auth__visual-caption strong {
  font-size: 17px;
  font-weight: 700;
  color: var(--c-ink);
}

.auth__visual-chip {
  position: absolute;
  top: -4px;
  left: 150px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--c-solid);
  color: var(--c-on-solid);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  box-shadow: var(--shadow-md);
  transform: rotate(4deg);
}

.auth__points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid rgba(25, 23, 19, 0.08);
}

.auth__points li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--c-ink-2);
}

.auth__points :deep(.el-icon) {
  color: var(--c-success);
}

/* ---------- 右侧表单 ---------- */
.auth__panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 46px;
  background: var(--c-surface);
}

.auth__panel-inner {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.auth__copyright {
  margin-top: 36px;
  font-size: 11px;
  text-align: center;
  color: var(--c-ink-3);
}

/* ---------- 响应式 ---------- */
/* 矮屏（笔记本小窗、横屏手机）改为顶部对齐，避免卡片顶部被裁切 */
@media (max-height: 820px) {
  .auth {
    align-items: flex-start;
  }
}

@media (max-width: 900px) {
  .auth {
    /* 给右上角的主题 / 语言切换留出空间 */
    padding: 76px 16px 24px;
  }

  .auth__shell {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }

  .auth__aside {
    display: none;
  }

  .auth__panel {
    padding: 40px 28px;
  }
}
</style>
