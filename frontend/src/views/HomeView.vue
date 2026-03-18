<template>
    <div class="home-page">
        <!-- 背景图 -->
        <div class="bg-overlay" />

        <!-- 顶部导航 -->
        <nav class="nav-bar">
            <div class="brand">
                <img :src="logoUrl" alt="SCU" class="nav-logo" @error="e => e.target.style.display = 'none'" />
                <span>四川大学</span>
            </div>
            <div class="nav-actions">
                <template v-if="!userStore.isLoggedIn">
                    <el-button @click="router.push('/login')" plain>登录</el-button>
                    <el-button @click="router.push('/register')" type="primary">注册</el-button>
                </template>
                <template v-else>
                    <el-button @click="router.push('/chat')" plain>智能问答</el-button>
                    <el-button @click="router.push('/nav')" type="primary">校园导航</el-button>
                </template>
            </div>
        </nav>

        <!-- 主内容 -->
        <main class="hero">
            <h1 class="hero-title">四川大学智能问答助手</h1>
            <p class="hero-desc">基于大模型 × RAG 知识库 × 校内导航，<br>一站式解答您的校园问题</p>

            <div class="feature-cards">
                <div class="card clickable" @click="goChat">
                    <div class="card-icon">🤖</div>
                    <h3>智能问答</h3>
                    <p>基于 DeepSeek 大模型与 RAG 技术，精准回答校内事务、政策制度、院系专业等问题</p>
                </div>
                <div class="card clickable" @click="goNav">
                    <div class="card-icon">🗺️</div>
                    <h3>校内导航</h3>
                    <p>自然语言输入起终点，自动规划步行最优路线，可视化地图展示</p>
                </div>
            </div>

            <div class="entry-actions">
                <el-button class="start-btn" size="large" @click="goChat">
                    进入智能问答
                </el-button>
                <el-button class="start-btn nav-btn" size="large" @click="goNav">
                    进入校园导航
                </el-button>
            </div>

            <p class="disclaimer">望江校区 · 华西校区 · 江安校区</p>
        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 文件说明：首页
// 页面对应：路由 /
// 作用：作为系统门户页，展示两个功能入口并负责跳转到问答或导航
const router = useRouter()
const userStore = useUserStore()
const logoUrl = '/scu-logo.svg'

// 智能问答入口：未登录则先跳登录，登录后回到问答页
function goChat() {
    if (userStore.isLoggedIn) {
        router.push('/chat')
    } else {
        router.push('/login?redirect=/chat')
    }
}

// 校园导航入口：允许匿名访问
function goNav() {
    router.push('/nav')
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    position: relative;
    background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SCU_WJ_Campus.jpg/1280px-SCU_WJ_Campus.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}

.bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
            rgba(155, 27, 48, 0.82) 0%,
            rgba(80, 10, 20, 0.75) 100%);
}

.nav-bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 40px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
}

.nav-logo {
    height: 36px;
    width: 36px;
    object-fit: contain;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
}

.nav-actions {
    display: flex;
    gap: 10px;
}

.nav-actions .el-button {
    border-color: rgba(255, 255, 255, 0.6) !important;
    color: #fff !important;
    background: transparent !important;
}

.nav-actions .el-button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
}

.hero {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 68px);
    padding: 40px 20px;
    text-align: center;
}

.hero-title {
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 16px;
}

.hero-desc {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.8;
    margin-bottom: 40px;
}

.feature-cards {
    display: flex;
    gap: 24px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    justify-content: center;
}

.card {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    padding: 24px 28px;
    width: 240px;
    text-align: center;
    color: #fff;
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-4px);
}

.card.clickable {
    cursor: pointer;
}

.card-icon {
    font-size: 32px;
    margin-bottom: 10px;
}

.card h3 {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 8px;
}

.card p {
    font-size: 13px;
    opacity: 0.85;
    line-height: 1.6;
}

.start-btn {
    background: #fff !important;
    color: var(--color-primary) !important;
    border-color: #fff !important;
    font-size: 16px !important;
    padding: 12px 36px !important;
    border-radius: 24px !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
}

.entry-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.nav-btn {
    background: transparent !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
}

@media (max-width: 768px) {
    .entry-actions {
        width: 100%;
    }

    .start-btn {
        width: 100%;
    }
}

.disclaimer {
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 13px;
}
</style>
