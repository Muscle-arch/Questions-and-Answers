<template>
    <div class="nav-result">
        <!-- 左：步骤列表 -->
        <div class="steps-panel">
            <div class="nav-header">
                <el-icon>
                    <Location />
                </el-icon>
                <span class="route-title">
                    {{ data.origin }} → {{ data.destination }}
                </span>
            </div>
            <div class="meta">
                <span>步行约 {{ Math.round(data.distance) }} 米</span>
                <span class="sep">·</span>
                <span>预计 {{ Math.round(data.duration / 60) }} 分钟</span>
            </div>
            <ol class="step-list">
                <li v-for="(step, i) in data.steps" :key="i" class="step-item">
                    <span class="step-num">{{ i + 1 }}</span>
                    <span>{{ step }}</span>
                </li>
            </ol>
        </div>

        <!-- 右：地图 -->
        <div class="map-container">
            <MapPanel :polyline="data.polyline" :origin-lnglat="data.origin_lnglat" :dest-lnglat="data.dest_lnglat"
                :origin-name="data.origin" :dest-name="data.destination" />
        </div>
    </div>
</template>

<script setup>
import { Location } from '@element-plus/icons-vue'
import MapPanel from '@/components/MapPanel.vue'

// 文件说明：导航结果卡片组件
// 页面对应：聊天页中的导航回答、也可复用于独立导航结果展示
// 作用：把路线摘要、步骤和小地图组合成一个卡片
// 导航结果卡片：左侧步骤，右侧地图
defineProps({
    data: { type: Object, required: true }
})
</script>

<style scoped>
.nav-result {
    display: flex;
    gap: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    overflow: hidden;
    background: #fff;
    margin-top: 4px;
    max-width: 700px;
}

.steps-panel {
    flex: 0 0 220px;
    padding: 12px;
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav-header {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-primary);
    font-weight: 600;
    font-size: 13px;
}

.route-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.meta {
    font-size: 12px;
    color: var(--color-text-secondary);
    display: flex;
    gap: 4px;
}

.sep {
    color: #ccc;
}

.step-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text);
}

.step-num {
    min-width: 18px;
    height: 18px;
    background: var(--color-primary);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
    margin-top: 1px;
}

.map-container {
    flex: 1;
    height: 200px;
}
</style>
