<template>
    <div class="chat-input">
        <el-input v-model="inputText" type="textarea" :rows="1" :autosize="{ minRows: 1, maxRows: 5 }"
            placeholder="输入问题，按 Enter 发送（Shift+Enter 换行）" :disabled="disabled" @keydown="handleKeydown"
            class="input-box" resize="none" />
        <el-button class="send-btn" :disabled="disabled || !inputText.trim()" @click="handleSend" circle>
            <el-icon v-if="!disabled">
                <Promotion />
            </el-icon>
            <el-icon v-else class="loading-icon">
                <Loading />
            </el-icon>
        </el-button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Promotion, Loading } from '@element-plus/icons-vue'

// 文件说明：聊天输入框组件
// 页面对应：智能问答页底部
// 作用：收集用户输入，并通过 send 事件通知父组件发送消息
const props = defineProps({
    disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['send'])
const inputText = ref('')

function handleKeydown(e) {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
    }
}

function handleSend() {
    // 统一做空值和禁用态判断，避免重复发送
    const text = inputText.value.trim()
    if (!text || props.disabled) return
    emit('send', text)
    inputText.value = ''
}
</script>

<style scoped>
.chat-input {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid var(--color-border);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.input-box {
    flex: 1;
}

.input-box :deep(.el-textarea__inner) {
    border-radius: 8px;
    border-color: var(--color-border);
    font-size: 14px;
    line-height: 1.6;
    padding: 8px 12px;
    box-shadow: none;
    resize: none;
}

.input-box :deep(.el-textarea__inner:focus) {
    border-color: var(--color-primary);
}

.send-btn {
    background: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: #fff !important;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
}

.send-btn:disabled {
    background: #ddd !important;
    border-color: #ddd !important;
}

.send-btn:not(:disabled):hover {
    background: var(--color-primary-light) !important;
}

.loading-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
