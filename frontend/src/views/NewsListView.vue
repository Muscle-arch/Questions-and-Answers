<template>
    <div class="news-list-page">
        <!-- 顶部导航栏 -->
        <nav class="list-nav">
            <div class="nav-container">
                <div class="nav-brand" @click="router.push('/')">
                    <img :src="logoUrl" alt="SCU" class="nav-logo" />
                    <span class="brand-text">校园资讯</span>
                </div>
                <button class="back-btn" @click="router.push('/')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>返回首页</span>
                </button>
            </div>
        </nav>

        <!-- 背景图 -->
        <div class="list-bg"></div>
        <div class="list-bg-overlay"></div>

        <!-- 内容区 -->
        <div class="list-content-wrapper">
            <!-- 头部 -->
            <div class="list-header">
                <h1 class="list-title">校园资讯</h1>
                <p class="list-desc">了解四川大学最新动态与校园生活</p>
            </div>

            <!-- 标签筛选 -->
            <div class="filter-tags">
                <button 
                    v-for="tag in tags" 
                    :key="tag.value"
                    :class="['filter-tag', { active: currentTag === tag.value }]"
                    @click="currentTag = tag.value"
                >
                    {{ tag.label }}
                </button>
            </div>

            <!-- 资讯列表 -->
            <div class="news-list">
                <div v-for="news in filteredNews" :key="news.id" class="news-card" @click="goToDetail(news.id)">
                    <div class="news-image">
                        <img :src="news.image" :alt="news.title" />
                        <span class="news-tag">{{ news.tag }}</span>
                    </div>
                    <div class="news-info">
                        <h3 class="news-title">{{ news.title }}</h3>
                        <p class="news-summary">{{ news.summary }}</p>
                        <div class="news-meta">
                            <span class="meta-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                                    <path d="M16 2v4M8 2v4M3 10h18"/>
                                </svg>
                                {{ news.date }}
                            </span>
                            <span class="meta-views">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                {{ news.views }}
                            </span>
                            <span class="meta-author">{{ news.author }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { newsList } from '@/data/newsData.js'

const router = useRouter()
const logoUrl = '/scu-logo.svg'
const currentTag = ref('all')

const tags = [
    { label: '全部', value: 'all' },
    { label: '学术科研', value: '学术科研' },
    { label: '校园活动', value: '校园活动' },
    { label: '通知公告', value: '通知公告' },
    { label: '学生风采', value: '学生风采' },
]

const filteredNews = computed(() => {
    if (currentTag.value === 'all') return newsList
    return newsList.filter(item => item.tag === currentTag.value)
})

function goToDetail(id) {
    router.push(`/news/${id}`)
}
</script>

<style scoped>
.news-list-page {
    min-height: 100vh;
    background: #f5f5f5;
    position: relative;
}

/* 顶部导航 */
.list-nav {
    background: linear-gradient(135deg, #9b1b30 0%, #c41e3a 100%);
    padding: 16px 0;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    position: relative;
    z-index: 10;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.nav-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    padding: 4px;
}

.brand-text {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.back-btn:hover {
    background: rgba(255,255,255,0.25);
}

.back-btn svg {
    width: 18px;
    height: 18px;
}

/* 背景图 */
.list-bg {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/bg1.png');
    background-size: cover;
    background-position: center;
    z-index: 0;
}

.list-bg-overlay {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(245, 245, 245, 0.93) 0%, rgba(245, 245, 245, 0.88) 100%);
    z-index: 0;
}

/* 内容区 */
.list-content-wrapper {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
}

/* 头部 */
.list-header {
    text-align: center;
    margin-bottom: 30px;
}

.list-title {
    font-size: 36px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.list-desc {
    font-size: 16px;
    color: #666;
}

/* 标签筛选 */
.filter-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
    flex-wrap: wrap;
    justify-content: center;
}

.filter-tag {
    padding: 10px 24px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 25px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-tag:hover {
    border-color: #9b1b30;
    color: #9b1b30;
}

.filter-tag.active {
    background: #9b1b30;
    color: #fff;
    border-color: #9b1b30;
}

/* 资讯列表 */
.news-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.news-card {
    display: flex;
    gap: 24px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

.news-image {
    position: relative;
    width: 280px;
    height: 180px;
    flex-shrink: 0;
    overflow: hidden;
}

.news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.news-card:hover .news-image img {
    transform: scale(1.05);
}

.news-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 14px;
    background: #9b1b30;
    color: #fff;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
}

.news-info {
    flex: 1;
    padding: 20px 24px 20px 0;
    display: flex;
    flex-direction: column;
}

.news-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 10px;
    line-height: 1.4;
}

.news-summary {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 16px;
    flex: 1;
}

.news-meta {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: #999;
}

.news-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.news-meta svg {
    width: 14px;
    height: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
    .nav-container { padding: 0 20px; }
    .list-content-wrapper { padding: 24px 20px; }
    .list-title { font-size: 28px; }
    .filter-tags { gap: 8px; }
    .filter-tag { padding: 8px 16px; font-size: 13px; }
    .news-card { flex-direction: column; }
    .news-image { width: 100%; height: 200px; }
    .news-info { padding: 20px; }
    .news-title { font-size: 18px; }
}
</style>
