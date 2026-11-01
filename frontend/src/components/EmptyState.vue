<template>
  <div class="empty">
    <span class="empty__icon">
      <el-icon :size="26"><component :is="icon" /></el-icon>
    </span>
    <h3 class="empty__title">{{ title || t('common.emptyTitle') }}</h3>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty__action">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { Box } from '@element-plus/icons-vue'
import { useI18n } from '../i18n'

defineProps({
  icon: { type: [Object, Function], default: Box },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})

const { t } = useI18n()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  text-align: center;
}

.empty__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: var(--c-surface-2);
  color: var(--c-ink-3);
  box-shadow: inset 0 0 0 1px var(--c-line);
}

.empty__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--c-ink);
}

.empty__desc {
  max-width: 340px;
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--c-ink-3);
}

.empty__action {
  margin-top: 22px;
}
</style>
