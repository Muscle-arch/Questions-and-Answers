<template>
    <AppLayout>
        <!-- 背景图片 -->
        <div class="chat-bg"></div>
        
        <!-- 消息列表区域 -->
        <div class="chat-body" ref="bodyRef">
            <div v-if="chatStore.messages.length === 0" class="chat-empty">
                <div class="empty-animation">
                    <div class="robot-container">
                        <div class="robot-icon">🤖</div>
                        <div class="robot-ring"></div>
                        <div class="robot-ring ring2"></div>
                        <div class="robot-glow"></div>
                    </div>
                </div>
                <h3>你好，我是川大智能助手</h3>
                <p class="empty-subtitle">你可以问我关于四川大学的任何问题</p>
                <div class="suggestions">
                    <span v-for="(tip, index) in suggestions" :key="tip" 
                          class="suggestion-chip" 
                          :style="{ animationDelay: `${index * 0.1}s` }"
                          @click="fillSuggestion(tip)">
                        <span class="chip-icon">{{ getSuggestionIcon(index) }}</span>
                        <span class="chip-text">{{ tip }}</span>
                        <span class="chip-arrow">→</span>
                    </span>
                </div>
            </div>

            <ChatMessage v-for="(msg, index) in chatStore.messages" :key="msg.id" :msg="msg" :style="{ animationDelay: `${index * 0.05}s` }" />

            <!-- 流式光标占位（流式消息已在ChatMessage中处理） -->
            <div ref="bottomAnchor" style="height:1px" />
        </div>

        <!-- 输入区域 -->
        <div class="chat-footer">
            <ChatInput :disabled="chatStore.isStreaming" @send="handleSend" />
            <p class="chat-disclaimer">AI 生成内容仅供参考，重要事项请以官方公告为准</p>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppLayout from '@/layout/AppLayout.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { streamChat } from '@/api/chat'

const chatStore = useChatStore()
const userStore = useUserStore()
const bodyRef = ref(null)
const bottomAnchor = ref(null)

// 首页无消息时显示的建议问题
const suggestions = [
    '学校图书馆怎么预约座位？',
    '研究生院在哪里怎么走？',
    '本科生转专业有哪些条件？',
    '学校有哪些优惠餐厅？',
]

function getSuggestionIcon(index) {
    const icons = ['📚', '🏛️', '🔄', '🍜']
    return icons[index] || '💬'
}

function fillSuggestion(text) {
    handleSend(text)
}

function scrollToBottom() {
    nextTick(() => {
        bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
    })
}

// 消息变化时滚动到底部
watch(() => chatStore.messages.length, scrollToBottom)
watch(
    () => {
        const msgs = chatStore.messages
        if (msgs.length === 0) return ''
        const last = msgs[msgs.length - 1]
        return last?.content?.length ?? 0
    },
    scrollToBottom
)

onMounted(async () => {
    chatStore.refreshSessions()
    await nextTick()
    if (chatStore.sessions.length === 0) {
        const session = chatStore.createNewSession('新的对话')
        chatStore.setCurrentSession(session.id)
    }
})

// 监听用户登录状态变化
watch(() => userStore.userInfo?.id, async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
        chatStore.resetForUserSwitch()
        chatStore.refreshSessions()
        await nextTick()
        if (chatStore.sessions.length === 0) {
            const session = chatStore.createNewSession('新的对话')
            chatStore.setCurrentSession(session.id)
        }
    }
})

async function handleSend(text) {
    if (!text.trim() || chatStore.isStreaming) return

    if (!chatStore.currentSessionId) {
        const session = chatStore.createNewSession('新对话')
        chatStore.setCurrentSession(session.id)
    }

    chatStore.appendUserMessage(text)
    scrollToBottom()

    chatStore.startAssistantMessage()
    scrollToBottom()

    try {
        await streamChat(
            chatStore.currentSessionId,
            text,
            (delta) => {
                chatStore.appendDelta(delta)
                scrollToBottom()
            },
            (result) => {
                chatStore.finishAssistantMessage(result)
                if (chatStore.messages.filter(m => m.role === 'user').length === 1) {
                    const title = text.slice(0, 20) + (text.length > 20 ? '…' : '')
                    chatStore.updateSessionTitle(chatStore.currentSessionId, title)
                }
                scrollToBottom()
            }
        )
    } catch (e) {
        chatStore.finishAssistantMessage({ message_id: null, sources: [] })
        ElMessage.error('请求失败，请稍后重试')
    }
}
</script>

<style scoped>
/* 背景图片 */
.chat-bg {
    position: absolute;
    inset: 0;
    background-image: url('/bg6.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.35;
    z-index: 0;
    pointer-events: none;
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - var(--header-height) - 100px);
    position: relative;
    z-index: 1;
}

/* 自定义滚动条样式 - 始终显示 */
.chat-body::-webkit-scrollbar {
    width: 8px;
    display: block;
}

.chat-body::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
}

.chat-body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(155,27,48,0.2), rgba(155,27,48,0.1));
    border-radius: 4px;
    min-height: 30px;
}

.chat-body::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(155,27,48,0.35), rgba(155,27,48,0.2));
}

/* Firefox 滚动条 */
.chat-body {
    scrollbar-width: thin;
    scrollbar-color: rgba(155,27,48,0.2) transparent;
    overflow-y: scroll;
}

.chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.empty-animation {
    position: relative;
    margin-bottom: 28px;
}

.robot-container {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.robot-icon {
    font-size: 52px;
    position: relative;
    z-index: 3;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
}

.robot-ring {
    position: absolute;
    inset: -10px;
    border: 2px solid rgba(155, 27, 48, 0.15);
    border-radius: 50%;
    animation: logo-ring-pulse 2.5s ease-in-out infinite;
}

.robot-ring.ring2 {
    inset: -20px;
    animation-delay: 0.5s;
    border-color: rgba(155, 27, 48, 0.08);
}

.robot-glow {
    position: absolute;
    inset: -30px;
    background: radial-gradient(circle, rgba(155,27,48,0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: glow-breathe 3s ease-in-out infinite;
}

.chat-empty h3 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--color-text);
    letter-spacing: 0.5px;
}

.empty-subtitle {
    font-size: 15px;
    color: var(--color-text-secondary);
    margin-bottom: 36px;
}

.suggestions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 600px;
    width: 100%;
}

.suggestion-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(145deg, #fff 0%, #f8f9fa 100%);
    border: 1px solid rgba(155, 27, 48, 0.1);
    border-radius: 16px;
    font-size: 14px;
    color: var(--color-text-regular);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: slide-up-fade 0.5s ease-out both;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    text-align: left;
}

.suggestion-chip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity 0.3s;
}

.suggestion-chip:hover::before {
    opacity: 1;
}

.suggestion-chip:hover {
    color: #fff;
    border-color: transparent;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(155, 27, 48, 0.3);
}

.chip-icon {
    font-size: 18px;
    transition: transform 0.3s;
}

.suggestion-chip:hover .chip-icon {
    transform: scale(1.2);
}

.chip-text {
    position: relative;
    z-index: 1;
}

.chip-arrow {
    font-size: 16px;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.3s;
}

.suggestion-chip:hover .chip-arrow {
    opacity: 1;
    transform: translateX(0);
}

.chat-footer {
    border-top: 1px solid var(--color-border-light);
    padding: 16px 24px 12px;
    background: var(--color-bg-white);
    position: relative;
}

.chat-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(155,27,48,0.1), transparent);
}

.chat-disclaimer {
    text-align: center;
    font-size: 11px;
    color: var(--color-text-placeholder);
    margin: 10px 0 0;
    letter-spacing: 0.3px;
}

@keyframes logo-ring-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.5; }
}
</style>
