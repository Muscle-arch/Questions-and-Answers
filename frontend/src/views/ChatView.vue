<template>
    <AppLayout>
        <!-- 消息列表区域 -->
        <div class="chat-body" ref="bodyRef">
            <div v-if="chatStore.messages.length === 0" class="chat-empty">
                <div class="empty-icon">🤖</div>
                <h3>你好，我是川大智能助手</h3>
                <p>你可以问我关于四川大学的任何问题，比如：</p>
                <div class="suggestions">
                    <span v-for="tip in suggestions" :key="tip" class="suggestion-chip" @click="fillSuggestion(tip)">
                        {{ tip }}
                    </span>
                </div>
            </div>

            <ChatMessage v-for="msg in chatStore.messages" :key="msg.id" :msg="msg" />

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
import { streamChat, createSession } from '@/api/chat'
import { getSessions } from '@/api/chat'

// 文件说明：智能问答页
// 页面对应：路由 /chat
// 作用：承接问答主流程，包括展示消息、发送问题、流式接收回复
const chatStore = useChatStore()
const bodyRef = ref(null)
const bottomAnchor = ref(null)

// 首页无消息时显示的建议问题
const suggestions = [
    '学校图书馆怎么预约座位？',
    '研究生院在哪里怎么走？',
    '本科生转专业有哪些条件？',
    '学校有哪些优惠餐厅？',
]

function fillSuggestion(text) {
    // 点击建议问题，直接走发送流程
    handleSend(text)
}

function scrollToBottom() {
    // 每次消息变化后，将滚动条自动移动到最底部
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
    // 加载会话列表（sidebar 也会加载，这里确保有数据）
    if (chatStore.sessions.length === 0) {
        try {
            const data = await getSessions()
            chatStore.setSessions(data.items || [])
            // 如果会话列表为空，自动创建一个新会话
            if (chatStore.sessions.length === 0) {
                try {
                    const session = await createSession('新的对话')
                    chatStore.addSession(session)
                    chatStore.setCurrentSession(session.id)
                } catch (e) {
                    console.error('创建初始会话失败:', e)
                }
            }
        } catch (e) {
            // 忽略
        }
    }
})

async function handleSend(text) {
    // 发送流程：必要时创建会话 -> 添加用户消息 -> 创建 AI 占位 -> 开始流式回复
    if (!text.trim() || chatStore.isStreaming) return

    // 若无当前会话，先创建一个
    if (!chatStore.currentSessionId) {
        try {
            const session = await createSession('新对话')
            chatStore.addSession(session)
            chatStore.setCurrentSession(session.id)
        } catch (e) {
            ElMessage.error('创建会话失败')
            return
        }
    }

    // 追加用户消息
    chatStore.appendUserMessage(text)
    scrollToBottom()

    // 创建 AI 消息占位
    chatStore.startAssistantMessage()
    scrollToBottom()

    // 发起流式请求：delta 增量回调 + done 收尾回调
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
                // 首条消息后更新 session 标题
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
.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
}

.chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 20px;
    color: #555;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.chat-empty h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.chat-empty p {
    font-size: 14px;
    color: #888;
    margin-bottom: 16px;
}

.suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    max-width: 420px;
}

.suggestion-chip {
    padding: 6px 14px;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    transition: all 0.18s;
}

.suggestion-chip:hover {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
}

.chat-footer {
    border-top: 1px solid #eee;
    padding: 12px 20px 8px;
    background: #fff;
}

.chat-disclaimer {
    text-align: center;
    font-size: 11px;
    color: #bbb;
    margin: 6px 0 0;
}
</style>
