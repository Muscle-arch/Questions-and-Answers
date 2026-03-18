<template>
    <div class="message-wrapper" :class="msg.role">
        <!-- 用户消息 -->
        <template v-if="msg.role === 'user'">
            <div class="bubble user-bubble">{{ msg.content }}</div>
            <div class="avatar user-avatar">我</div>
        </template>

        <!-- AI 消息 -->
        <template v-else>
            <div class="avatar ai-avatar">
                <img :src="logoUrl" alt="AI" @error="onLogoError" />
                <span class="fallback-ai">AI</span>
            </div>
            <div class="ai-body">
                <div class="bubble ai-bubble" :class="{ streaming: isCurrentStreaming }" v-html="renderedContent" />
                <!-- 来源引用 -->
                <div class="sources" v-if="msg.sources && msg.sources.length">
                    <el-collapse>
                        <el-collapse-item>
                            <template #title>
                                <el-icon>
                                    <Document />
                                </el-icon>
                                <span style="margin-left:4px;font-size:12px">参考来源 ({{ msg.sources.length }})</span>
                            </template>
                            <div class="source-item" v-for="(s, i) in msg.sources" :key="i">
                                <strong>{{ s.title }}</strong>
                                <p>{{ s.content }}</p>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
                <!-- 导航结果 -->
                <NavResult v-if="msg.is_navigation && msg.nav_data" :data="msg.nav_data" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { renderMarkdown } from '@/utils/markdown'
import NavResult from '@/components/NavResult.vue'
import { Document } from '@element-plus/icons-vue'

// 文件说明：单条消息组件
// 页面对应：智能问答页消息列表
// 作用：根据消息类型渲染用户消息、AI 回答、参考来源和导航结果卡片
const props = defineProps({
    msg: { type: Object, required: true }
})

const chatStore = useChatStore()

// 仅最后一条流式 AI 消息显示打字光标
const isCurrentStreaming = computed(
    () => chatStore.isStreaming && props.msg.id === 'streaming'
)

// 统一把 AI 文本按 Markdown 转 HTML
const renderedContent = computed(() => renderMarkdown(props.msg.content))

const logoUrl = '/scu-logo.svg'

function onLogoError(e) {
    // logo 失效时回退显示 “AI” 文本
    e.target.style.display = 'none'
    e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'inline')
}
</script>

<style scoped>
.message-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 16px;
}

.message-wrapper.user {
    flex-direction: row-reverse;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
}

.user-avatar {
    background: var(--color-primary);
    color: #fff;
}

.ai-avatar {
    background: var(--color-primary-bg);
    border: 1px solid var(--color-primary-light);
    overflow: hidden;
    position: relative;
}

.ai-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fallback-ai {
    display: none;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 12px;
}

.bubble {
    max-width: 680px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.7;
    word-break: break-word;
}

.user-bubble {
    background: var(--color-primary);
    color: #fff;
    border-bottom-right-radius: 3px;
}

.ai-bubble {
    background: #fff;
    border: 1px solid var(--color-border);
    border-bottom-left-radius: 3px;
    box-shadow: var(--shadow-sm);
}

.ai-bubble.streaming::after {
    content: '▋';
    display: inline-block;
    animation: blink 0.8s infinite;
    color: var(--color-primary);
    margin-left: 2px;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

/* Markdown 内容样式 */
.ai-bubble :deep(h1),
.ai-bubble :deep(h2),
.ai-bubble :deep(h3) {
    margin: 8px 0 4px;
    font-weight: 600;
}

.ai-bubble :deep(p) {
    margin: 4px 0;
}

.ai-bubble :deep(ul),
.ai-bubble :deep(ol) {
    padding-left: 20px;
    margin: 4px 0;
}

.ai-bubble :deep(code) {
    background: #f5f5f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 13px;
}

.ai-bubble :deep(pre) {
    background: #f8f8f8;
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 6px 0;
}

.ai-bubble :deep(blockquote) {
    border-left: 3px solid var(--color-primary);
    margin: 6px 0;
    padding-left: 10px;
    color: var(--color-text-secondary);
}

.ai-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 720px;
}

.sources {
    font-size: 12px;
}

.source-item {
    margin-bottom: 6px;
    padding: 6px 8px;
    background: #fafafa;
    border-radius: 4px;
}

.source-item p {
    color: var(--color-text-secondary);
    margin-top: 2px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
