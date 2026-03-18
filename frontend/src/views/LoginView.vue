<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <img :src="logoUrl" alt="SCU" class="auth-logo" @error="e => e.target.style.display = 'none'" />
                <h2>登录</h2>
                <p>四川大学智能问答助手</p>
            </div>

            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
                <el-form-item prop="username" label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                        size="large" show-password @keyup.enter="handleLogin" />
                </el-form-item>

                <el-button class="submit-btn" type="primary" size="large" :loading="loading" native-type="submit"
                    @click="handleLogin">
                    登 录
                </el-button>
            </el-form>

            <div class="auth-footer">
                还没有账号？
                <el-link type="primary" @click="router.push('/register')">立即注册</el-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'

// 文件说明：登录页
// 页面对应：路由 /login
// 作用：输入账号密码，完成登录并恢复跳转目标
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const logoUrl = '/scu-logo.svg'

const formRef = ref(null)
const loading = ref(false)


// 表单数据：和输入框 v-model 双向绑定
const form = reactive({ username: '', password: '' })

// 表单校验规则：提交前由 Element Plus 自动验证
const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
    // 先做前端表单校验，不通过则不发请求
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const data = await login(form.username, form.password)
        userStore.setAuth(data)
        ElMessage.success('登录成功')
        // 如果来自受保护页，登录后回到原页面；否则回首页
        const redirect = route.query.redirect || '/'
        router.push(String(redirect))
    } catch (err) {
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
