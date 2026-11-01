<template>
  <div class="settings">
    <!-- 深色 / 浅色切换 -->
    <button
      type="button"
      class="settings__icon"
      :title="t('settings.switchTheme')"
      :aria-label="t('settings.switchTheme')"
      :aria-pressed="isDark"
      @click="toggleTheme"
    >
      <el-icon :size="16">
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </button>

    <!-- 语言切换：直接点选目标语言 -->
    <div class="settings__lang" role="group" :aria-label="t('settings.language')">
      <button
        type="button"
        class="settings__lang-btn"
        :class="{ 'is-active': locale === 'zh' }"
        :aria-pressed="locale === 'zh'"
        :title="t('settings.zh')"
        @click="setLocale('zh')"
      >
        中
      </button>
      <button
        type="button"
        class="settings__lang-btn"
        :class="{ 'is-active': locale === 'en' }"
        :aria-pressed="locale === 'en'"
        :title="t('settings.en')"
        @click="setLocale('en')"
      >
        EN
      </button>
    </div>
  </div>
</template>

<script setup>
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useI18n } from '../i18n'
import { useTheme } from '../composables/useTheme'

const { locale, t, setLocale } = useI18n()
const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.settings {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.settings__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: var(--c-glass);
  color: var(--c-ink-2);
  transition: color var(--dur) var(--ease-soft), border-color var(--dur) var(--ease-soft),
    background-color var(--dur) var(--ease-soft), transform var(--dur) var(--ease-soft);
}

.settings__icon:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
  transform: translateY(-1px);
}

.settings__lang {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: var(--c-glass);
}

.settings__lang-btn {
  min-width: 30px;
  height: 28px;
  padding: 0 7px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--c-ink-3);
  transition: color var(--dur) var(--ease-soft), background-color var(--dur) var(--ease-soft);
}

.settings__lang-btn:hover {
  color: var(--c-ink);
}

.settings__lang-btn.is-active {
  background: var(--c-solid);
  color: var(--c-on-solid);
}
</style>
