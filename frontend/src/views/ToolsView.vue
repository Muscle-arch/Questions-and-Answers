<template>
    <div class="tools-page">
        <!-- 顶部导航栏 -->
        <nav class="tools-nav">
            <div class="nav-container">
                <div class="nav-brand" @click="router.push('/')">
                    <img :src="logoUrl" alt="SCU" class="nav-logo" />
                    <span class="brand-text">校园工具箱</span>
                </div>
                <button class="back-btn" @click="router.push('/')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>返回首页</span>
                </button>
            </div>
        </nav>

        <!-- 工具选择区域 -->
        <div class="tools-container">
            <!-- 未选择工具时显示工具卡片 -->
            <div v-if="!currentTool" class="tools-select">
                <div class="tools-hero">
                    <div class="hero-bg"></div>
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        <h1 class="page-title">校园工具箱</h1>
                        <p class="page-desc">实用的校园小工具，让学习生活更便捷</p>
                    </div>
                </div>

                <div class="tools-grid-wrapper">
                    <div class="tools-grid">
                    <div class="tool-card" @click="selectTool('gpa')">
                        <div class="tool-icon gpa">
                            <svg viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M32 16v16l12 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                                <text x="32" y="36" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">GPA</text>
                            </svg>
                        </div>
                        <h3 class="tool-name">GPA计算器</h3>
                        <p class="tool-intro">输入各科成绩与学分，自动计算平均绩点</p>
                        <span class="tool-enter">进入使用 →</span>
                    </div>

                    <div class="tool-card" @click="selectTool('week')">
                        <div class="tool-icon week">
                            <svg viewBox="0 0 64 64" fill="none">
                                <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M12 20h40" stroke="currentColor" stroke-width="2"/>
                                <path d="M24 4v8M40 4v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <text x="32" y="44" text-anchor="middle" fill="currentColor" font-size="16" font-weight="bold">周</text>
                            </svg>
                        </div>
                        <h3 class="tool-name">教学周查询</h3>
                        <p class="tool-intro">查询当前是第几教学周，学期进度一目了然</p>
                        <span class="tool-enter">进入使用 →</span>
                    </div>

                    <div class="tool-card" @click="selectTool('countdown')">
                        <div class="tool-icon countdown">
                            <svg viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M32 20v12l8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                                <path d="M32 8v4M32 52v4M8 32h4M52 32h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3 class="tool-name">倒计时</h3>
                        <p class="tool-intro">考试倒计时、假期倒计时，自定义目标日期</p>
                        <span class="tool-enter">进入使用 →</span>
                    </div>

                    <div class="tool-card" @click="selectTool('random')">
                        <div class="tool-icon random">
                            <svg viewBox="0 0 64 64" fill="none">
                                <rect x="8" y="12" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="36" y="12" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="8" y="36" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2.5"/>
                                <rect x="36" y="36" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2.5"/>
                                <path d="M28 22h8M28 46h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3 class="tool-name">随机抽号</h3>
                        <p class="tool-intro">课堂提问、活动抽奖，随机抽取幸运号码</p>
                        <span class="tool-enter">进入使用 →</span>
                    </div>
                    </div>
                </div>
            </div>

            <!-- GPA计算器 -->
            <div v-else-if="currentTool === 'gpa'" class="tool-panel">
                <div class="panel-bg" style="background-image: url('/bg2.jpg')"></div>
                <div class="panel-bg-overlay"></div>
                <div class="panel-header">
                    <button class="panel-back" @click="currentTool = ''">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h2 class="panel-title">GPA计算器</h2>
                </div>

                <div class="gpa-content">
                    <div class="gpa-intro">
                        <p>四川大学绩点计算方式：绩点 = (分数 - 50) / 10，最高4.0</p>
                    </div>

                    <div class="course-list">
                        <div v-for="(course, index) in gpaCourses" :key="index" class="course-row">
                            <input v-model="course.name" type="text" placeholder="课程名称（选填）" class="course-input name" />
                            <input v-model.number="course.score" type="number" placeholder="成绩" min="0" max="100" class="course-input score" />
                            <input v-model.number="course.credit" type="number" placeholder="学分" min="0" max="20" step="0.5" class="course-input credit" />
                            <button class="course-delete" @click="removeCourse(index)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button class="add-course-btn" @click="addCourse">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        添加课程
                    </button>

                    <div class="gpa-result" v-if="gpaResult !== null">
                        <div class="result-card">
                            <span class="result-label">平均绩点</span>
                            <span class="result-value">{{ gpaResult.gpa }}</span>
                            <div class="result-detail">
                                <span>加权平均分: {{ gpaResult.avgScore }}</span>
                                <span>总学分: {{ gpaResult.totalCredits }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 教学周查询 -->
            <div v-else-if="currentTool === 'week'" class="tool-panel">
                <div class="panel-bg" style="background-image: url('/bg3.jpg')"></div>
                <div class="panel-bg-overlay"></div>
                <div class="panel-header">
                    <button class="panel-back" @click="currentTool = ''">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h2 class="panel-title">教学周查询</h2>
                </div>

                <div class="week-content">
                    <!-- 输入设置区 -->
                    <div class="week-settings">
                        <h3 class="settings-title">学期设置</h3>
                        <div class="settings-row">
                            <div class="setting-item">
                                <label>开学日期</label>
                                <input v-model="semesterStart" type="date" class="setting-input" />
                            </div>
                            <div class="setting-item">
                                <label>学期总周数</label>
                                <input v-model.number="totalWeeks" type="number" min="1" max="52" class="setting-input" />
                            </div>
                            <div class="setting-item">
                                <label>当前日期</label>
                                <input v-model="currentDateInput" type="date" class="setting-input" />
                            </div>
                        </div>
                    </div>

                    <div class="week-card">
                        <div class="week-display">
                            <span class="week-label">当前是</span>
                            <span class="week-number">第 {{ currentWeek }} 周</span>
                            <span class="week-day">{{ currentDayText }}</span>
                        </div>

                        <div class="week-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: weekProgress + '%' }"></div>
                            </div>
                            <span class="progress-text">本学期已进行 {{ weekProgress }}%</span>
                        </div>
                    </div>

                    <div class="semester-info">
                        <div class="info-row">
                            <span class="info-label">开学日期</span>
                            <span class="info-value">{{ semesterStart }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">学期周数</span>
                            <span class="info-value">{{ totalWeeks }} 周</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">剩余周数</span>
                            <span class="info-value">{{ remainingWeeks }} 周</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">学期结束</span>
                            <span class="info-value">{{ semesterEnd }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 倒计时 -->
            <div v-else-if="currentTool === 'countdown'" class="tool-panel">
                <div class="panel-bg" style="background-image: url('/bg4.jpg')"></div>
                <div class="panel-bg-overlay"></div>
                <div class="panel-header">
                    <button class="panel-back" @click="currentTool = ''">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h2 class="panel-title">倒计时</h2>
                </div>

                <div class="countdown-content">
                    <!-- 预设倒计时 -->
                    <div class="preset-section">
                        <h3 class="section-title">常用倒计时</h3>
                        <div class="preset-list">
                            <div v-for="(item, index) in presetCountdowns" :key="index" class="preset-card">
                                <div class="preset-info">
                                    <span class="preset-name">{{ item.name }}</span>
                                    <span class="preset-date">{{ item.date }}</span>
                                </div>
                                <div class="preset-time">
                                    <span class="time-number">{{ item.days }}</span>
                                    <span class="time-unit">天</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 自定义倒计时 -->
                    <div class="custom-section">
                        <h3 class="section-title">自定义倒计时</h3>
                        <div class="custom-input">
                            <input v-model="customCountdown.name" type="text" placeholder="输入目标名称（如：期末考试）" class="custom-name" />
                            <input v-model="customCountdown.date" type="date" class="custom-date" />
                            <button class="custom-add" @click="addCustomCountdown">添加</button>
                        </div>

                        <div class="custom-list">
                            <div v-for="(item, index) in customCountdowns" :key="index" class="custom-card">
                                <div class="custom-info">
                                    <span class="custom-name-text">{{ item.name }}</span>
                                    <span class="custom-date-text">{{ item.date }}</span>
                                </div>
                                <div class="custom-time">
                                    <span class="time-number">{{ item.days }}</span>
                                    <span class="time-unit">天</span>
                                </div>
                                <button class="custom-delete" @click="removeCustomCountdown(index)">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 随机抽号 -->
            <div v-else-if="currentTool === 'random'" class="tool-panel">
                <div class="panel-bg" style="background-image: url('/bg5.jpg')"></div>
                <div class="panel-bg-overlay"></div>
                <div class="panel-header">
                    <button class="panel-back" @click="currentTool = ''">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h2 class="panel-title">随机抽号</h2>
                </div>

                <div class="random-content">
                    <div class="random-settings">
                        <div class="setting-row">
                            <span class="setting-label">范围</span>
                            <div class="range-inputs">
                                <input v-model.number="randomRange.min" type="number" placeholder="最小值" />
                                <span>至</span>
                                <input v-model.number="randomRange.max" type="number" placeholder="最大值" />
                            </div>
                        </div>
                        <div class="setting-row">
                            <span class="setting-label">抽取数量</span>
                            <input v-model.number="randomCount" type="number" min="1" max="10" class="count-input" />
                        </div>
                        <div class="setting-row">
                            <span class="setting-label">模式</span>
                            <div class="mode-select">
                                <button :class="{ active: randomMode === 'single' }" @click="randomMode = 'single'">单次抽取</button>
                                <button :class="{ active: randomMode === 'batch' }" @click="randomMode = 'batch'">批量抽取</button>
                            </div>
                        </div>
                    </div>

                    <button class="random-btn" @click="drawRandom" :disabled="isDrawing">
                        <span v-if="!isDrawing">开始抽取</span>
                        <span v-else>抽取中...</span>
                    </button>

                    <div class="random-result" v-if="randomResults.length > 0">
                        <div class="result-display">
                            <div v-for="(num, index) in randomResults" :key="index" class="result-ball" :style="{ animationDelay: index * 0.1 + 's' }">
                                {{ num }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logoUrl = '/scu-logo.svg'
const currentTool = ref('')

function selectTool(tool) {
    currentTool.value = tool
}

// ==================== GPA计算器 ====================
const gpaCourses = ref([
    { name: '', score: null, credit: null }
])

function addCourse() {
    gpaCourses.value.push({ name: '', score: null, credit: null })
}

function removeCourse(index) {
    if (gpaCourses.value.length > 1) {
        gpaCourses.value.splice(index, 1)
    }
}

const gpaResult = computed(() => {
    const validCourses = gpaCourses.value.filter(c => c.score !== null && c.credit !== null && c.score !== '' && c.credit !== '')
    if (validCourses.length === 0) return null

    let totalScore = 0
    let totalCredits = 0
    let totalGpa = 0

    validCourses.forEach(c => {
        const score = Number(c.score)
        const credit = Number(c.credit)
        let gpa = 0
        if (score >= 90) gpa = 4.0
        else if (score >= 85) gpa = 3.7
        else if (score >= 82) gpa = 3.3
        else if (score >= 78) gpa = 3.0
        else if (score >= 75) gpa = 2.7
        else if (score >= 72) gpa = 2.3
        else if (score >= 68) gpa = 2.0
        else if (score >= 66) gpa = 1.7
        else if (score >= 64) gpa = 1.3
        else if (score >= 60) gpa = 1.0

        totalScore += score * credit
        totalCredits += credit
        totalGpa += gpa * credit
    })

    if (totalCredits === 0) return null

    return {
        gpa: (totalGpa / totalCredits).toFixed(2),
        avgScore: (totalScore / totalCredits).toFixed(1),
        totalCredits: totalCredits.toFixed(1)
    }
})

// ==================== 教学周查询 ====================
const semesterStart = ref('2026-02-24')
const totalWeeks = ref(18)
const currentDateInput = ref(formatDate(new Date()))

function formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const currentWeek = computed(() => {
    const start = new Date(semesterStart.value)
    const now = currentDateInput.value ? new Date(currentDateInput.value) : new Date()
    const diffTime = now - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const week = Math.floor(diffDays / 7) + 1
    const maxWeek = totalWeeks.value
    return week > 0 ? (week > maxWeek ? maxWeek : week) : 1
})

const currentDayText = computed(() => {
    const date = currentDateInput.value ? new Date(currentDateInput.value) : new Date()
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return days[date.getDay()]
})

const weekProgress = computed(() => {
    return Math.round((currentWeek.value / totalWeeks.value) * 100)
})

const remainingWeeks = computed(() => {
    return Math.max(0, totalWeeks.value - currentWeek.value)
})

const semesterEnd = computed(() => {
    const start = new Date(semesterStart.value)
    const end = new Date(start.getTime() + totalWeeks.value * 7 * 24 * 60 * 60 * 1000)
    return formatDate(end)
})

// ==================== 倒计时 ====================
const presetCountdowns = computed(() => {
    const targets = [
        { name: '清明节', date: '2026-04-05' },
        { name: '劳动节', date: '2026-05-01' },
        { name: '端午节', date: '2026-06-19' },
    ]

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return targets.map(t => {
        const target = new Date(t.date)
        target.setHours(0, 0, 0, 0)
        const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
        return {
            name: t.name,
            date: t.date,
            days: diff >= 0 ? diff : 0
        }
    }).filter(t => t.days > 0)
})

const customCountdown = ref({ name: '', date: '' })
const customCountdowns = ref([])

function addCustomCountdown() {
    if (!customCountdown.value.name || !customCountdown.value.date) return

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(customCountdown.value.date)
    target.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))

    customCountdowns.value.push({
        name: customCountdown.value.name,
        date: customCountdown.value.date,
        days: diff >= 0 ? diff : 0
    })

    customCountdown.value = { name: '', date: '' }
}

function removeCustomCountdown(index) {
    customCountdowns.value.splice(index, 1)
}

// ==================== 随机抽号 ====================
const randomRange = ref({ min: 1, max: 50 })
const randomCount = ref(1)
const randomMode = ref('single')
const randomResults = ref([])
const isDrawing = ref(false)

function drawRandom() {
    isDrawing.value = true
    randomResults.value = []

    setTimeout(() => {
        const min = randomRange.value.min
        const max = randomRange.value.max
        const count = randomMode.value === 'batch' ? randomCount.value : 1

        const results = []
        const used = new Set()

        for (let i = 0; i < count; i++) {
            let num
            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min
            } while (used.has(num) && used.size < (max - min + 1))
            used.add(num)
            results.push(num)
        }

        randomResults.value = results
        isDrawing.value = false
    }, 800)
}
</script>

<style scoped>
/* 页面基础 */
.tools-page {
    min-height: 100vh;
    background: #f5f5f5;
}

/* 顶部导航 */
.tools-nav {
    background: linear-gradient(135deg, #9b1b30 0%, #c41e3a 100%);
    padding: 16px 0;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
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

/* 主内容区 */
.tools-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
}

/* 工具选择页 - Hero背景 */
.tools-select {
    min-height: calc(100vh - 72px);
}

.tools-hero {
    position: relative;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    background-image: url('/bg6.jpg');
    background-size: cover;
    background-position: center;
    transform: scale(1.05);
}

.hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(60, 8, 16, 0.75) 0%, rgba(122, 21, 38, 0.70) 40%, rgba(155, 27, 48, 0.65) 60%, rgba(92, 15, 28, 0.75) 100%);
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: #fff;
}

.tools-grid-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 40px;
}

/* 工具选择页 */
.tools-header {
    text-align: center;
    margin-bottom: 60px;
}

.page-title {
    font-size: 42px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.page-desc {
    font-size: 18px;
    color: #666;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
}

.tool-card {
    background: #fff;
    border-radius: 20px;
    padding: 40px 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 2px solid transparent;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.tool-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
    border-color: #9b1b30;
}

.tool-icon {
    width: 90px;
    height: 90px;
    margin: 0 auto 24px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.tool-icon svg {
    width: 50px;
    height: 50px;
}

.tool-icon.gpa { background: linear-gradient(135deg, #9b1b30, #c41e3a); }
.tool-icon.week { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.tool-icon.countdown { background: linear-gradient(135deg, #059669, #10b981); }
.tool-icon.random { background: linear-gradient(135deg, #7c3aed, #a78bfa); }

.tool-name {
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.tool-intro {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 24px;
}

.tool-enter {
    display: inline-block;
    padding: 10px 28px;
    background: #f5f5f5;
    color: #9b1b30;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
}

.tool-card:hover .tool-enter {
    background: #9b1b30;
    color: #fff;
}

/* 工具面板 */
.tool-panel {
    position: relative;
    min-height: calc(100vh - 72px);
    animation: fadeInUp 0.4s ease;
    overflow: hidden;
}

.panel-bg {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
}

.panel-bg-overlay {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(245, 245, 245, 0.92) 0%, rgba(245, 245, 245, 0.85) 100%);
    z-index: 0;
}

.tool-panel .panel-header,
.tool-panel .gpa-content,
.tool-panel .week-content,
.tool-panel .countdown-content,
.tool-panel .random-content {
    position: relative;
    z-index: 1;
}

.tool-panel .panel-header {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 40px 0;
}

.tool-panel .gpa-content,
.tool-panel .week-content,
.tool-panel .countdown-content,
.tool-panel .random-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px 60px;
}

.panel-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 40px;
}

.panel-back {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #666;
}

.panel-back:hover {
    background: #9b1b30;
    color: #fff;
    border-color: #9b1b30;
}

.panel-back svg {
    width: 20px;
    height: 20px;
}

.panel-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
}

/* ==================== GPA计算器 ==================== */
.gpa-content {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.gpa-intro {
    background: #fef5f6;
    border-left: 4px solid #9b1b30;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.gpa-intro p {
    color: #9b1b30;
    font-size: 14px;
}

.course-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.course-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 12px;
    align-items: center;
}

.course-input {
    padding: 12px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 14px;
    transition: all 0.3s;
}

.course-input:focus {
    outline: none;
    border-color: #9b1b30;
    box-shadow: 0 0 0 3px rgba(155, 27, 48, 0.08);
}

.course-delete {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fef5f6;
    border: none;
    color: #9b1b30;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
}

.course-delete:hover {
    background: #9b1b30;
    color: #fff;
}

.course-delete svg {
    width: 16px;
    height: 16px;
}

.add-course-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: #f5f5f5;
    border: 2px dashed #ccc;
    border-radius: 12px;
    color: #666;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 30px;
}

.add-course-btn:hover {
    border-color: #9b1b30;
    color: #9b1b30;
    background: #fef5f6;
}

.add-course-btn svg {
    width: 18px;
    height: 18px;
}

.gpa-result {
    animation: fadeInUp 0.5s ease;
}

.result-card {
    background: linear-gradient(135deg, #9b1b30, #c41e3a);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    color: #fff;
}

.result-label {
    display: block;
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 12px;
}

.result-value {
    display: block;
    font-size: 72px;
    font-weight: 700;
    margin-bottom: 20px;
}

.result-detail {
    display: flex;
    justify-content: center;
    gap: 40px;
}

.result-detail span {
    font-size: 14px;
    opacity: 0.9;
}

/* ==================== 教学周查询 ==================== */
.week-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.week-settings {
    background: #fff;
    border-radius: 20px;
    padding: 30px 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.settings-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
}

.settings-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.setting-item label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.setting-input {
    padding: 12px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 15px;
    color: #1a1a1a;
    transition: all 0.3s;
}

.setting-input:focus {
    outline: none;
    border-color: #9b1b30;
    box-shadow: 0 0 0 3px rgba(155, 27, 48, 0.08);
}

.week-card {
    background: #fff;
    border-radius: 20px;
    padding: 50px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.week-display {
    margin-bottom: 30px;
}

.week-label {
    display: block;
    font-size: 18px;
    color: #666;
    margin-bottom: 12px;
}

.week-number {
    display: block;
    font-size: 72px;
    font-weight: 700;
    color: #9b1b30;
    margin-bottom: 8px;
}

.week-day {
    display: block;
    font-size: 24px;
    color: #333;
}

.week-progress {
    max-width: 500px;
    margin: 0 auto;
}

.progress-bar {
    height: 12px;
    background: #f0f0f0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #9b1b30, #c41e3a);
    border-radius: 6px;
    transition: width 0.8s ease;
}

.progress-text {
    font-size: 14px;
    color: #666;
}

.semester-info {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.info-row {
    background: #fff;
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.info-label {
    display: block;
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
}

.info-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
}

/* ==================== 倒计时 ==================== */
.countdown-content {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
}

.preset-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.preset-card {
    background: #fff;
    border-radius: 16px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    transition: all 0.3s;
}

.preset-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
}

.preset-info {
    text-align: center;
    margin-bottom: 16px;
}

.preset-name {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.preset-date {
    font-size: 13px;
    color: #999;
}

.preset-time {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.time-number {
    font-size: 48px;
    font-weight: 700;
    color: #9b1b30;
}

.time-unit {
    font-size: 16px;
    color: #666;
}

.custom-section {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.custom-input {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.custom-name {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 14px;
}

.custom-date {
    padding: 12px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 14px;
    color: #666;
}

.custom-add {
    padding: 12px 32px;
    background: #9b1b30;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.custom-add:hover {
    background: #7a1526;
}

.custom-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.custom-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
}

.custom-info {
    flex: 1;
}

.custom-name-text {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.custom-date-text {
    font-size: 13px;
    color: #999;
}

.custom-time {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-right: 20px;
}

.custom-delete {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e5e5e5;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
}

.custom-delete:hover {
    background: #fef5f6;
    color: #9b1b30;
    border-color: #9b1b30;
}

.custom-delete svg {
    width: 14px;
    height: 14px;
}

/* ==================== 随机抽号 ==================== */
.random-content {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.random-settings {
    margin-bottom: 30px;
}

.setting-row {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
}

.setting-label {
    width: 100px;
    font-size: 15px;
    font-weight: 500;
    color: #333;
}

.range-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
}

.range-inputs input {
    width: 100px;
    padding: 10px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 15px;
    text-align: center;
}

.range-inputs span {
    color: #666;
}

.count-input {
    width: 80px;
    padding: 10px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 15px;
    text-align: center;
}

.mode-select {
    display: flex;
    gap: 8px;
}

.mode-select button {
    padding: 10px 24px;
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.mode-select button.active {
    background: #9b1b30;
    color: #fff;
    border-color: #9b1b30;
}

.random-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #9b1b30, #c41e3a);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 30px;
}

.random-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(155, 27, 48, 0.35);
}

.random-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.random-result {
    text-align: center;
    animation: fadeIn 0.5s ease;
}

.result-display {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.result-ball {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #9b1b30, #c41e3a);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    box-shadow: 0 8px 30px rgba(155, 27, 48, 0.3);
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* 动画 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
    0% { opacity: 0; transform: scale(0.5); }
    70% { transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
}

/* 响应式 */
@media (max-width: 1200px) {
    .tools-grid { grid-template-columns: repeat(2, 1fr); }
    .preset-list { grid-template-columns: repeat(2, 1fr); }
    .semester-info { grid-template-columns: repeat(2, 1fr); }
    .settings-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .nav-container { padding: 0 20px; }
    .tools-container { padding: 30px 20px; }
    .tools-grid { grid-template-columns: 1fr; }
    .course-row { grid-template-columns: 1fr; }
    .preset-list { grid-template-columns: 1fr; }
    .custom-input { flex-direction: column; }
    .setting-row { flex-direction: column; align-items: flex-start; gap: 12px; }
    .week-number { font-size: 48px; }
    .result-value { font-size: 48px; }
    .result-detail { flex-direction: column; gap: 12px; }
}
</style>
