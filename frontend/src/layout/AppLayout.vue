<template>
    <div class="app-layout">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="header-left">
                <img :src="logoUrl" alt="SCU" class="logo" @error="onLogoError" />
                <span class="site-title">四川大学智能助手</span>
            </div>
            <div class="header-right">
                <template v-if="userStore.isLoggedIn">
                    <span class="username">{{ userStore.username }}</span>
                    <el-button text @click="handleLogout" class="logout-btn">退出登录</el-button>
                </template>
                <template v-else>
                    <el-button text @click="router.push('/login')" class="logout-btn">登录</el-button>
                </template>
            </div>
        </header>

        <!-- 主体：侧边栏 + 内容区 -->
        <div class="main">
            <Sidebar v-if="showSidebar && userStore.isLoggedIn" class="sidebar" />
            <div class="content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

// 文件说明：通用页面布局组件
// 页面对应：智能问答页、校园导航页等需要统一顶部栏的页面
// 作用：提供“顶部栏 + 可选侧边栏 + 内容插槽”的统一骨架
// 通用页面骨架：顶部栏 + 可选侧边栏 + 内容插槽
defineProps({
    showSidebar: { type: Boolean, default: true }
})

const userStore = useUserStore()
const router = useRouter()
const logoUrl = '/scu-logo.svg'

function handleLogout() {
    // 退出后清空登录态并跳转登录页
    userStore.logout()
    router.push('/login')
}

function onLogoError(e) {
    // 图片加载失败时隐藏图片，避免破坏顶部布局
    e.target.style.display = 'none'
}
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.header {
    height: var(--header-height);
    background: var(--color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;
    box-shadow: var(--shadow-md);
    z-index: 100;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo {
    height: 32px;
    width: 32px;
    object-fit: contain;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
}

.site-title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.username {
    font-size: 14px;
    opacity: 0.9;
}

.logout-btn {
    color: rgba(255, 255, 255, 0.85) !important;
    font-size: 13px;
}

.logout-btn:hover {
    color: #fff !important;
}

.main {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
}

.content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
</style>
