<template>
    <AppLayout :show-sidebar="false">
        <div class="nav-page">
            <!-- 搜索栏 -->
            <div class="search-bar">
                <div class="campus-selector">
                    <span class="selector-label">选择校区</span>
                    <el-radio-group v-model="selectedCampus" @change="handleCampusChange">
                        <el-radio-button v-for="campus in campusOptions" :key="campus.value" :label="campus.value">
                            {{ campus.label }}
                        </el-radio-button>
                    </el-radio-group>
                </div>
                <div class="search-inputs">
                    <el-input v-model="origin" placeholder="起点（如：第二教学楼、望江楼）" prefix-icon="Location" clearable
                        size="large" class="search-input" />
                    <div class="swap-btn" @click="swapPoints" title="互换起终点">⇅</div>
                    <el-input v-model="destination" placeholder="终点（如：学生食堂、图书馆）" prefix-icon="Aim" clearable
                        size="large" class="search-input" />
                    <el-button type="primary" size="large" :loading="loading"
                        :disabled="!origin.trim() || !destination.trim()" @click="handleSearch">
                        规划路线
                    </el-button>
                </div>
                <p class="search-hint">支持自然语言描述，如"从化工学院到图书馆怎么走"</p>
            </div>

            <!-- 结果区域 -->
            <div class="nav-content">
                <div class="nav-result-wrapper">
                    <div class="map-wrapper">
                        <MapPanel :polyline="result?.polyline || ''" :origin-lnglat="result?.origin_lnglat || null"
                            :dest-lnglat="result?.dest_lnglat || null" :origin-name="result?.origin_name || origin"
                            :dest-name="result?.destination_name || destination" :center="currentCampus.center"
                            :zoom="currentCampus.zoom" :markers="previewMarkers" />
                    </div>

                    <div class="steps-panel">
                        <template v-if="result">
                            <div class="steps-summary">
                                <span class="summary-item">
                                    <strong>{{ result.distance_text || result.total_distance }}</strong> 步行
                                </span>
                                <span class="summary-sep">·</span>
                                <span class="summary-item">
                                    约 <strong>{{ result.duration_text || result.estimated_time }}</strong>
                                </span>
                            </div>
                            <div class="steps-list">
                                <div v-for="(step, idx) in result.steps" :key="idx" class="step-item">
                                    <div class="step-num">{{ idx + 1 }}</div>
                                    <div class="step-text">{{ step.instruction || step }}</div>
                                    <div v-if="step.distance" class="step-dist">{{ step.distance }}</div>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="loading">
                            <div class="panel-loading">
                                <el-skeleton :rows="6" animated />
                            </div>
                        </template>

                        <template v-else>
                            <div class="campus-preview">
                                <h3>{{ currentCampus.label }}</h3>
                                <p>已切换到 {{ currentCampus.label }}，地图中展示该校区常用地点。</p>
                                <div class="landmark-list">
                                    <el-tag v-for="landmark in currentCampus.landmarks" :key="landmark.name"
                                        effect="plain" class="landmark-tag" @click="fillDestination(landmark.name)">
                                        {{ landmark.name }}
                                    </el-tag>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-if="!result && !loading" class="nav-empty">
                    <div class="empty-icon">🗺️</div>
                    <h3>校内路线规划</h3>
                    <p>先选择校区，再输入起点与终点，获取步行路线指引</p>
                    <div class="landmark-tags">
                        <el-tag v-for="landmark in currentCampus.landmarks" :key="landmark.name" effect="plain"
                            size="small" class="landmark-tag" @click="fillDestination(landmark.name)">
                            {{ landmark.name }}
                        </el-tag>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="errorMsg" class="nav-error">
                    <el-alert :title="errorMsg" type="warning" show-icon :closable="false" />
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AppLayout from '@/layout/AppLayout.vue'
import MapPanel from '@/components/MapPanel.vue'
import { getRoute } from '@/api/navigation'

// 文件说明：校园导航页
// 页面对应：路由 /nav
// 作用：选择校区、输入起终点、展示路线步骤和地图结果
// 三个校区的前端配置：用于校区切换、地图中心点和地点预览
const campusOptions = [
    {
        value: 'wangjiang',
        label: '望江校区',
        center: [104.0835, 30.6300],
        zoom: 16,
        landmarks: [
            { name: '望江楼', lnglat: [104.0827, 30.6297] },
            { name: '第二教学楼', lnglat: [104.0832, 30.6301] },
            { name: '学生食堂', lnglat: [104.0840, 30.6295] },
            { name: '化工学院', lnglat: [104.0851, 30.6312] }
        ]
    },
    {
        value: 'jiangan',
        label: '江安校区',
        center: [103.9448, 30.5818],
        zoom: 15,
        landmarks: [
            { name: '江安校区图书馆', lnglat: [103.9421, 30.5812] },
            { name: '江安一食堂', lnglat: [103.9445, 30.5804] },
            { name: '青春广场', lnglat: [103.9462, 30.5828] },
            { name: '综合实验楼', lnglat: [103.9476, 30.5831] }
        ]
    },
    {
        value: 'huaxi',
        label: '华西校区',
        center: [104.0650, 30.6508],
        zoom: 16,
        landmarks: [
            { name: '华西口腔医院', lnglat: [104.0638, 30.6518] },
            { name: '华西钟楼', lnglat: [104.0649, 30.6506] },
            { name: '华西临床医学院', lnglat: [104.0662, 30.6498] },
            { name: '华西东区田径场', lnglat: [104.0674, 30.6511] }
        ]
    }
]

const selectedCampus = ref('wangjiang')
const origin = ref('')
const destination = ref('')
const loading = ref(false)
const result = ref(null)
const errorMsg = ref('')

// 当前选中的校区配置
const currentCampus = computed(() => {
    return campusOptions.find((campus) => campus.value === selectedCampus.value) || campusOptions[0]
})

// 未规划路线时，地图展示当前校区的地点标记
const previewMarkers = computed(() => {
    if (result.value) return []
    return currentCampus.value.landmarks.map((landmark) => ({
        name: landmark.name,
        position: landmark.lnglat
    }))
})

function handleCampusChange() {
    // 切换校区时清空上一次路线结果与报错
    result.value = null
    errorMsg.value = ''

    // 如果起终点不在当前校区地点列表中，自动清空，避免跨校区误查
    const currentNames = currentCampus.value.landmarks.map((item) => item.name)
    if (origin.value && !currentNames.includes(origin.value)) {
        origin.value = ''
    }
    if (destination.value && !currentNames.includes(destination.value)) {
        destination.value = ''
    }
}

function fillDestination(name) {
    // 首次点击先填起点，第二次点击填终点
    if (!origin.value) {
        origin.value = name
        return
    }

    destination.value = name
}

function swapPoints() {
    // 快速交换起点和终点，减少重复输入
    const tmp = origin.value
    origin.value = destination.value
    destination.value = tmp
}

async function handleSearch() {
    if (!origin.value.trim() || !destination.value.trim()) return

    // 查询前重置旧结果，避免页面残留
    loading.value = true
    result.value = null
    errorMsg.value = ''

    try {
        // 向 API 传入结构化参数，便于后端按校区过滤路线
        const data = await getRoute({
            origin: origin.value.trim(),
            destination: destination.value.trim(),
            campus: selectedCampus.value
        })
        result.value = data
    } catch (err) {
        errorMsg.value = err?.message || '路线规划失败，请检查起终点是否正确'
        ElMessage.error(errorMsg.value)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.nav-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.search-bar {
    padding: 16px 20px 12px;
    border-bottom: 1px solid #eee;
    background: #fff;
}

.campus-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.selector-label {
    font-size: 13px;
    color: #666;
    font-weight: 600;
}

.search-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    flex: 1;
}

.swap-btn {
    font-size: 20px;
    color: #999;
    cursor: pointer;
    padding: 0 4px;
    user-select: none;
    transition: color 0.2s;
}

.swap-btn:hover {
    color: var(--color-primary);
}

.search-hint {
    font-size: 12px;
    color: #bbb;
    margin: 6px 0 0;
    padding-left: 2px;
}

.nav-content {
    flex: 1;
    overflow: auto;
    position: relative;
    display: flex;
    flex-direction: column;
}

.nav-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: #666;
    padding: 40px;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.nav-empty h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.nav-empty p {
    font-size: 14px;
    color: #888;
    margin-bottom: 20px;
}

.landmark-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    max-width: 400px;
}

.landmark-tag {
    cursor: pointer;
}

.landmark-tag:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.nav-loading {
    padding: 24px 20px;
}

.nav-result-wrapper {
    display: flex;
    min-height: 420px;
    flex: 1;
}

.map-wrapper {
    flex: 1;
    min-height: 420px;
    position: relative;
}

.steps-panel {
    width: 280px;
    border-left: 1px solid #eee;
    overflow-y: auto;
    background: #fafafa;
    display: flex;
    flex-direction: column;
}

.steps-summary {
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
    background: #fff;
    font-size: 14px;
    color: #555;
}

.steps-summary strong {
    color: var(--color-primary);
    font-size: 16px;
}

.summary-sep {
    margin: 0 6px;
    color: #ccc;
}

.steps-list {
    padding: 12px 0;
    flex: 1;
}

.panel-loading {
    padding: 16px;
}

.campus-preview {
    padding: 20px 16px;
}

.campus-preview h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #333;
}

.campus-preview p {
    margin: 0 0 16px;
    font-size: 13px;
    color: #777;
    line-height: 1.6;
}

.landmark-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 16px;
    font-size: 13px;
    color: #444;
    border-bottom: 1px solid #f0f0f0;
}

.step-num {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-top: 1px;
}

.step-text {
    flex: 1;
    line-height: 1.5;
}

.step-dist {
    color: #aaa;
    font-size: 12px;
    white-space: nowrap;
}

.nav-error {
    padding: 16px 20px;
}

@media (max-width: 960px) {
    .search-inputs {
        flex-wrap: wrap;
    }

    .swap-btn {
        width: 100%;
        text-align: center;
    }

    .nav-result-wrapper {
        flex-direction: column;
    }

    .steps-panel {
        width: 100%;
        border-left: none;
        border-top: 1px solid #eee;
        min-height: 220px;
    }
}
</style>
