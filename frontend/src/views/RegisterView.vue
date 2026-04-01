<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <img :src="logoUrl" alt="SCU" class="auth-logo" @error="e => e.target.style.display = 'none'" />
                <h2>注册账号</h2>
                <p>四川大学智能问答助手</p>
            </div>

            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleRegister">
                <el-form-item prop="username" label="用户名">
                    <el-input v-model="form.username" placeholder="4-20位字母或数字" prefix-icon="User" size="large" />
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input v-model="form.password" type="password" placeholder="至少6位" prefix-icon="Lock" size="large"
                        show-password />
                </el-form-item>
                <el-form-item prop="confirmPassword" label="确认密码">
                    <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" prefix-icon="Lock"
                        size="large" show-password @keyup.enter="handleRegister" />
                </el-form-item>

                <el-button class="submit-btn" type="primary" size="large" :loading="loading" native-type="submit"
                    @click="handleRegister">
                    注 册
                </el-button>
            </el-form>

            <div class="auth-footer">
                已有账号？
                <el-link type="primary" @click="router.push('/login')">立即登录</el-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, login } from '@/api/user'
import { useUserStore } from '@/stores/user'

// 文件说明：注册页
// 页面对应：路由 /register
// 作用：创建新账号，并在成功后自动登录返回首页
const router = useRouter()
const userStore = useUserStore()
const logoUrl = '/scu-logo.svg'

const formRef = ref(null)
const loading = ref(false)

// 注册表单数据
const form = reactive({ username: '', password: '', confirmPassword: '' })

// 自定义校验函数：确认密码必须与第一次输入一致
const validateConfirm = (_rule, value, callback) => {
    if (value !== form.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 20, message: '用户名为4-20位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirm, trigger: 'blur' }
    ]
}

async function handleRegister() {
    // 注册流程：校验 -> 注册 -> 自动登录 -> 跳首页
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        await register({ username: form.username, password: form.password })
        // 注册成功后自动登录，减少一次手动登录操作
        const data = await login({ username: form.username, password: form.password })
        userStore.setAuth(data)
        ElMessage.success('注册成功，欢迎使用！')
        router.push('/')
    } catch (err) {
        ElMessage.error(err?.message || '注册失败，用户名可能已存在')
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
    background: linear-gradient(135deg, #9B1B30 0%, #500a14 100%);
}

.auth-card {
    background: #fff;
    border-radius: 16px;
    padding: 40px 44px;
    width: 380px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

.auth-header {
    text-align: center;
    margin-bottom: 28px;
}

.auth-logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
    border-radius: 50%;
    background: #f5f5f5;
    padding: 4px;
    margin-bottom: 10px;
}

.auth-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.auth-header p {
    font-size: 13px;
    color: #888;
}

.submit-btn {
    width: 100%;
    margin-top: 6px;
    font-size: 15px;
    letter-spacing: 2px;
}

.auth-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #888;
}
</style>
