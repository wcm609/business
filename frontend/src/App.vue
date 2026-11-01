<template>
  <el-config-provider :locale="elementLocale">
    <div id="app-root">
      <NavBar v-if="!isAuthPage" />

      <main class="app-main" :class="{ 'app-main--auth': isAuthPage }">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>

      <AppFooter v-if="!isAuthPage" />
      <el-backtop v-if="!isAuthPage" :right="26" :bottom="26" />
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import { useI18n } from './i18n'

const route = useRoute()
const { locale, t } = useI18n()

/** 登录 / 注册页使用独立布局（无导航栏、页脚） */
const isAuthPage = computed(() => Boolean(route.meta.authLayout))

/** Element Plus 内置文案（分页、日期等）跟随语言切换 */
const elementLocale = computed(() => (locale.value === 'en' ? en : zhCn))

// 页面标题随语言与路由同步
watchEffect(() => {
  const pageTitle = route.meta.titleKey ? t(route.meta.titleKey) : ''
  document.title = pageTitle ? `${pageTitle} · ${t('common.brand')}` : t('common.defaultTitle')
})
</script>
