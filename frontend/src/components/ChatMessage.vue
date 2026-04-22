<template>
    <div class="message-wrapper" :class="msg.role">
        <!-- 用户消息 -->
        <template v-if="msg.role === 'user'">
            <div class="bubble user-bubble">
                <span class="bubble-content">{{ msg.content }}</span>
            </div>
            <div class="avatar user-avatar">
                <span class="avatar-text">我</span>
                <div class="avatar-ring"></div>
            </div>
        </template>

        <!-- AI 消息 -->
        <template v-else>
            <div class="avatar ai-avatar">
                <img :src="logoUrl" alt="AI" @error="onLogoError" />
                <span class="fallback-ai">AI</span>
                <div class="avatar-pulse"></div>
            </div>
            <div class="ai-body">
                <div class="bubble ai-bubble" :class="{ streaming: isCurrentStreaming }">
                    <div class="bubble-content" v-html="renderedContent" />
                </div>
                
                <!-- 位置卡片 -->
                <div class="location-card" v-if="msg.is_location && msg.location_data">
                    <div class="location-icon">
                        <el-icon :size="24"><Location /></el-icon>
                    </div>
                    <div class="location-info">
                        <div class="location-title">当前位置</div>
                        <div class="location-detail">{{ msg.location_data.province }}{{ msg.location_data.city }}</div>
                    </div>
                </div>

                <!-- 导航跳转按钮 -->
                <div class="nav-button-wrapper" v-if="msg.show_nav_button">
                    <button class="nav-jump-btn" @click="goToNavigation">
                        <el-icon><Position /></el-icon>
                        <span>前往导航</span>
                        <span class="btn-shine"></span>
                    </button>
                </div>

                <!-- 导航结果 -->
                <NavResult v-if="msg.is_navigation && msg.nav_data" :data="msg.nav_data" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { renderMarkdown } from '@/utils/markdown'
import NavResult from '@/components/NavResult.vue'
import { Location, Position } from '@element-plus/icons-vue'

const props = defineProps({
    msg: { type: Object, required: true }
})

const router = useRouter()
const chatStore = useChatStore()

const isCurrentStreaming = computed(
    () => chatStore.isStreaming && props.msg.id === 'streaming'
)

const renderedContent = computed(() => renderMarkdown(props.msg.content))

const logoUrl = '/scu-logo.svg'

function onLogoError(e) {
    e.target.style.display = 'none'
    e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'inline')
}

function goToNavigation() {
    router.push('/nav')
}
</script>

<style scoped>
.message-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 24px;
    animation: message-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes message-enter {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-wrapper.user {
    flex-direction: row-reverse;
}

.message-wrapper.assistant {
    animation: message-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    position: relative;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar:hover {
    transform: scale(1.12);
}

.user-avatar {
    background: var(--gradient-primary);
    color: #fff;
    box-shadow: 0 4px 16px rgba(155, 27, 48, 0.35);
}

.avatar-text {
    position: relative;
    z-index: 2;
}

.avatar-ring {
    position: absolute;
    inset: -3px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    animation: logo-ring-pulse 2s ease-in-out infinite;
}

.ai-avatar {
    background: var(--color-bg-white);
    border: 2px solid var(--color-border);
    overflow: hidden;
    box-shadow: var(--shadow-md);
}

.ai-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
}

.fallback-ai {
    display: none;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 13px;
    position: relative;
    z-index: 2;
}

.avatar-pulse {
    position: absolute;
    inset: -4px;
    border: 2px solid rgba(155, 27, 48, 0.15);
    border-radius: 50%;
    animation: avatar-pulse 2.5s ease-in-out infinite;
}

@keyframes avatar-pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0; }
}

@keyframes logo-ring-pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.08); opacity: 0.2; }
}

.bubble {
    max-width: 680px;
    padding: 14px 18px;
    border-radius: var(--border-radius-lg);
    font-size: 15px;
    line-height: 1.8;
    word-break: break-word;
    position: relative;
    transition: all 0.3s ease;
}

.user-bubble {
    background: var(--gradient-primary);
    color: #fff;
    border-bottom-right-radius: 6px;
    box-shadow: 0 3px 16px rgba(155, 27, 48, 0.25);
    position: relative;
    overflow: hidden;
}

.user-bubble::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%);
    animation: shimmer 3s ease-in-out infinite;
}

.user-bubble:hover {
    box-shadow: 0 6px 24px rgba(155, 27, 48, 0.35);
    transform: translateY(-1px);
}

.ai-bubble {
    background: var(--color-bg-white);
    border: 1px solid var(--color-border);
    border-bottom-left-radius: 6px;
    box-shadow: var(--shadow-card);
    transition: all 0.3s ease;
}

.ai-bubble:hover {
    box-shadow: var(--shadow-card-hover);
}

.ai-bubble.streaming {
    position: relative;
}

.ai-bubble.streaming::after {
    content: '▋';
    display: inline-block;
    color: var(--color-primary);
    margin-left: 2px;
    animation: blink 0.7s step-end infinite;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(155, 27, 48, 0.3);
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* Markdown 内容样式 */
.ai-bubble :deep(h1),
.ai-bubble :deep(h2),
.ai-bubble :deep(h3) {
    margin: 14px 0 8px;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.3px;
}

.ai-bubble :deep(h1) { font-size: 1.3em; }
.ai-bubble :deep(h2) { font-size: 1.15em; }
.ai-bubble :deep(h3) { font-size: 1.05em; }

.ai-bubble :deep(p) {
    margin: 8px 0;
    color: var(--color-text-regular);
}

.ai-bubble :deep(ul),
.ai-bubble :deep(ol) {
    padding-left: 22px;
    margin: 8px 0;
}

.ai-bubble :deep(li) {
    margin: 4px 0;
    color: var(--color-text-regular);
}

.ai-bubble :deep(code) {
    background: var(--color-primary-bg);
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 13px;
    color: var(--color-primary);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.ai-bubble :deep(pre) {
    background: #1E1E2E;
    color: #CDD6F4;
    padding: 16px 18px;
    border-radius: var(--border-radius-sm);
    overflow-x: auto;
    margin: 10px 0;
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(255,255,255,0.05);
    position: relative;
}

.ai-bubble :deep(pre code) {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: 13px;
}

.ai-bubble :deep(blockquote) {
    border-left: 3px solid var(--color-primary);
    margin: 10px 0;
    padding: 10px 16px;
    background: var(--color-primary-bg);
    border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
    color: var(--color-text-secondary);
}

.ai-bubble :deep(a) {
    color: var(--color-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color var(--transition-fast);
}

.ai-bubble :deep(a:hover) {
    border-bottom-color: var(--color-primary);
}

.ai-bubble :deep(table) {
    border-collapse: collapse;
    margin: 10px 0;
    width: 100%;
    font-size: 13px;
}

.ai-bubble :deep(th),
.ai-bubble :deep(td) {
    border: 1px solid var(--color-border);
    padding: 10px 14px;
    text-align: left;
}

.ai-bubble :deep(th) {
    background: var(--color-bg-secondary);
    font-weight: 600;
}

.ai-bubble :deep(hr) {
    border: none;
    height: 1px;
    background: var(--color-border-light);
    margin: 14px 0;
}

.ai-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 720px;
}

/* 位置卡片 */
.location-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
    border: 1px solid #BBF7D0;
    border-radius: var(--border-radius-lg);
    margin-top: 10px;
    max-width: 320px;
    box-shadow: var(--shadow-sm);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.location-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px) scale(1.02);
}

.location-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #10B981, #34D399);
    border-radius: 50%;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    animation: pulse-glow 2.5s ease-in-out infinite;
}

.location-info { flex: 1; }

.location-title {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
    font-weight: 500;
}

.location-detail {
    font-size: 16px;
    font-weight: 600;
    color: #059669;
}

/* 导航按钮 */
.nav-button-wrapper { 
    margin-top: 12px; 
}

.nav-jump-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 26px;
    font-size: 15px;
    border-radius: var(--border-radius-2xl);
    background: var(--gradient-accent);
    border: none;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 3px 16px rgba(155, 27, 48, 0.3);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-jump-btn .btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shine 2s ease-in-out infinite;
}

.nav-jump-btn:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 28px rgba(155, 27, 48, 0.45);
}
</style>
