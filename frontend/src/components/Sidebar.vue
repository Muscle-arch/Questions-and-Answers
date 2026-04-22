<template>
    <div class="sidebar">
        <div class="sidebar-top">
            <button class="new-chat-btn" @click="handleNewSession">
                <span class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </span>
                <span class="btn-text">新建对话</span>
                <span class="btn-glow"></span>
            </button>
        </div>

        <div class="session-list" v-if="chatStore.sessions.length">
            <TransitionGroup name="session-list">
                <div v-for="(session, index) in chatStore.sessions" :key="session.id" 
                     class="session-item"
                     :class="{ active: chatStore.currentSessionId === session.id }"
                     :style="{ animationDelay: `${index * 0.05}s` }"
                     @click="handleSelectSession(session.id)">
                    <div class="session-indicator"></div>
                    <div class="session-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <span class="session-title">{{ session.title }}</span>
                    <button class="delete-btn" @click.stop="handleDeleteSession(session.id)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </TransitionGroup>
        </div>

        <div class="empty-tip" v-else>
            <div class="empty-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <span>暂无对话记录</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const chatStore = useChatStore()
const userStore = useUserStore()

onMounted(loadSessions)

watch(() => userStore.userInfo?.id, (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
        loadSessions()
    }
})

async function loadSessions() {
    chatStore.refreshSessions()
    await nextTick()
    if (chatStore.sessions.length === 0) {
        const session = chatStore.createNewSession('新的对话')
        chatStore.setCurrentSession(session.id)
    } else if (!chatStore.currentSessionId) {
        chatStore.setCurrentSession(chatStore.sessions[0].id)
    }
}

function handleNewSession() {
    const session = chatStore.createNewSession('新的对话')
    chatStore.setCurrentSession(session.id)
}

function handleSelectSession(id) {
    chatStore.setCurrentSession(id)
}

async function handleDeleteSession(id) {
    try {
        await ElMessageBox.confirm('确认删除该对话记录？', '提示', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        })
        chatStore.removeSession(id)
    } catch {
        // 取消操作
    }
}
</script>

<style scoped>
.sidebar {
    height: 100%;
    background: var(--color-bg-white);
    border-right: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.sidebar::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, transparent, rgba(155,27,48,0.1), transparent);
}

.sidebar-top {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-light);
}

.new-chat-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 20px;
    background: var(--gradient-primary);
    background-size: 200% 100%;
    color: #fff;
    border: none;
    border-radius: var(--border-radius);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 12px rgba(155, 27, 48, 0.25);
}

.new-chat-btn:hover {
    background-position: 100% 0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(155, 27, 48, 0.35);
}

.new-chat-btn:active {
    transform: translateY(0) scale(0.98);
}

.btn-icon svg {
    width: 18px;
    height: 18px;
}

.btn-glow {
    position: absolute;
    inset: -2px;
    background: var(--gradient-primary);
    filter: blur(12px);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
}

.new-chat-btn:hover .btn-glow {
    opacity: 0.5;
}

.session-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 10px;
}

.session-list::-webkit-scrollbar {
    width: 4px;
}

.session-list::-webkit-scrollbar-thumb {
    background: rgba(155, 27, 48, 0.1);
    border-radius: 4px;
}

.session-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    position: relative;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    margin-bottom: 4px;
    animation: slide-up-fade 0.4s ease-out both;
}

.session-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
}

.session-item:hover {
    background: var(--color-primary-bg);
    transform: translateX(4px);
}

.session-item:hover .session-icon-wrapper {
    color: var(--color-primary);
}

.session-item.active {
    background: var(--color-primary-bg);
    box-shadow: inset 3px 0 0 var(--color-primary);
}

.session-item.active::before {
    opacity: 0.03;
}

.session-item.active .session-title {
    color: var(--color-primary);
    font-weight: 600;
}

.session-item.active .session-icon-wrapper {
    color: var(--color-primary);
}

.session-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: var(--color-primary);
    border-radius: 0 2px 2px 0;
    transition: height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.session-item.active .session-indicator {
    height: 24px;
}

.session-icon-wrapper {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
    transition: all 0.3s;
}

.session-icon-wrapper svg {
    width: 100%;
    height: 100%;
}

.session-title {
    flex: 1;
    font-size: 14px;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s;
}

.delete-btn {
    opacity: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;
}

.delete-btn svg {
    width: 16px;
    height: 16px;
}

.session-item:hover .delete-btn {
    opacity: 1;
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.empty-tip {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--color-text-secondary);
    font-size: 14px;
    padding: 40px 20px;
}

.empty-icon-wrapper {
    width: 48px;
    height: 48px;
    color: var(--color-text-placeholder);
    animation: float 3s ease-in-out infinite;
}

.empty-icon-wrapper svg {
    width: 100%;
    height: 100%;
}

/* 列表过渡动画 */
.session-list-move,
.session-list-enter-active,
.session-list-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.session-list-enter-from,
.session-list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.session-list-leave-active {
    position: absolute;
}
</style>
