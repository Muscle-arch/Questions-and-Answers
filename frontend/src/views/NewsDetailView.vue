<template>
    <div class="news-detail-page">
        <!-- 顶部导航栏 -->
        <nav class="detail-nav">
            <div class="nav-container">
                <div class="nav-brand" @click="router.push('/')">
                    <img :src="logoUrl" alt="SCU" class="nav-logo" />
                    <span class="brand-text">校园资讯</span>
                </div>
                <button class="back-btn" @click="goBack">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>返回</span>
                </button>
            </div>
        </nav>

        <!-- 背景图 -->
        <div class="detail-bg" :style="{ backgroundImage: `url(${news?.image || '/bg1.png'})` }"></div>
        <div class="detail-bg-overlay"></div>

        <!-- 内容区 -->
        <div class="detail-content-wrapper" v-if="news">
            <article class="detail-article">
                <div class="article-header">
                    <span class="article-tag">{{ news.tag }}</span>
                    <h1 class="article-title">{{ news.title }}</h1>
                    <div class="article-meta">
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            {{ news.date }}
                        </span>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {{ news.views }} 阅读
                        </span>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {{ news.author }}
                        </span>
                    </div>
                </div>

                <div class="article-image">
                    <img :src="news.image" :alt="news.title" />
                </div>

                <div class="article-body">
                    <p v-for="(paragraph, index) in contentParagraphs" :key="index" class="article-paragraph">
                        {{ paragraph }}
                    </p>
                </div>
            </article>

            <!-- 相关推荐 -->
            <div class="related-news" v-if="relatedNews.length > 0">
                <h3 class="related-title">相关推荐</h3>
                <div class="related-list">
                    <div v-for="item in relatedNews" :key="item.id" class="related-item" @click="goToNews(item.id)">
                        <div class="related-thumb">
                            <img :src="item.image" :alt="item.title" />
                        </div>
                        <div class="related-info">
                            <span class="related-tag">{{ item.tag }}</span>
                            <h4 class="related-item-title">{{ item.title }}</h4>
                            <span class="related-date">{{ item.date }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 未找到 -->
        <div class="detail-content-wrapper" v-else>
            <div class="not-found">
                <h2>资讯不存在</h2>
                <p>该资讯可能已被删除或链接错误</p>
                <button class="back-home-btn" @click="router.push('/')">返回首页</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNewsById, newsList } from '@/data/newsData.js'

const router = useRouter()
const route = useRoute()
const logoUrl = '/scu-logo.svg'

const news = computed(() => {
    return getNewsById(route.params.id)
})

const contentParagraphs = computed(() => {
    if (!news.value) return []
    return news.value.content.split('\n').filter(p => p.trim() !== '')
})

const relatedNews = computed(() => {
    if (!news.value) return []
    return newsList
        .filter(item => item.id !== news.value.id && item.tag === news.value.tag)
        .slice(0, 3)
})

function goBack() {
    router.back()
}

function goToNews(id) {
    router.push(`/news/${id}`)
}
</script>

<style scoped>
.news-detail-page {
    min-height: 100vh;
    background: #f5f5f5;
    position: relative;
}

/* 顶部导航 */
.detail-nav {
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
.detail-bg {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
}

.detail-bg-overlay {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(245, 245, 245, 0.93) 0%, rgba(245, 245, 245, 0.88) 100%);
    z-index: 0;
}

/* 内容区 */
.detail-content-wrapper {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px;
}

.detail-article {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    margin-bottom: 40px;
}

.article-header {
    padding: 40px 40px 24px;
}

.article-tag {
    display: inline-block;
    padding: 6px 16px;
    background: #9b1b30;
    color: #fff;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
}

.article-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 20px;
}

.article-meta {
    display: flex;
    gap: 24px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #999;
}

.meta-item svg {
    width: 16px;
    height: 16px;
}

.article-image {
    width: 100%;
    height: 400px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-body {
    padding: 40px;
}

.article-paragraph {
    font-size: 16px;
    line-height: 1.9;
    color: #333;
    margin-bottom: 20px;
    text-indent: 2em;
}

/* 相关推荐 */
.related-news {
    background: #fff;
    border-radius: 20px;
    padding: 30px 40px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.08);
}

.related-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.related-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.related-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.related-item:hover {
    background: #fef5f6;
    transform: translateX(8px);
}

.related-thumb {
    width: 100px;
    height: 75px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.related-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.related-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.related-tag {
    display: inline-block;
    padding: 2px 10px;
    background: #9b1b30;
    color: #fff;
    border-radius: 10px;
    font-size: 12px;
    margin-bottom: 6px;
    width: fit-content;
}

.related-item-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
    line-height: 1.4;
}

.related-date {
    font-size: 13px;
    color: #999;
}

/* 未找到 */
.not-found {
    text-align: center;
    padding: 100px 40px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.08);
}

.not-found h2 {
    font-size: 28px;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.not-found p {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
}

.back-home-btn {
    padding: 12px 32px;
    background: #9b1b30;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
}

.back-home-btn:hover {
    background: #7a1526;
}

/* 响应式 */
@media (max-width: 768px) {
    .nav-container { padding: 0 20px; }
    .detail-content-wrapper { padding: 20px; }
    .article-header { padding: 24px 24px 16px; }
    .article-title { font-size: 24px; }
    .article-image { height: 220px; }
    .article-body { padding: 24px; }
    .article-meta { flex-wrap: wrap; gap: 12px; }
    .related-news { padding: 20px; }
    .related-item { flex-direction: column; }
    .related-thumb { width: 100%; height: 160px; }
}
</style>
