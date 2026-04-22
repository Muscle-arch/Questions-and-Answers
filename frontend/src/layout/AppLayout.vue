<template>
    <div class="app-layout">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="header-bg"></div>
            <div class="header-content">
                <div class="header-left">
                    <div class="logo-wrapper">
                        <img :src="logoUrl" alt="SCU" class="logo" @error="onLogoError" />
                        <div class="logo-glow"></div>
                    </div>
                    <span class="site-title">四川大学智能助手</span>
                </div>
                <div class="header-right">
                    <template v-if="userStore.isLoggedIn">
                        <div class="user-info">
                            <div class="user-avatar">
                                <span>{{ userStore.username?.charAt(0)?.toUpperCase() || 'U' }}</span>
                            </div>
                            <span class="username">{{ userStore.username }}</span>
                        </div>
                        <button class="logout-btn" @click="handleLogout">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span>退出</span>
                        </button>
                    </template>
                    <template v-else>
                        <button class="login-btn" @click="router.push('/login')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            <span>登录</span>
                        </button>
                    </template>
                </div>
            </div>
            <div class="header-line"></div>
        </header>

        <!-- 主体：侧边栏 + 内容区 -->
        <div class="main">
            <Transition name="sidebar">
                <Sidebar v-if="showSidebar && userStore.isLoggedIn" class="sidebar" />
            </Transition>
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

defineProps({
    showSidebar: { type: Boolean, default: true }
})

const userStore = useUserStore()
const router = useRouter()
const logoUrl = '/scu-logo.svg'

async function handleLogout() {
    await userStore.logout()
    router.push('/login')
}

function onLogoError(e) {
    e.target.style.display = 'none'
}
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--color-bg);
}

.header {
    height: var(--header-height);
    position: relative;
    flex-shrink: 0;
    z-index: 100;
}

.header-bg {
    position: absolute;
    inset: 0;
    background: var(--gradient-header);
    background-size: 200% 100%;
    animation: gradient-x 8s ease infinite;
}

.header-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    color: #fff;
}

.header-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(200,149,108,0.4) 20%,
        rgba(255,255,255,0.5) 50%,
        rgba(200,149,108,0.4) 80%,
        transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 4s ease-in-out infinite;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 14px;
    animation: fadeInLeft 0.5s ease-out;
}

.logo-wrapper {
    position: relative;
    width: 36px;
    height: 36px;
}

.logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    padding: 3px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 2;
}

.logo:hover {
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}

.logo-glow {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    animation: glow-breathe 3s ease-in-out infinite;
    z-index: 1;
}

.site-title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    animation: fadeInRight 0.5s ease-out;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.95;
}

.logout-btn,
.login-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.logout-btn svg,
.login-btn svg {
    width: 16px;
    height: 16px;
}

.logout-btn:hover,
.login-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
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

.sidebar-enter-active,
.sidebar-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sidebar-enter-from,
.sidebar-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-chat);
    animation: fadeIn 0.3s ease-out;
}
</style>
