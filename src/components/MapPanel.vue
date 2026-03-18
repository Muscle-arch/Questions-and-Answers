<template>
    <div class="map-panel" ref="mapContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// 文件说明：地图展示组件
// 页面对应：校园导航页、聊天页中的导航结果卡片
// 作用：封装高德地图加载、路线绘制和地点标记逻辑
// ====================================================================
// 高德地图 JS API Key 配置说明：
// 1. 访问 https://console.amap.com/dev/key/app 申请 Key
// 2. 将申请到的 Key 填入项目根目录 frontend/.env：
//    VITE_AMAP_JS_KEY=你的Key
// 3. 在高德控制台将该Key绑定 "Web端(JS API)"，并添加域名白名单 localhost:5173
// ====================================================================
const AMAP_KEY = import.meta.env.VITE_AMAP_JS_KEY || ''
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE || ''

const props = defineProps({
    polyline: { type: String, default: '' },  // 路线坐标串 "lng,lat;lng,lat;..."
    originLnglat: { type: Array, default: null },
    destLnglat: { type: Array, default: null },
    originName: { type: String, default: '起点' },
    destName: { type: String, default: '终点' },
    markers: { type: Array, default: () => [] },
    boundaryPath: { type: Array, default: () => [] },
    center: { type: Array, default: () => [104.0835, 30.6300] }, // 默认望江校区中心
    zoom: { type: Number, default: 17 }
})

const mapContainer = ref(null)
let mapInstance = null
let baseLayer = null

// 加载本组件时动态加载高德地图脚本并初始化地图实例，组件销毁时清理资源
onMounted(async () => {
    if (!AMAP_KEY || AMAP_KEY.includes('【')) {
        renderPlaceholder('请在 .env 中填入有效的 VITE_AMAP_JS_KEY')
        return
    }

    try {
        await loadAmapScript()
        await nextTick()
        initMap()
        window.addEventListener('resize', handleResize)
    } catch (error) {
        const msg = error?.message || '高德地图脚本加载失败'
        renderPlaceholder(`底图加载失败：${msg}`)
    }
})

onUnmounted(() => {
    // 组件销毁时清理地图实例和事件监听，避免内存泄漏
    window.removeEventListener('resize', handleResize)
    if (mapInstance) {
        mapInstance.destroy()
        mapInstance = null
    }
})

watch(
    () => [
        props.polyline,
        props.center.join(','),
        props.zoom,
        props.originLnglat?.join(',') || '',
        props.destLnglat?.join(',') || '',
        JSON.stringify(props.markers),
        JSON.stringify(props.boundaryPath)
    ],
    () => {
        if (mapInstance) renderMapContent()
    }
)

// 动态加载高德地图脚本
function loadAmapScript() {
    // 动态插入高德地图脚本，避免每个页面手动引入
    return new Promise((resolve, reject) => {
        if (window.AMap) { resolve(); return }

        // 若已配置安全密钥，按高德要求先挂到全局
        if (AMAP_SECURITY_CODE) {
            window._AMapSecurityConfig = {
                securityJsCode: AMAP_SECURITY_CODE
            }
        }

        const existed = document.getElementById('amap-sdk-script')
        if (existed) {
            if (window.AMap) {
                resolve()
                return
            }
            existed.addEventListener('load', () => resolve(), { once: true })
            existed.addEventListener('error', () => reject(new Error('AMap SDK 加载失败')), { once: true })
            return
        }

        const script = document.createElement('script')
        script.id = 'amap-sdk-script'
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
        script.async = true
        script.defer = true
        script.onload = () => {
            if (!window.AMap) {
                reject(new Error('AMap 全局对象不存在，请检查 Key 与域名白名单'))
                return
            }
            resolve()
        }
        script.onerror = () => reject(new Error('无法访问 webapi.amap.com，请检查网络'))
        document.head.appendChild(script)
    })
}

function initMap() {
    if (!window.AMap || !mapContainer.value) {
        renderPlaceholder('地图 SDK 初始化失败，请检查控制台错误信息')
        return
    }

    // 显式创建底图图层，规避某些环境下只显示覆盖物不显示底图的问题
    baseLayer = new window.AMap.TileLayer({
        zIndex: 1,
        zooms: [3, 20]
    })

    // 首次初始化地图实例
    mapInstance = new window.AMap.Map(mapContainer.value, {
        // 一些常用常用的高德地图属性配置，具体可根据需求调整
        center: props.center,
        zoom: props.zoom,
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
        resizeEnable: true,
        layers: [baseLayer]
    })

    // 确保容器有尺寸时再重绘，避免首次渲染为空白
    handleResize()
    renderMapContent()
}

function handleResize() {
    if (!mapInstance) return
    mapInstance.resize()
}

function renderMapContent() {
    if (!mapInstance) return

    ensureBaseLayer()

    // 有路线时优先画路线；无路线时展示校区标记点
    if (props.polyline) {
        drawRoute()
        return
    }

    drawCampusMarkers()
}

function ensureBaseLayer() {
    if (!mapInstance || !window.AMap) return
    const layers = mapInstance.getLayers() || []
    const hasTileLayer = layers.some((layer) => layer && layer.CLASS_NAME === 'AMap.TileLayer')
    if (!hasTileLayer) {
        baseLayer = baseLayer || new window.AMap.TileLayer({ zIndex: 1, zooms: [3, 20] })
        mapInstance.add(baseLayer)
    }
}

function drawRoute() {
    if (!mapInstance) return
    mapInstance.clearMap()

    // 解析 polyline
    const path = props.polyline.split(';').map(p => {
        const [lng, lat] = p.split(',').map(Number)
        return new window.AMap.LngLat(lng, lat)
    })

    // 绘制路线
    new window.AMap.Polyline({
        map: mapInstance,
        path,
        strokeColor: '#1677FF',
        strokeWeight: 5,
        strokeOpacity: 0.9
    })

    // 起点 Marker
    if (props.originLnglat) {
        new window.AMap.Marker({
            map: mapInstance,
            position: props.originLnglat,
            title: props.originName,
            label: { content: props.originName, offset: new window.AMap.Pixel(-10, -30) }
        })
    }

    // 终点 Marker
    if (props.destLnglat) {
        new window.AMap.Marker({
            map: mapInstance,
            position: props.destLnglat,
            title: props.destName,
            label: { content: props.destName, offset: new window.AMap.Pixel(-10, -30) }
        })
    }

    drawCampusBoundary(false)

    mapInstance.setFitView()
}

function drawCampusBoundary(needFitView = false) {
    if (!mapInstance || !window.AMap || !Array.isArray(props.boundaryPath) || props.boundaryPath.length < 3) {
        return
    }

    const boundary = [...props.boundaryPath]
    const first = boundary[0]
    const last = boundary[boundary.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
        boundary.push(first)
    }

    const polyline = new window.AMap.Polyline({
        map: mapInstance,
        path: boundary,
        strokeColor: '#1677FF',
        strokeWeight: 3,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        zIndex: 50
    })

    if (needFitView) {
        mapInstance.setFitView([polyline])
    }
}

function drawCampusMarkers() {
    mapInstance.clearMap()
    mapInstance.setCenter(props.center)
    mapInstance.setZoom(props.zoom)

    // 标记点格式：[{ name, position:[lng,lat] }]
    const markers = props.markers || []
    for (const marker of markers) {
        new window.AMap.Marker({
            map: mapInstance,
            position: marker.position,
            title: marker.name,
            label: { content: marker.name, offset: new window.AMap.Pixel(-12, -28) }
        })
    }

    drawCampusBoundary(false)

    if (markers.length > 1 || props.boundaryPath.length > 2) {
        mapInstance.setFitView()
    }
}

// 无 Key 时显示占位提示
function renderPlaceholder(message = '请在 .env 中填入高德地图 JS API Key') {
    // 未配置 Key 时给出清晰提示，避免出现空白地图区域
    if (mapContainer.value) {
        mapContainer.value.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;
        justify-content:center;background:#f5f5f5;color:#999;gap:8px;font-size:13px;">
        <span style="font-size:28px">🗺️</span>
                <span>地图加载异常</span>
                <span style="font-size:11px">${message}</span>
        <a href="https://console.amap.com/dev/key/app" target="_blank"
          style="font-size:11px;color:#1677FF">申请地址 →</a>
      </div>`
    }
}
</script>

<style scoped>
.map-panel {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
    background: #eee;
}
</style>
