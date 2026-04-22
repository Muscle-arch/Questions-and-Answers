<template>
    <div class="auth-page">
        <!-- 动态背景 -->
        <div class="auth-bg">
            <div class="bg-gradient"></div>
            <div class="bg-particles">
                <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
            </div>
            <div class="wave-container">
                <svg class="wave wave1" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="rgba(255,255,255,0.05)" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L0,320Z"></path>
                </svg>
                <svg class="wave wave2" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="rgba(255,255,255,0.03)" d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,213.3C672,235,768,245,864,229.3C960,213,1056,171,1152,154.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L0,320Z"></path>
                </svg>
                <svg class="wave wave3" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="rgba(255,255,255,0.02)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z"></path>
                </svg>
            </div>
        </div>

        <!-- 登录卡片 -->
        <div class="auth-card" :class="{ shake: isError }">
            <div class="card-glow"></div>
            <div class="card-border"></div>
            
            <div class="auth-header">
                <div class="logo-container">
                    <img :src="logoUrl" alt="SCU" class="auth-logo" @error="e => e.target.style.display = 'none'" />
                    <div class="logo-ring"></div>
                </div>
                <h2>欢迎回来</h2>
                <p>登录四川大学智能问答助手</p>
            </div>

            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
                <el-form-item prop="username" label="用户名">
                    <div class="input-wrapper" :class="{ focused: focusedField === 'username', filled: form.username }">
                        <div class="input-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <el-input 
                            v-model="form.username" 
                            placeholder="请输入用户名" 
                            size="large"
                            @focus="focusedField = 'username'"
                            @blur="focusedField = ''"
                            class="custom-input"
                        />
                        <div class="input-line"></div>
                    </div>
                </el-form-item>
                
                <el-form-item prop="password" label="密码">
                    <div class="input-wrapper" :class="{ focused: focusedField === 'password', filled: form.password }">
                        <div class="input-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <el-input 
                            v-model="form.password" 
                            type="password" 
                            placeholder="请输入密码" 
                            size="large"
                            show-password
                            @focus="focusedField = 'password'"
                            @blur="focusedField = ''"
                            @keyup.enter="handleLogin"
                            class="custom-input"
                        />
                        <div class="input-line"></div>
                    </div>
                </el-form-item>

                <button class="submit-btn" :class="{ loading: loading }" :disabled="loading" @click="handleLogin">
                    <span class="btn-bg"></span>
                    <span class="btn-content">
                        <span v-if="!loading" class="btn-text">登 录</span>
                        <span v-else class="btn-loading">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </span>
                    </span>
                    <span class="btn-glow"></span>
                </button>
            </el-form>

            <div class="auth-footer">
                <span>还没有账号？</span>
                <el-link type="primary" @click="router.push('/register')" class="register-link">
                    立即注册
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </el-link>
            </div>
        </div>

        <!-- 装饰元素 -->
        <div class="floating-shapes">
            <div class="shape shape1"></div>
            <div class="shape shape2"></div>
            <div class="shape shape3"></div>
            <div class="shape shape4"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const chatStore = useChatStore()
const logoUrl = '/scu-logo.svg'

const formRef = ref(null)
const loading = ref(false)
const isError = ref(false)
const focusedField = ref('')

const form = reactive({ username: '', password: '' })

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function getParticleStyle(index) {
    const size = Math.random() * 4 + 2
    const x = Math.random() * 100
    const delay = Math.random() * 20
    const duration = Math.random() * 20 + 15
    return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
    }
}

async function handleLogin() {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const data = await login({ username: form.username, password: form.password })
        userStore.setAuth(data)
        chatStore.refreshSessions()
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(String(redirect))
    } catch (err) {
        isError.value = true
        setTimeout(() => isError.value = false, 500)
        ElMessage.error(err?.message || '登录失败，请检查用户名或密码')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

/* ── 动态背景 ── */
.auth-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #9B1B30 0%, #7A1526 50%, #500a14 100%);
}

.bg-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(200,149,108,0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(155,27,48,0.2) 0%, transparent 50%);
    animation: gradient-flow 15s ease infinite;
    background-size: 200% 200%;
}

.bg-particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.particle {
    position: absolute;
    bottom: -10px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: particle-rise linear infinite;
}

@keyframes particle-rise {
    0% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) translateX(50px) scale(0);
        opacity: 0;
    }
}

/* ── 波浪 ── */
.wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
}

.wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    transform-origin: bottom;
}

.wave1 { animation: wave-move 12s linear infinite; }
.wave2 { animation: wave-move 15s linear infinite reverse; }
.wave3 { animation: wave-move 18s linear infinite; }

@keyframes wave-move {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* ── 登录卡片 ── */
.auth-card {
    position: relative;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--border-radius-2xl);
    padding: 48px 44px;
    width: 400px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    z-index: 10;
    animation: card-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition: transform 0.3s ease;
}

.auth-card.shake {
    animation: card-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), shake 0.5s ease;
}

@keyframes card-enter {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.card-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(155,27,48,0.3), rgba(200,149,108,0.3), rgba(155,27,48,0.3));
    border-radius: inherit;
    filter: blur(20px);
    opacity: 0;
    transition: opacity 0.5s;
    z-index: -1;
}

.auth-card:hover .card-glow {
    opacity: 1;
}

.card-border {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.logo-container {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
}

.auth-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5f5f5, #fff);
    padding: 6px;
    box-shadow: 0 4px 20px rgba(155, 27, 48, 0.2);
    position: relative;
    z-index: 2;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.auth-logo:hover {
    transform: scale(1.1) rotate(5deg);
}

.logo-ring {
    position: absolute;
    inset: -6px;
    border: 2px solid rgba(155, 27, 48, 0.2);
    border-radius: 50%;
    animation: logo-ring-pulse 2s ease-in-out infinite;
}

@keyframes logo-ring-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.5; }
}

.auth-header h2 {
    font-size: 26px;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 8px;
    letter-spacing: 1px;
}

.auth-header p {
    font-size: 14px;
    color: var(--color-text-secondary);
}

/* ── 输入框 ── */
.input-wrapper {
    position: relative;
    transition: all 0.3s ease;
}

.input-wrapper :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    padding-left: 44px;
    border: none;
}

.input-wrapper :deep(.el-input__inner) {
    font-size: 15px;
    color: var(--color-text);
}

.input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--color-text-placeholder);
    transition: all 0.3s ease;
    z-index: 2;
}

.input-icon svg {
    width: 100%;
    height: 100%;
}

.input-wrapper.focused .input-icon {
    color: var(--color-primary);
    transform: translateY(-50%) scale(1.1);
}

.input-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
}

.input-line::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 0;
    height: 100%;
    background: var(--gradient-primary);
    transition: all 0.3s ease;
    transform: translateX(-50%);
}

.input-wrapper.focused .input-line::after {
    width: 100%;
}

.input-wrapper.focused {
    background: rgba(155, 27, 48, 0.02);
    border-radius: var(--border-radius-sm);
}

/* ── 提交按钮 ── */
.submit-btn {
    width: 100%;
    margin-top: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 4px;
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    border: none;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.submit-btn .btn-bg {
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    background-size: 200% 100%;
    transition: all 0.4s;
}

.submit-btn:hover .btn-bg {
    background-position: 100% 0;
}

.submit-btn .btn-content {
    position: relative;
    z-index: 1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.submit-btn .btn-glow {
    position: absolute;
    inset: -2px;
    background: var(--gradient-primary);
    filter: blur(12px);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(155, 27, 48, 0.4);
}

.submit-btn:hover .btn-glow {
    opacity: 0.6;
}

.submit-btn:active {
    transform: translateY(0) scale(0.98);
}

.submit-btn:disabled {
    cursor: not-allowed;
}

.submit-btn.loading .btn-bg {
    background: var(--color-bg-secondary);
}

.submit-btn.loading .btn-content {
    color: var(--color-text-secondary);
}

/* 加载动画 */
.btn-loading {
    display: flex;
    gap: 4px;
}

.btn-loading .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: dot-bounce 1s ease-in-out infinite;
}

.btn-loading .dot:nth-child(2) { animation-delay: 0.1s; }
.btn-loading .dot:nth-child(3) { animation-delay: 0.2s; }

@keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
}

/* ── 底部链接 ── */
.auth-footer {
    text-align: center;
    margin-top: 28px;
    font-size: 14px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.register-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.register-link svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s;
}

.register-link:hover svg {
    transform: translateX(4px);
}

/* ── 浮动装饰 ── */
.floating-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.3;
}

.shape1 {
    width: 300px;
    height: 300px;
    top: -100px;
    left: -100px;
    background: rgba(200, 149, 108, 0.4);
    animation: floatSlow 20s ease-in-out infinite;
}

.shape2 {
    width: 200px;
    height: 200px;
    top: 50%;
    right: -50px;
    background: rgba(155, 27, 48, 0.3);
    animation: floatSlow 25s ease-in-out infinite 5s;
}

.shape3 {
    width: 250px;
    height: 250px;
    bottom: -80px;
    left: 20%;
    background: rgba(200, 149, 108, 0.35);
    animation: floatSlow 22s ease-in-out infinite 3s;
}

.shape4 {
    width: 150px;
    height: 150px;
    top: 20%;
    right: 10%;
    background: rgba(155, 27, 48, 0.25);
    animation: floatSlow 18s ease-in-out infinite 8s;
}

@media (max-width: 480px) {
    .auth-card {
        width: calc(100% - 32px);
        padding: 36px 28px;
        margin: 16px;
    }
    
    .auth-header h2 {
        font-size: 22px;
    }
}
</style>
