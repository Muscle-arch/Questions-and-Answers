<template>
    <div class="home-page">
        <!-- 顶部导航栏 -->
        <nav class="top-nav" :class="{ 'nav-scrolled': isScrolled }">
            <div class="nav-container">
                <div class="nav-brand" @click="scrollToTop">
                    <img :src="logoUrl" alt="SCU" class="nav-logo" />
                    <div class="brand-text">
                        <span class="brand-title">四川大学</span>
                        <span class="brand-subtitle">Sichuan University</span>
                    </div>
                </div>
                <div class="nav-menu">
                    <a href="#features" class="nav-link">功能服务</a>
                    <a href="#news" class="nav-link">校园资讯</a>
                    <a href="#about" class="nav-link">关于我们</a>
                </div>
                <div class="nav-actions">
                    <template v-if="!userStore.isLoggedIn">
                        <button class="nav-btn login" @click="router.push('/login')">登录</button>
                        <button class="nav-btn register" @click="router.push('/register')">注册</button>
                    </template>
                    <template v-else>
                        <span class="user-name">{{ userStore.username }}</span>
                        <button class="nav-btn logout" @click="handleLogout">退出</button>
                    </template>
                </div>
            </div>
        </nav>

        <!-- 大图轮播区域 -->
        <section class="hero-section">
            <div class="carousel-container">
                <div class="carousel-slide" 
                     v-for="(slide, index) in carouselSlides" 
                     :key="index"
                     :class="{ active: currentSlide === index }"
                     :style="{ backgroundImage: `url(${slide.image})` }">
                    <div class="slide-overlay"></div>
                    <div class="slide-content">
                        <h2 class="slide-title">{{ slide.title }}</h2>
                        <p class="slide-desc">{{ slide.desc }}</p>
                    </div>
                </div>
                
                <!-- 轮播指示器 -->
                <div class="carousel-indicators">
                    <button v-for="(_, index) in carouselSlides" 
                            :key="index"
                            class="indicator"
                            :class="{ active: currentSlide === index }"
                            @click="setSlide(index)">
                    </button>
                </div>

                <!-- 轮播切换按钮 -->
                <button class="carousel-btn prev" @click="prevSlide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <button class="carousel-btn next" @click="nextSlide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- 功能模块入口 -->
        <section id="features" class="features-section">
            <div class="section-container">
                <div class="section-header">
                    <h2 class="section-title">功能服务</h2>
                    <p class="section-subtitle">为师生提供便捷的校园智能服务</p>
                </div>
                
                <div class="features-grid">
                    <div class="feature-card" @click="goChat">
                        <div class="feature-icon">
                            <svg viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="20" r="12" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M20 36C20 36 24 44 32 44C40 44 44 36 44 36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                                <circle cx="28" cy="18" r="2" fill="currentColor"/>
                                <circle cx="36" cy="18" r="2" fill="currentColor"/>
                                <path d="M32 24V28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">智能问答</h3>
                        <p class="feature-desc">基于 DeepSeek 大模型，精准回答校园事务、政策制度、院系专业等问题</p>
                        <span class="feature-arrow">→</span>
                    </div>

                    <div class="feature-card" @click="goNav">
                        <div class="feature-icon">
                            <svg viewBox="0 0 64 64" fill="none">
                                <path d="M8 16L24 8L40 16L56 8V48L40 56L24 48L8 56V16Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
                                <path d="M24 8V48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M40 16V56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="32" cy="28" r="6" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">校园导航</h3>
                        <p class="feature-desc">自然语言输入起终点，自动规划最优路线，支持步行、骑行、驾车多种方式</p>
                        <span class="feature-arrow">→</span>
                    </div>

                    <div class="feature-card" @click="goTools">
                        <div class="feature-icon">
                            <svg viewBox="0 0 64 64" fill="none">
                                <rect x="12" y="12" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="34" y="12" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="12" y="34" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="34" y="34" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">校园工具</h3>
                        <p class="feature-desc">GPA计算器、教学周查询、倒计时等实用工具，满足日常学习需求</p>
                        <span class="feature-arrow">→</span>
                    </div>

                    <div class="feature-card" @click="goNews">
                        <div class="feature-icon">
                            <svg viewBox="0 0 64 64" fill="none">
                                <path d="M8 12h48v40H8z" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M16 20h32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M16 28h24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M16 36h28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M16 44h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3 class="feature-title">校园资讯</h3>
                        <p class="feature-desc">实时推送学校新闻、学术讲座、活动通知等重要信息</p>
                        <span class="feature-arrow">→</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 校园新闻资讯 -->
        <section id="news" class="news-section">
            <div class="section-container">
                <div class="section-header">
                    <h2 class="section-title">校园资讯</h2>
                    <p class="section-subtitle">了解四川大学最新动态</p>
                    <a href="#" class="view-more" @click.prevent="goNewsList">查看更多 →</a>
                </div>

                <div class="news-grid">
                    <div class="news-card featured" @click="openNews(newsList[0])" style="cursor: pointer;">
                        <div class="news-image">
                            <img :src="newsList[0].image" :alt="newsList[0].title" />
                            <span class="news-tag">{{ newsList[0].tag }}</span>
                        </div>
                        <div class="news-content">
                            <h3 class="news-title">{{ newsList[0].title }}</h3>
                            <p class="news-summary">{{ newsList[0].summary }}</p>
                            <div class="news-meta">
                                <span class="news-date">{{ newsList[0].date }}</span>
                                <span class="news-views">{{ newsList[0].views }} 阅读</span>
                            </div>
                        </div>
                    </div>

                    <div class="news-list">
                        <div v-for="(news, index) in newsList.slice(1)" 
                             :key="index" 
                             class="news-item"
                             @click="openNews(news)"
                             style="cursor: pointer;">
                            <div class="news-thumb">
                                <img :src="news.image" :alt="news.title" />
                            </div>
                            <div class="news-info">
                                <span class="news-tag small">{{ news.tag }}</span>
                                <h4 class="news-title">{{ news.title }}</h4>
                                <span class="news-date">{{ news.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 数据统计展示 -->
        <section class="stats-section">
            <div class="section-container">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">1896</span>
                        <span class="stat-label">建校年份</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">3</span>
                        <span class="stat-label">个校区</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">37</span>
                        <span class="stat-label">个学院</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">60000+</span>
                        <span class="stat-label">在校学生</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 页脚 -->
        <footer id="about" class="footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <img :src="logoUrl" alt="SCU" class="footer-logo" />
                        <div class="footer-info">
                            <h3>四川大学智能助手</h3>
                            <p>基于人工智能技术，为师生提供便捷的校园服务</p>
                        </div>
                    </div>
                    <div class="footer-links">
                        <div class="link-group">
                            <h4>功能服务</h4>
                            <a @click="goChat">智能问答</a>
                            <a @click="goNav">校园导航</a>
                            <a @click="goTools">校园工具</a>
                        </div>
                        <div class="link-group">
                            <h4>快速链接</h4>
                            <a href="https://www.scu.edu.cn" target="_blank">学校官网</a>
                            <a href="#">教务系统</a>
                            <a href="#">图书馆</a>
                        </div>
                        <div class="link-group">
                            <h4>联系我们</h4>
                            <p>地址：四川省成都市一环路南一段24号</p>
                            <p>邮编：610065</p>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© 2026 四川大学智能助手 | 基于 DeepSeek 大模型构建</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const logoUrl = '/scu-logo.svg'

// 滚动状态
const isScrolled = ref(false)

// 轮播图数据
const carouselSlides = [
    {
        image: '/bg1.png',
        title: '海纳百川，有容乃大',
        desc: '四川大学是教育部直属全国重点大学，是国家布局在中国西部的重点建设的高水平研究型综合大学'
    },
    {
        image: '/bg2.jpg',
        title: '追求卓越，勇攀高峰',
        desc: '学校拥有37个学院，涵盖文、理、工、医、经、管、法、史、哲、农、教、艺等12个门类'
    },
    {
        image: '/bg3.jpg',
        title: '智慧校园，服务师生',
        desc: '基于大模型技术，为师生提供智能问答、校园导航等一站式校园服务'
    },
    {
        image: '/bg4.jpg',
        title: '百年川大，薪火相传',
        desc: '始建于1896年，是中国近代创办的最早的几所大学之一'
    }
]

const currentSlide = ref(0)
let slideInterval = null

// 新闻数据
import { newsList as allNewsList } from '@/data/newsData.js'
const newsList = allNewsList.slice(0, 5)

// 轮播控制
function startCarousel() {
    slideInterval = setInterval(() => {
        nextSlide()
    }, 5000)
}

function stopCarousel() {
    if (slideInterval) {
        clearInterval(slideInterval)
        slideInterval = null
    }
}

function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
}

function prevSlide() {
    currentSlide.value = (currentSlide.value - 1 + carouselSlides.length) % carouselSlides.length
}

function setSlide(index) {
    currentSlide.value = index
    stopCarousel()
    startCarousel()
}

// 滚动监听
function handleScroll() {
    isScrolled.value = window.scrollY > 50
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 页面跳转
function goChat() {
    if (userStore.isLoggedIn) {
        router.push('/chat')
    } else {
        router.push('/login?redirect=/chat')
    }
}

function goNav() {
    router.push('/nav')
}

function goTools() {
    router.push('/tools')
}

function goNews() {
    document.getElementById('news').scrollIntoView({ behavior: 'smooth' })
}

function openNews(news) {
    router.push(`/news/${news.id}`)
}

function goNewsList() {
    router.push('/news')
}

async function handleLogout() {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
}

onMounted(() => {
    startCarousel()
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    stopCarousel()
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 基础样式 */
.home-page {
    min-height: 100vh;
    background: #f5f5f5;
}

/* 顶部导航 */
.top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: transparent;
    transition: all 0.3s ease;
    padding: 16px 0;
}

.top-nav.nav-scrolled {
    background: rgba(155, 27, 48, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    padding: 12px 0;
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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fff;
    padding: 4px;
}

.brand-text {
    display: flex;
    flex-direction: column;
    color: #fff;
}

.brand-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
}

.brand-subtitle {
    font-size: 12px;
    opacity: 0.8;
    letter-spacing: 1px;
}

.nav-menu {
    display: flex;
    gap: 40px;
}

.nav-link {
    color: #fff;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: opacity 0.3s;
    position: relative;
}

.nav-link:hover {
    opacity: 0.8;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: #fff;
    transition: width 0.3s;
}

.nav-link:hover::after {
    width: 100%;
}

.nav-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.nav-btn {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
}

.nav-btn.login {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.5);
}

.nav-btn.login:hover {
    background: rgba(255,255,255,0.1);
}

.nav-btn.register {
    background: #fff;
    color: #9b1b30;
}

.nav-btn.register:hover {
    background: #f0f0f0;
}

.nav-btn.logout {
    background: rgba(255,255,255,0.2);
    color: #fff;
}

.user-name {
    color: #fff;
    font-size: 14px;
    margin-right: 8px;
}

/* 大图轮播区域 */
.hero-section {
    height: 100vh;
    position: relative;
}

.carousel-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.carousel-slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1s ease;
}

.carousel-slide.active {
    opacity: 1;
}

.slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.3) 0%,
        rgba(0,0,0,0.2) 50%,
        rgba(0,0,0,0.5) 100%
    );
}

.slide-content {
    position: absolute;
    bottom: 180px;
    left: 80px;
    color: #fff;
    max-width: 600px;
}

.slide-title {
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 20px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: fadeInUp 0.8s ease;
}

.slide-desc {
    font-size: 18px;
    line-height: 1.8;
    opacity: 0.95;
    animation: fadeInUp 0.8s ease 0.2s both;
}

.carousel-indicators {
    position: absolute;
    bottom: 80px;
    left: 80px;
    display: flex;
    gap: 12px;
}

.indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s;
}

.indicator.active {
    background: #fff;
}

.indicator:hover {
    background: rgba(255,255,255,0.5);
}

.carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    backdrop-filter: blur(4px);
}

.carousel-btn:hover {
    background: rgba(255,255,255,0.2);
}

.carousel-btn.prev {
    left: 40px;
}

.carousel-btn.next {
    right: 40px;
}

.carousel-btn svg {
    width: 24px;
    height: 24px;
}

/* 功能模块区域 */
.features-section {
    padding: 100px 0;
    background: #fff;
}

.section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
}

.section-header {
    text-align: center;
    margin-bottom: 60px;
}

.section-title {
    font-size: 42px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16px;
}

.section-subtitle {
    font-size: 18px;
    color: #666;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
}

.feature-card {
    background: #fff;
    border-radius: 16px;
    padding: 40px 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid #eee;
    position: relative;
    overflow: hidden;
}

.feature-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    border-color: #9b1b30;
}

.feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, #9b1b30 0%, #c41e3a 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.feature-icon svg {
    width: 40px;
    height: 40px;
}

.feature-title {
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.feature-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 20px;
}

.feature-arrow {
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;
    background: #f5f5f5;
    color: #9b1b30;
    font-size: 18px;
    transition: all 0.3s;
}

.feature-card:hover .feature-arrow {
    background: #9b1b30;
    color: #fff;
}

/* 新闻资讯区域 */
.news-section {
    padding: 100px 0;
    background: #f8f9fa;
}

.news-section .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
}

.view-more {
    color: #9b1b30;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: opacity 0.3s;
}

.view-more:hover {
    opacity: 0.8;
}

.news-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 40px;
}

.news-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.news-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.news-card.featured .news-image {
    height: 320px;
}

.news-image {
    position: relative;
    height: 200px;
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
    top: 16px;
    left: 16px;
    background: #9b1b30;
    color: #fff;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
}

.news-tag.small {
    position: static;
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
}

.news-content {
    padding: 24px;
}

.news-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
    line-height: 1.4;
}

.news-summary {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 16px;
}

.news-meta {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: #999;
}

.news-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.news-item {
    display: flex;
    gap: 20px;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.news-item:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.news-thumb {
    width: 120px;
    height: 90px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.news-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.news-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.news-info .news-title {
    font-size: 16px;
    margin-bottom: 8px;
}

.news-info .news-date {
    font-size: 13px;
    color: #999;
}

/* 数据统计区域 */
.stats-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #9b1b30 0%, #c41e3a 100%);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    text-align: center;
}

.stat-item {
    color: #fff;
}

.stat-number {
    display: block;
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 16px;
    opacity: 0.9;
}

/* 页脚 */
.footer {
    background: #1a1a1a;
    color: #fff;
    padding: 80px 0 40px;
}

.footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
}

.footer-content {
    display: grid;
    grid-template-columns: 1.5fr 2fr;
    gap: 80px;
    margin-bottom: 60px;
}

.footer-brand {
    display: flex;
    gap: 20px;
}

.footer-logo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #fff;
    padding: 6px;
}

.footer-info h3 {
    font-size: 20px;
    margin-bottom: 12px;
}

.footer-info p {
    font-size: 14px;
    color: #999;
    line-height: 1.7;
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
}

.link-group h4 {
    font-size: 16px;
    margin-bottom: 20px;
    color: #fff;
}

.link-group a,
.link-group p {
    display: block;
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s;
}

.link-group a:hover {
    color: #fff;
}

.footer-bottom {
    border-top: 1px solid #333;
    padding-top: 40px;
    text-align: center;
}

.footer-bottom p {
    font-size: 14px;
    color: #666;
}

/* 动画 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式 */
@media (max-width: 1200px) {
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .news-grid {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .nav-container {
        padding: 0 20px;
    }
    
    .nav-menu {
        display: none;
    }
    
    .slide-content {
        left: 20px;
        right: 20px;
        bottom: 120px;
    }
    
    .slide-title {
        font-size: 32px;
    }
    
    .carousel-btn {
        display: none;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .news-item {
        flex-direction: column;
    }
    
    .news-thumb {
        width: 100%;
        height: 160px;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    
    .footer-links {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }
    
    .stat-number {
        font-size: 36px;
    }
}
</style>
