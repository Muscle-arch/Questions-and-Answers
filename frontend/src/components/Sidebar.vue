<template>
    <div class="sidebar">
        <div class="sidebar-top">
            <el-button class="new-chat-btn" @click="handleNewSession">
                <el-icon>
                    <Plus />
                </el-icon>
                新建对话
            </el-button>
        </div>

        <div class="session-list" v-if="chatStore.sessions.length">
            <div v-for="session in chatStore.sessions" :key="session.id" class="session-item"
                :class="{ active: chatStore.currentSessionId === session.id }" @click="handleSelectSession(session.id)">
                <el-icon class="session-icon">
                    <ChatDotRound />
                </el-icon>
                <span class="session-title">{{ session.title }}</span>
                <el-icon class="delete-icon" @click.stop="handleDeleteSession(session.id)">
                    <Delete />
                </el-icon>
            </div>
        </div>

        <div class="empty-tip" v-else>
            <el-icon>
                <ChatDotRound />
            </el-icon>
            <span>暂无对话记录</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { getSessions, createSession, deleteSession, getMessages } from '@/api/chat'
import { Plus, Delete, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 文件说明：问答页左侧会话栏组件
// 页面对应：智能问答页左侧
// 作用：展示历史会话、切换会话、新建会话和删除会话
// 聊天侧边栏：会话列表、新建会话、删除会话
const chatStore = useChatStore()

onMounted(loadSessions)

async function loadSessions() {
    // 页面初始化时拉取会话列表
    try {
        const res = await getSessions()
        chatStore.setSessions(res.items || [])
    } catch {
        // 静默处理
    }
}

async function handleNewSession() {
    // 新建空会话后，立即切换到该会话
    try {
        const session = await createSession('新的对话')
        chatStore.addSession(session)
        await handleSelectSession(session.id)
    } catch (e) {
        ElMessage.error(e.message)
    }
}

async function handleSelectSession(id) {
    // 切换会话后拉取该会话历史消息
    chatStore.setCurrentSession(id)
    try {
        const res = await getMessages(id)
        chatStore.setMessages(res.messages || [])
    } catch (e) {
        ElMessage.error('加载消息失败')
    }
}

async function handleDeleteSession(id) {
    try {
        // 删除前二次确认，防止误操作
        await ElMessageBox.confirm('确认删除该对话记录？', '提示', {
            confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
        })
        await deleteSession(id)
        chatStore.removeSession(id)
    } catch {
        // 取消操作，静默处理
    }
}
</script>

<style scoped>
.sidebar {
    height: 100%;
    background: var(--color-bg-white);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-top {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
}

.new-chat-btn {
    width: 100%;
    background: var(--color-primary) !important;
    color: #fff !important;
    border-color: var(--color-primary) !important;
    border-radius: 6px;
}

.new-chat-btn:hover {
    background: var(--color-primary-light) !important;
}

.session-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 6px;
}

.session-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
}

.session-item:hover {
    background: var(--color-primary-bg);
}

.session-item.active {
    background: var(--color-primary-bg);
}

.session-item.active .session-title {
    color: var(--color-primary);
    font-weight: 500;
}

.session-icon {
    color: var(--color-text-secondary);
    flex-shrink: 0;
    font-size: 15px;
}

.session-title {
    flex: 1;
    font-size: 13px;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.delete-icon {
    opacity: 0;
    color: var(--color-text-secondary);
    font-size: 14px;
    transition: opacity 0.15s;
    flex-shrink: 0;
}

.session-item:hover .delete-icon {
    opacity: 1;
}

.delete-icon:hover {
    color: #f56c6c;
}

.empty-tip {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--color-text-secondary);
    font-size: 13px;
}

.empty-tip .el-icon {
    font-size: 28px;
}
</style>
