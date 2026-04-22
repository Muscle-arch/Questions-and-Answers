<template>
    <div class="chat-input">
        <div class="input-container" :class="{ focused: isFocused, hasText: inputText.trim() }">
            <div class="input-glow"></div>
            <el-input 
                v-model="inputText" 
                type="textarea" 
                :rows="1" 
                :autosize="{ minRows: 1, maxRows: 5 }"
                placeholder="输入问题，按 Enter 发送..." 
                :disabled="disabled" 
                @keydown="handleKeydown"
                @focus="isFocused = true"
                @blur="isFocused = false"
                class="input-box" 
                resize="none"
            />
            <div class="input-actions">
                <button 
                    class="send-btn" 
                    :class="{ active: inputText.trim() && !disabled, loading: disabled }" 
                    :disabled="disabled || !inputText.trim()" 
                    @click="handleSend"
                >
                    <span class="btn-bg"></span>
                    <span class="btn-content">
                        <svg v-if="!disabled" class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        <svg v-else class="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10"></path>
                        </svg>
                    </span>
                    <span class="btn-ripple"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['send'])
const inputText = ref('')
const isFocused = ref(false)

function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
    }
}

function handleSend() {
    const text = inputText.value.trim()
    if (!text || props.disabled) return
    emit('send', text)
    inputText.value = ''
}
</script>

<style scoped>
.chat-input {
    padding: 0;
}

.input-container {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 10px 12px;
    background: var(--color-bg);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.input-container:hover {
    border-color: var(--color-primary-light);
}

.input-container.focused {
    border-color: var(--color-primary);
    background: var(--color-bg-white);
    box-shadow: 0 0 0 4px rgba(155, 27, 48, 0.08);
}

.input-glow {
    position: absolute;
    inset: -4px;
    background: var(--gradient-primary);
    filter: blur(16px);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
    z-index: -1;
}

.input-container.focused .input-glow {
    opacity: 0.08;
}

.input-box {
    flex: 1;
}

.input-box :deep(.el-textarea__inner) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 15px;
    line-height: 1.7;
    padding: 6px 0;
    resize: none;
    color: var(--color-text);
    font-weight: 400;
}

.input-box :deep(.el-textarea__inner::placeholder) {
    color: var(--color-text-placeholder);
}

.input-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.send-btn {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: var(--color-bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
}

.send-btn .btn-bg {
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    background-size: 200% 100%;
    opacity: 0;
    transition: all 0.3s;
}

.send-btn.active .btn-bg {
    opacity: 1;
}

.send-btn .btn-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-placeholder);
    transition: all 0.3s;
}

.send-btn.active .btn-content {
    color: #fff;
}

.send-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s;
}

.send-btn.active:hover .send-icon {
    transform: translateX(2px) translateY(-2px);
}

.send-btn.active {
    box-shadow: 0 4px 16px rgba(155, 27, 48, 0.3);
    animation: pulse-glow 2.5s ease-in-out infinite;
}

.send-btn.active:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px rgba(155, 27, 48, 0.4);
}

.send-btn.active:active {
    transform: scale(0.95);
}

.send-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.loading-icon {
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    color: var(--color-text-secondary);
}

.send-btn .btn-ripple {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    opacity: 0;
}

.send-btn.active:active .btn-ripple {
    animation: btn-ripple 0.6s ease-out;
}

@keyframes btn-ripple {
    0% {
        transform: scale(0);
        opacity: 0.5;
    }
    100% {
        transform: scale(2.5);
        opacity: 0;
    }
}
</style>
