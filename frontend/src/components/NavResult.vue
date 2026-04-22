<template>
    <div class="nav-result">
        <div class="steps-panel">
            <div class="nav-header">
                <div class="header-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <span class="route-title">
                    {{ data.origin }} → {{ data.destination }}
                </span>
            </div>
            <div class="meta">
                <span class="meta-item">
                    <span class="meta-icon">🚶</span>
                    步行约 {{ Math.round(data.distance) }} 米
                </span>
                <span class="sep">·</span>
                <span class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    预计 {{ Math.round(data.duration / 60) }} 分钟
                </span>
            </div>
            <ol class="step-list">
                <li v-for="(step, i) in data.steps" :key="i" 
                    class="step-item"
                    :style="{ animationDelay: `${i * 0.06}s` }">
                    <span class="step-num">{{ i + 1 }}</span>
                    <span class="step-text">{{ step }}</span>
                </li>
            </ol>
        </div>

        <div class="map-container">
            <MapPanel :polyline="data.polyline" :origin-lnglat="data.origin_lnglat" :dest-lnglat="data.dest_lnglat"
                :origin-name="data.origin" :dest-name="data.destination" />
        </div>
    </div>
</template>

<script setup>
import MapPanel from '@/components/MapPanel.vue'

defineProps({
    data: { type: Object, required: true }
})
</script>

<style scoped>
.nav-result {
    display: flex;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    background: var(--color-bg-white);
    margin-top: 10px;
    max-width: 720px;
    box-shadow: var(--shadow-card);
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition: all 0.3s ease;
}

.nav-result:hover {
    box-shadow: var(--shadow-card-hover);
}

.steps-panel {
    flex: 0 0 240px;
    padding: 16px;
    border-right: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--color-bg-white);
}

.nav-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border-light);
}

.header-icon {
    width: 28px;
    height: 28px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(155, 27, 48, 0.25);
}

.header-icon svg {
    width: 14px;
    height: 14px;
    color: #fff;
}

.route-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.meta {
    font-size: 12px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.meta-icon {
    font-size: 14px;
}

.sep {
    color: var(--color-text-placeholder);
}

.step-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    overflow-y: auto;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--color-text-regular);
    animation: slide-up-fade 0.4s ease-out both;
    padding: 8px 0;
    border-bottom: 1px dashed var(--color-border-light);
}

.step-item:last-child {
    border-bottom: none;
}

.step-num {
    min-width: 22px;
    height: 22px;
    background: var(--gradient-primary);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(155, 27, 48, 0.2);
}

.step-text {
    flex: 1;
}

.map-container {
    flex: 1;
    height: 220px;
    min-width: 200px;
    position: relative;
}

.map-container::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-left: 1px solid rgba(255,255,255,0.5);
}
</style>
