<template>
    <AppLayout :show-sidebar="false">
        <!-- 背景图片 -->
        <div class="nav-bg"></div>
        
        <div class="nav-page">
            <!-- 搜索栏 -->
            <div class="search-bar">
                <div class="search-bar-inner">
                    <div class="selectors-row">
                        <div class="selector-group">
                            <span class="selector-label">校区范围</span>
                            <el-radio-group v-model="selectedCampus" @change="handleCampusChange" class="custom-radio-group">
                                <el-radio-button label="all">不限</el-radio-button>
                                <el-radio-button v-for="campus in campusOptions" :key="campus.value" :label="campus.value">
                                    {{ campus.label }}
                                </el-radio-button>
                            </el-radio-group>
                        </div>
                        <div class="selector-group">
                            <span class="selector-label">交通方式</span>
                            <el-radio-group v-model="transportMode" class="custom-radio-group">
                                <el-radio-button label="walking">🚶 步行</el-radio-button>
                                <el-radio-button label="biking">🚴 骑行</el-radio-button>
                                <el-radio-button label="driving">🚗 开车</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                    
                    <div class="search-inputs">
                        <div class="input-wrapper">
                            <el-autocomplete v-model="origin" :fetch-suggestions="queryOriginSuggestions"
                                placeholder="输入起点..." clearable size="large" class="search-input"
                                @select="handleOriginSelect" @input="handleOriginInput">
                                <template #default="{ item }">
                                    <div class="suggest-item-name">{{ item.name }}</div>
                                    <div class="suggest-item-address">{{ item.address || item.value }}</div>
                                </template>
                            </el-autocomplete>
                        </div>
                        
                        <button class="swap-btn" @click="swapPoints" title="互换起终点">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                            </svg>
                        </button>
                        
                        <div class="input-wrapper">
                            <el-autocomplete v-model="destination" :fetch-suggestions="queryDestinationSuggestions"
                                placeholder="输入终点..." clearable size="large" class="search-input"
                                @select="handleDestinationSelect" @input="handleDestinationInput">
                                <template #default="{ item }">
                                    <div class="suggest-item-name">{{ item.name }}</div>
                                    <div class="suggest-item-address">{{ item.address || item.value }}</div>
                                </template>
                            </el-autocomplete>
                        </div>
                        
                        <button class="search-btn" :disabled="!origin.trim() || !destination.trim()" @click="handleSearch">
                            <span class="btn-bg"></span>
                            <span class="btn-content">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                                <span>{{ loading ? '规划中...' : '规划路线' }}</span>
                            </span>
                            <span class="btn-glow"></span>
                        </button>
                    </div>
                    
                    <p class="search-hint">💡 支持任意地点与自然语言描述，如"从化工学院到图书馆怎么走"</p>
                </div>
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
                                <div class="summary-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div class="summary-content">
                                    <span class="summary-distance">
                                        <strong>{{ result.distance_text || result.total_distance }}</strong>
                                    </span>
                                    <span class="summary-mode">{{ getTransportModeName() }}</span>
                                    <span class="summary-time">
                                        约 <strong>{{ result.duration_text || result.estimated_time }}</strong>
                                    </span>
                                </div>
                            </div>
                            <div class="steps-list">
                                <div v-for="(step, idx) in result.steps" :key="idx" 
                                     class="step-item" 
                                     :style="{ animationDelay: `${idx * 0.08}s` }">
                                    <div class="step-num">{{ idx + 1 }}</div>
                                    <div class="step-content">
                                        <div class="step-text">{{ step.instruction || step }}</div>
                                        <div v-if="step.distance" class="step-dist">{{ step.distance }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="loading">
                            <div class="panel-loading">
                                <div class="loading-animation">
                                    <div class="loading-dot"></div>
                                    <div class="loading-dot"></div>
                                    <div class="loading-dot"></div>
                                </div>
                                <p>正在规划路线...</p>
                            </div>
                        </template>

                        <template v-else>
                            <div class="campus-preview">
                                <div class="preview-header">
                                    <span class="preview-icon">📍</span>
                                    <h3>常用地点</h3>
                                </div>
                                <p>点击下方标签快速填充起终点</p>
                                <div class="landmark-list">
                                    <button v-for="landmark in quickPlaces" :key="landmark.name" 
                                            class="landmark-tag" 
                                            @click="fillDestination(landmark.name)">
                                        {{ landmark.name }}
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="errorMsg" class="nav-error">
                    <div class="error-content">
                        <span class="error-icon">⚠️</span>
                        <span>{{ errorMsg }}</span>
                    </div>
                </div>

                <el-dialog v-model="candidateDialogVisible" width="560px" :title="candidateDialogTitle" class="candidate-dialog">
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

const transportMode = ref('walking')
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
    if (!origin.value) {
        origin.value = name
        originCandidate.value = null
        return
    }
    destination.value = name
    destinationCandidate.value = null
}

function swapPoints() {
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

    loading.value = true
    result.value = null
    errorMsg.value = ''

    try {
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
/* 背景图片 */
.nav-bg {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/bg7.png');
    background-size: cover;
    background-position: center;
    opacity: 0.35;
    z-index: 0;
    pointer-events: none;
}

.nav-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: transparent;
    position: relative;
    z-index: 1;
}

.search-bar {
    background: var(--color-bg-white);
    border-bottom: 1px solid var(--color-border-light);
    position: relative;
}

.search-bar::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(155,27,48,0.1), transparent);
    z-index: 1;
}

.search-bar-inner {
    padding: 20px 28px 16px;
    position: relative;
    z-index: 1;
}

.selectors-row {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.selector-group {
    display: flex;
    align-items: center;
    gap: 12px;
}

.selector-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    font-weight: 600;
}

.custom-radio-group :deep(.el-radio-button__inner) {
    border-radius: 8px !important;
    border: 1px solid var(--color-border) !important;
    margin: 0 2px;
    transition: all 0.3s ease;
}

.custom-radio-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: var(--gradient-primary) !important;
    border-color: var(--color-primary) !important;
    box-shadow: 0 2px 8px rgba(155, 27, 48, 0.25);
}

.search-inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
}

.input-wrapper {
    flex: 1;
    position: relative;
}

.input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: var(--color-text-placeholder);
    z-index: 10;
    pointer-events: none;
}

.input-icon.dest {
    color: var(--color-primary-light);
}

.input-icon svg {
    width: 100%;
    height: 100%;
}

.search-input {
    width: 100%;
}

.search-input :deep(.el-input__wrapper) {
    padding-left: 16px;
    border-radius: var(--border-radius);
    transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
    border-color: var(--color-primary-light);
}

.search-input :deep(.el-input__wrapper.is-focus) {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(155, 27, 48, 0.08);
}

.swap-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(155, 27, 48, 0.15);
    background: linear-gradient(145deg, #fff 0%, #f8f9fa 100%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.swap-btn svg {
    width: 20px;
    height: 20px;
    color: var(--color-primary);
}

.swap-btn:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    transform: rotate(180deg) scale(1.1);
    box-shadow: 0 4px 16px rgba(155, 27, 48, 0.3);
}

.swap-btn:hover svg {
    color: #fff;
}

.search-btn {
    position: relative;
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(155, 27, 48, 0.2);
}

.search-btn .btn-bg {
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    background-size: 200% 100%;
    transition: all 0.4s;
}

.search-btn:hover .btn-bg {
    background-position: 100% 0;
}

.search-btn .btn-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
}

.search-btn .btn-content svg {
    width: 18px;
    height: 18px;
}

.search-btn .btn-glow {
    position: absolute;
    inset: -2px;
    background: var(--gradient-primary);
    filter: blur(12px);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
}

.search-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(155, 27, 48, 0.4);
}

.search-btn:hover .btn-glow {
    opacity: 0.5;
}

.search-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
}

.search-btn:disabled .btn-bg {
    background: var(--color-bg-secondary);
}

.search-btn:disabled .btn-content {
    color: var(--color-text-placeholder);
}

.search-hint {
    font-size: 12px;
    color: var(--color-text-placeholder);
    margin: 10px 0 0;
}

.nav-content {
    flex: 1;
    overflow: auto;
    position: relative;
    display: flex;
    flex-direction: column;
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
    animation: fadeIn 0.5s ease-out;
}

.steps-panel {
    width: 320px;
    border-left: 1px solid var(--color-border-light);
    overflow-y: auto;
    background-image: url('/bg7.png');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    animation: slideInUp 0.5s ease-out;
    position: relative;
}

.steps-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.75) 100%);
    z-index: 0;
}

.steps-panel > * {
    position: relative;
    z-index: 1;
}

.steps-summary {
    padding: 18px 20px;
    background: var(--gradient-primary-soft);
    border-bottom: 1px solid var(--color-border-light);
    display: flex;
    align-items: center;
    gap: 14px;
}

.summary-icon {
    width: 42px;
    height: 42px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(155, 27, 48, 0.25);
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.summary-icon svg {
    width: 22px;
    height: 22px;
    color: #fff;
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.summary-distance strong {
    font-size: 20px;
    color: var(--color-primary);
    font-weight: 700;
}

.summary-mode {
    font-size: 13px;
    color: var(--color-text-secondary);
}

.summary-time strong {
    font-size: 15px;
    color: var(--color-text);
    font-weight: 600;
}

.steps-list {
    padding: 12px 0;
    flex: 1;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 20px;
    font-size: 14px;
    color: var(--color-text-regular);
    background: rgba(255, 255, 255, 0.88);
    border-bottom: 1px solid var(--color-border-light);
    transition: all 0.3s ease;
    animation: slide-up-fade 0.4s ease-out both;
    position: relative;
    z-index: 1;
}

.step-item:hover {
    background: rgba(255, 255, 255, 0.95);
}

.step-num {
    width: 26px;
    height: 26px;
    min-width: 26px;
    border-radius: 50%;
    background: var(--gradient-primary);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(155, 27, 48, 0.2);
}

.step-content {
    flex: 1;
}

.step-text {
    line-height: 1.6;
}

.step-dist {
    color: var(--color-text-placeholder);
    font-size: 12px;
    margin-top: 4px;
}

.panel-loading {
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.loading-animation {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.loading-dot {
    width: 10px;
    height: 10px;
    background: var(--color-primary);
    border-radius: 50%;
    animation: dot-bounce 1s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.1s; }
.loading-dot:nth-child(3) { animation-delay: 0.2s; }

@keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
}

.panel-loading p {
    color: var(--color-text-secondary);
    font-size: 14px;
}

.campus-preview {
    padding: 24px 20px;
}

.preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.preview-icon {
    font-size: 20px;
}

.campus-preview h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
}

.campus-preview p {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.landmark-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.landmark-tag {
    padding: 8px 14px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    font-size: 13px;
    color: var(--color-text-regular);
    cursor: pointer;
    transition: all 0.3s ease;
}

.landmark-tag:hover {
    background: var(--color-primary-bg);
    border-color: var(--color-primary-light);
    color: var(--color-primary);
    transform: translateY(-2px);
}

.nav-error {
    padding: 16px 24px;
}

.error-content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: rgba(239, 68, 68, 0.08);
    border-radius: var(--border-radius);
    color: #dc2626;
    font-size: 14px;
}

.error-icon {
    font-size: 18px;
}

.candidate-desc {
    margin: 0 0 14px;
    color: var(--color-text-secondary);
    font-size: 14px;
}

.candidate-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.candidate-item {
    display: block;
    height: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    padding: 14px 16px;
    margin-right: 0;
    width: 100%;
    transition: all 0.3s ease;
}

.candidate-item :deep(.el-radio__input) {
    vertical-align: top;
    margin-top: 2px;
}

.candidate-item :deep(.el-radio__label) {
    display: inline-block;
    vertical-align: top;
    padding-left: 8px;
    white-space: normal;
}

.candidate-item:hover {
    border-color: var(--color-primary-light);
    background: var(--color-primary-bg);
}

.candidate-main {
    font-size: 14px;
    color: var(--color-text);
    font-weight: 600;
}

.candidate-sub {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 4px;
}

.suggest-item-name {
    font-size: 14px;
    color: var(--color-text);
    font-weight: 500;
}

.suggest-item-address {
    font-size: 12px;
    color: var(--color-text-secondary);
}

@media (max-width: 960px) {
    .search-inputs {
        flex-wrap: wrap;
    }

    .swap-btn {
        order: 2;
        width: 100%;
        transform: rotate(90deg);
    }

    .swap-btn:hover {
        transform: rotate(270deg);
    }

    .search-btn {
        order: 3;
        width: 100%;
    }

    .nav-result-wrapper {
        flex-direction: column;
    }

    .steps-panel {
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--color-border-light);
        min-height: 220px;
    }
}
</style>
