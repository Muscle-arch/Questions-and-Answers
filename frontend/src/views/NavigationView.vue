<template>
    <AppLayout :show-sidebar="false">
        <div class="nav-page">
            <!-- 搜索栏 -->
            <div class="search-bar">
                <div class="campus-selector">
                    <span class="selector-label">校区范围提示</span>
                    <el-radio-group v-model="selectedCampus" @change="handleCampusChange">
                        <el-radio-button label="all">不限</el-radio-button>
                        <el-radio-button v-for="campus in campusOptions" :key="campus.value" :label="campus.value">
                            {{ campus.label }}
                        </el-radio-button>
                    </el-radio-group>
                </div>
                <div class="transport-selector">
                    <span class="selector-label">交通方式</span>
                    <el-radio-group v-model="transportMode">
                        <el-radio-button label="walking">🚶 步行</el-radio-button>
                        <el-radio-button label="biking">🚴 骑行</el-radio-button>
                        <el-radio-button label="driving">🚗 开车</el-radio-button>
                    </el-radio-group>
                </div>
                <div class="search-inputs">
                    <el-autocomplete v-model="origin" :fetch-suggestions="queryOriginSuggestions"
                        placeholder="起点（如：第二教学楼、望江楼）" clearable size="large" class="search-input"
                        @select="handleOriginSelect" @input="handleOriginInput">
                        <template #default="{ item }">
                            <div class="suggest-item-name">{{ item.name }}</div>
                            <div class="suggest-item-address">{{ item.address || item.value }}</div>
                        </template>
                    </el-autocomplete>
                    <div class="swap-btn" @click="swapPoints" title="互换起终点">⇅</div>
                    <el-autocomplete v-model="destination" :fetch-suggestions="queryDestinationSuggestions"
                        placeholder="终点（如：学生食堂、图书馆）" clearable size="large" class="search-input"
                        @select="handleDestinationSelect" @input="handleDestinationInput">
                        <template #default="{ item }">
                            <div class="suggest-item-name">{{ item.name }}</div>
                            <div class="suggest-item-address">{{ item.address || item.value }}</div>
                        </template>
                    </el-autocomplete>
                    <el-button type="primary" size="large" :loading="loading"
                        :disabled="!origin.trim() || !destination.trim()" @click="handleSearch">
                        规划路线
                    </el-button>
                </div>
                <p class="search-hint">支持任意地点与自然语言描述，如"从化工学院到图书馆怎么走"</p>
            </div>

            <!-- 结果区域 -->
            <div class="nav-content">
                <div class="nav-result-wrapper">
                    <div class="map-wrapper">
                        <MapPanel :polyline="result?.polyline || ''" :origin-lnglat="result?.origin_lnglat || null"
                            :dest-lnglat="result?.dest_lnglat || null" :origin-name="result?.origin_name || origin"
                            :dest-name="result?.destination_name || destination" :center="currentMapCenter"
                            :zoom="currentMapZoom" :markers="previewMarkers" :boundary-path="currentCampusBoundary" />
                    </div>

                    <div class="steps-panel">
                        <template v-if="result">
                            <div class="steps-summary">
                                <span class="summary-item">
                                    <strong>{{ result.distance_text || result.total_distance }}</strong> {{
                                        getTransportModeName() }}
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
                                <h3>常用地点</h3>
                                <p>可直接点击填充起终点，也支持输入任意地点（校外也可规划）。选择校区后会显示蓝色边界线。</p>
                                <div class="landmark-list">
                                    <el-tag v-for="landmark in quickPlaces" :key="landmark.name" effect="plain"
                                        class="landmark-tag" @click="fillDestination(landmark.name)">
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
                    <h3>路线规划</h3>
                    <p>输入起点和终点即可规划路线，支持校外地点</p>
                    <div class="landmark-tags">
                        <el-tag v-for="landmark in quickPlaces" :key="landmark.name" effect="plain" size="small"
                            class="landmark-tag" @click="fillDestination(landmark.name)">
                            {{ landmark.name }}
                        </el-tag>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="errorMsg" class="nav-error">
                    <el-alert :title="errorMsg" type="warning" show-icon :closable="false" />
                </div>

                <el-dialog v-model="candidateDialogVisible" width="560px" :title="candidateDialogTitle">
                    <p class="candidate-desc">检测到多个匹配地点，请选择最准确的一个：</p>
                    <el-radio-group v-model="selectedCandidateIndex" class="candidate-list">
                        <el-radio v-for="(item, index) in candidateList" :key="`${item.name}-${index}`" :label="index"
                            class="candidate-item">
                            <div class="candidate-main">{{ item.name }}</div>
                            <div class="candidate-sub">{{ item.address || item.lnglat.join(',') }}</div>
                        </el-radio>
                    </el-radio-group>
                    <template #footer>
                        <el-button @click="candidateDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="confirmCandidate">确认并继续规划</el-button>
                    </template>
                </el-dialog>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AppLayout from '@/layout/AppLayout.vue'
import MapPanel from '@/components/MapPanel.vue'
import { getPlaceSuggestions, getRoute } from '@/api/navigation'

// 文件说明：通用导航页
// 页面对应：路由 /nav
// 作用：输入起终点并展示路线步骤和地图结果（类似高德）
const defaultMapCenter = [104.0665, 30.5728]
const defaultMapZoom = 12

const campusOptions = [
    {
        value: 'wangjiang',
        label: '望江校区',
        center: [104.0835, 30.6300],
        zoom: 15,
        boundary: [
            [104.0768, 30.6242],
            [104.0907, 30.6242],
            [104.0907, 30.6358],
            [104.0768, 30.6358]
        ]
    },
    {
        value: 'jiangan',
        label: '江安校区',
        center: [104.0005, 30.5575],
        zoom: 14,
        boundary: [
            [103.9885, 30.5492],
            [104.0128, 30.5492],
            [104.0128, 30.5658],
            [103.9885, 30.5658]
        ]
    },
    {
        value: 'huaxi',
        label: '华西校区',
        center: [104.0658, 30.6416],
        zoom: 15,
        boundary: [
            [104.0586, 30.6365],
            [104.0736, 30.6365],
            [104.0736, 30.6468],
            [104.0586, 30.6468]
        ]
    }
]

const quickPlaces = [
    { name: '四川大学望江校区东门', lnglat: [104.083932, 30.630838], campus: 'wangjiang' },
    { name: '四川大学江安校区图书馆', lnglat: [104.000076, 30.556682], campus: 'jiangan' },
    { name: '四川大学华西校区图书馆', lnglat: [104.067612, 30.641683], campus: 'huaxi' },
    { name: '天府广场', lnglat: [104.0668, 30.5728], campus: 'all' },
    { name: '成都东站', lnglat: [104.1477, 30.6199], campus: 'all' },
    { name: '成都双流国际机场', lnglat: [103.9526, 30.5785], campus: 'all' }
]

const transportMode = ref('walking') // walking | biking | driving
const selectedCampus = ref('all')
const origin = ref('')
const destination = ref('')
const loading = ref(false)
const result = ref(null)
const errorMsg = ref('')
const originCandidate = ref(null)
const destinationCandidate = ref(null)

const candidateDialogVisible = ref(false)
const candidateDialogTitle = ref('选择地点')
const candidateRole = ref('origin')
const candidateList = ref([])
const selectedCandidateIndex = ref(0)

const selectedCampusMeta = computed(() => {
    return campusOptions.find((item) => item.value === selectedCampus.value) || null
})

const currentMapCenter = computed(() => {
    return selectedCampusMeta.value?.center || defaultMapCenter
})

const currentMapZoom = computed(() => {
    return selectedCampusMeta.value?.zoom || defaultMapZoom
})

const currentCampusBoundary = computed(() => {
    return selectedCampusMeta.value?.boundary || []
})

// 未规划路线时，地图展示常用地点标记
const previewMarkers = computed(() => {
    if (result.value) return []
    const source = selectedCampus.value === 'all'
        ? quickPlaces
        : quickPlaces.filter((item) => item.campus === selectedCampus.value || item.campus === 'all')
    return source.map((landmark) => ({
        name: landmark.name,
        position: landmark.lnglat
    }))
})

function handleCampusChange() {
    originCandidate.value = null
    destinationCandidate.value = null
}

function fillDestination(name) {
    // 首次点击先填起点，第二次点击填终点
    if (!origin.value) {
        origin.value = name
        originCandidate.value = null
        return
    }

    destination.value = name
    destinationCandidate.value = null
}

function swapPoints() {
    // 快速交换起点和终点，减少重复输入
    const tmp = origin.value
    origin.value = destination.value
    destination.value = tmp

    const candidateTmp = originCandidate.value
    originCandidate.value = destinationCandidate.value
    destinationCandidate.value = candidateTmp
}

function handleOriginInput() {
    originCandidate.value = null
}

function handleDestinationInput() {
    destinationCandidate.value = null
}

function handleOriginSelect(item) {
    originCandidate.value = {
        name: item.name,
        lnglat: item.lnglat,
        address: item.address || ''
    }
    origin.value = item.name
}

function handleDestinationSelect(item) {
    destinationCandidate.value = {
        name: item.name,
        lnglat: item.lnglat,
        address: item.address || ''
    }
    destination.value = item.name
}

async function queryOriginSuggestions(queryString, cb) {
    if (!queryString || queryString.trim().length < 2) {
        cb([])
        return
    }
    try {
        const list = await getPlaceSuggestions(queryString, selectedCampus.value, 8)
        cb(list)
    } catch {
        cb([])
    }
}

async function queryDestinationSuggestions(queryString, cb) {
    if (!queryString || queryString.trim().length < 2) {
        cb([])
        return
    }
    try {
        const list = await getPlaceSuggestions(queryString, selectedCampus.value, 8)
        cb(list)
    } catch {
        cb([])
    }
}

function openCandidateDialog(err) {
    candidateRole.value = err?.role || 'origin'
    candidateDialogTitle.value = candidateRole.value === 'origin' ? '请选择起点' : '请选择终点'
    candidateList.value = err?.candidates || []
    selectedCandidateIndex.value = 0
    candidateDialogVisible.value = true
}

async function confirmCandidate() {
    const selected = candidateList.value[selectedCandidateIndex.value]
    if (!selected) {
        ElMessage.warning('请先选择一个候选地点')
        return
    }

    if (candidateRole.value === 'origin') {
        origin.value = selected.name
        originCandidate.value = {
            name: selected.name,
            lnglat: selected.lnglat,
            address: selected.address || ''
        }
    } else {
        destination.value = selected.name
        destinationCandidate.value = {
            name: selected.name,
            lnglat: selected.lnglat,
            address: selected.address || ''
        }
    }

    candidateDialogVisible.value = false
    await handleSearch()
}

// 获取交通方式的中文名称
function getTransportModeName() {
    const modeMap = {
        walking: '步行',
        biking: '骑行',
        driving: '开车'
    }
    return modeMap[transportMode.value] || '步行'
}

async function handleSearch() {
    if (!origin.value.trim() || !destination.value.trim()) return

    // 查询前重置旧结果，避免页面残留
    loading.value = true
    result.value = null
    errorMsg.value = ''

    try {
        // 向导航 API 传入结构化参数，由前端侧完成地图 API 请求与结果解析
        const data = await getRoute({
            origin: origin.value.trim(),
            destination: destination.value.trim(),
            campus: selectedCampus.value,
            transportMode: transportMode.value,
            originCandidate: originCandidate.value,
            destinationCandidate: destinationCandidate.value
        })
        result.value = data
    } catch (err) {
        if (err?.code === 'MULTIPLE_CANDIDATES') {
            openCandidateDialog(err)
            return
        }
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

.candidate-desc {
    margin: 0 0 10px;
    color: #666;
    font-size: 13px;
}

.candidate-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.candidate-item {
    display: flex;
    align-items: flex-start;
    border: 1px solid #ececec;
    border-radius: 8px;
    padding: 10px 12px;
    margin-right: 0;
    width: 100%;
}

.candidate-main {
    font-size: 14px;
    color: #333;
    font-weight: 600;
}

.candidate-sub {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
}

.suggest-item-name {
    font-size: 13px;
    color: #333;
    line-height: 1.35;
}

.suggest-item-address {
    font-size: 11px;
    color: #888;
    line-height: 1.35;
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
