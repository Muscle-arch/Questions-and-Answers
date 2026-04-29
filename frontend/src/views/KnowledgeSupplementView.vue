<template>
    <AppLayout :show-sidebar="false">
        <div class="supplement-page">
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <el-icon :size="28"><Collection /></el-icon>
                        知识补全中心
                    </h1>
                    <p class="header-desc">这些问题知识库暂时无法回答，补充答案后可以帮助更多同学</p>
                </div>
                <div class="header-stats" v-if="unansweredList.length > 0">
                    <div class="stat-card">
                        <span class="stat-number">{{ unansweredList.length }}</span>
                        <span class="stat-label">待补充</span>
                    </div>
                </div>
            </div>

            <div class="questions-container" v-if="unansweredList.length > 0">
                <div v-for="item in unansweredList" :key="item.id" class="question-card" :class="{ answering: activeId === item.id, verified: item.verified }">
                    <div class="card-main" @click="toggleAnswer(item.id)">
                        <div class="question-status">
                            <div class="status-dot" :class="{ pending: !item.answered, done: item.answered }"></div>
                        </div>
                        <div class="question-content">
                            <h3>{{ item.question }}</h3>
                            <span class="question-time">{{ formatTime(item.createdAt) }}</span>
                        </div>
                        <div class="question-action">
                            <el-icon :size="20"><ArrowDown v-if="activeId !== item.id" /><ArrowUp v-else /></el-icon>
                        </div>
                    </div>

                    <div class="answer-section" v-show="activeId === item.id">
                        <div class="answer-input-area">
                            <el-input
                                v-model="answerMap[item.id]"
                                type="textarea"
                                :rows="4"
                                placeholder="请输入这个问题的答案..."
                                resize="none"
                            />
                            <div class="answer-actions">
                                <el-button type="danger" text @click="handleDeleteQuestion(item)">
                                    <el-icon><Delete /></el-icon>
                                    删除该问题
                                </el-button>
                                <div class="action-right">
                                    <el-button @click="activeId = null">取消</el-button>
                                    <el-button type="primary" :loading="verifyingId === item.id" @click="submitAnswer(item)">
                                        <el-icon v-if="verifyingId !== item.id"><Check /></el-icon>
                                        提交并验证
                                    </el-button>
                                </div>
                            </div>
                        </div>

                        <div class="verify-result" v-if="verifyResult[item.id]">
                            <div class="result-box" :class="verifyResult[item.id].passed ? 'pass' : 'fail'">
                                <div class="result-header">
                                    <el-icon :size="20"><CircleCheck v-if="verifyResult[item.id].passed" /><CircleClose v-else /></el-icon>
                                    <span>{{ verifyResult[item.id].passed ? '验证通过' : '验证未通过' }}</span>
                                </div>
                                <p class="result-reason">{{ verifyResult[item.id].reason }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="empty-state" v-else>
                <div class="empty-icon">
                    <el-icon :size="64"><Collection /></el-icon>
                </div>
                <h3>暂无待补充的问题</h3>
                <p>当用户提问知识库无法回答时，问题会出现在这里</p>
                <el-button type="primary" @click="router.push('/chat')">去聊天</el-button>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection, ArrowDown, ArrowUp, Check, CircleCheck, CircleClose, Delete } from '@element-plus/icons-vue'
import AppLayout from '@/layout/AppLayout.vue'
import {
    getUnansweredQuestions,
    removeUnansweredQuestion,
    addKnowledgeItem,
} from '@/utils/knowledgeBaseDB.js'
import { chatCompletion } from '@/utils/openai.js'

const router = useRouter()

const unansweredList = ref([])
const activeId = ref(null)
const answerMap = ref({})
const verifyingId = ref(null)
const verifyResult = ref({})

function loadQuestions() {
    unansweredList.value = getUnansweredQuestions().filter(q => !q.answered)
}

async function handleDeleteQuestion(item) {
    try {
        await ElMessageBox.confirm(
            `确定要删除问题"${item.question}"吗？`,
            '删除确认',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        removeUnansweredQuestion(item.id)
        loadQuestions()
        if (activeId.value === item.id) activeId.value = null
        ElMessage.success('已删除')
    } catch {
        // 取消删除
    }
}

function toggleAnswer(id) {
    activeId.value = activeId.value === id ? null : id
}

function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function submitAnswer(item) {
    const answer = answerMap.value[item.id]?.trim()
    if (!answer) {
        ElMessage.warning('请输入答案内容')
        return
    }

    verifyingId.value = item.id
    verifyResult.value[item.id] = null

    try {
        const passed = await verifyAnswerWithAI(item.question, answer)

        if (passed) {
            // 保存到知识库
            addKnowledgeItem({
                question: item.question,
                answer: answer,
                category: '用户补充',
                keywords: [],
                verified: true,
            })
            // 从未回答问题中移除
            removeUnansweredQuestion(item.id)
            // 刷新列表
            loadQuestions()
            activeId.value = null
            ElMessage.success('答案已验证通过并录入知识库！')
        } else {
            verifyResult.value[item.id] = {
                passed: false,
                reason: 'AI认为该答案不够准确或完整，请检查后再提交。',
            }
        }
    } catch (e) {
        console.error('验证失败:', e)
        ElMessage.error('验证服务暂时不可用，请稍后重试')
    } finally {
        verifyingId.value = null
    }
}

async function verifyAnswerWithAI(question, answer) {
    const messages = [
        {
            role: 'system',
            content: `你是一个宽松的内容审核助手。用户正在补充四川大学知识库的问答对，你的任务只是做最基础的把关，确保答案不是完全无意义的回复即可。

宽松审核标准（满足任意一条即通过）：
1. 答案与问题有一定关联
2. 答案表达了某种信息或观点
3. 答案不是明显的垃圾内容

不要对答案的专业性、准确性、长度做苛刻要求。用户补充的内容可以是各种校园生活信息、个人经验分享等。

请只回复 JSON 格式：{"passed": true/false, "reason": "原因说明"}`
        },
        {
            role: 'user',
            content: `问题：${question}\n\n用户提供的答案：${answer}\n\n请宽松审核这个答案是否可以录入知识库。`
        }
    ]

    try {
        const response = await chatCompletion(messages)
        // 尝试从响应中提取JSON
        const jsonMatch = response.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            return result.passed !== false
        }
        // 如果没有JSON，根据关键词判断
        const lower = response.toLowerCase()
        if (lower.includes('不通过') || lower.includes('无效') || lower.includes('垃圾')) {
            return false
        }
        return true
    } catch (e) {
        console.error('AI验证解析失败:', e)
        // 降级：只过滤明显的无效回答
        return !answer.includes('不知道') && !answer.includes('不清楚') && answer.length >= 5
    }
}

onMounted(loadQuestions)
</script>

<style scoped>
.supplement-page {
    height: 100%;
    overflow-y: auto;
    padding: 32px 40px;
    background: linear-gradient(180deg, #faf7f2 0%, #f5f0e8 100%);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(155, 27, 48, 0.1);
}

.header-content h1 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 8px;
}

.header-desc {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
}

.header-stats {
    display: flex;
    gap: 16px;
}

.stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(155, 27, 48, 0.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.stat-number {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-primary);
}

.stat-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 4px;
}

.questions-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
}

.question-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid var(--color-border-light);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.question-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    transform: translateY(-2px);
}

.question-card.answering {
    border-color: rgba(155, 27, 48, 0.2);
    box-shadow: 0 8px 24px rgba(155, 27, 48, 0.1);
}

.card-main {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px;
    cursor: pointer;
    user-select: none;
}

.question-status {
    flex-shrink: 0;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.status-dot.pending {
    background: #f59e0b;
    animation: pulse-dot 2s ease-in-out infinite;
}

.status-dot.done {
    background: #10b981;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
}

.question-content {
    flex: 1;
}

.question-content h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px;
    line-height: 1.5;
}

.question-time {
    font-size: 12px;
    color: var(--color-text-placeholder);
}

.question-action {
    color: var(--color-text-secondary);
    transition: transform 0.3s;
}

.question-card.answering .question-action {
    transform: rotate(180deg);
}

.answer-section {
    padding: 0 24px 24px;
    border-top: 1px solid var(--color-border-light);
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.answer-input-area {
    padding-top: 20px;
}

.answer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
}

.action-right {
    display: flex;
    gap: 12px;
}

.verify-result {
    margin-top: 16px;
}

.result-box {
    padding: 16px 20px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.result-box.pass {
    background: #ecfdf5;
    border: 1px solid #bbf7d0;
}

.result-box.fail {
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
}

.result-box.pass .result-header {
    color: #059669;
}

.result-box.fail .result-header {
    color: #dc2626;
}

.result-reason {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.empty-icon {
    color: var(--color-text-placeholder);
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px;
}

.empty-state p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 24px;
}
</style>
