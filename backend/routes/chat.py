"""
问答API路由
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from rag_processor import get_rag_processor, DeepSeekAPI

router = APIRouter(prefix="/api/chat", tags=["chat"])

# 数据模型
class ChatMessage(BaseModel):
    """聊天消息"""
    content: str
    role: str = "user"

class ChatRequest(BaseModel):
    """聊天请求"""
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    """聊天响应"""
    status: str
    message: str
    data: dict
    timestamp: datetime

class KnowledgeBaseRequest(BaseModel):
    """知识库请求"""
    documents: List[str]
    category: str = "general"

# API端点

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    发送消息并获取AI回答
    
    - **message**: 用户问题
    - **user_id**: 用户ID（可选）
    - **conversation_id**: 对话ID（可选）
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        rag = get_rag_processor()
        result = await rag.process_question(request.message, request.user_id)
        
        return ChatResponse(
            status="success",
            message="消息处理成功",
            data=result,
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@router.post("/direct-query")
async def direct_query(request: ChatRequest):
    """
    直接调用DeepSeek API（不使用RAG）
    
    - **message**: 用户问题
    - **user_id**: 用户ID（可选）
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        deepseek = DeepSeekAPI()
        answer = await deepseek.call_deepseek(
            messages=[
                {
                    "role": "system",
                    "content": "你是四川大学校内问题解答助手，请用中文回答关于学校的问题。"
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )
        
        return ChatResponse(
            status="success",
            message="查询成功",
            data={
                "question": request.message,
                "answer": answer,
                "method": "direct"
            },
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.post("/load-knowledge")
async def load_knowledge(request: KnowledgeBaseRequest):
    """
    加载知识库文档
    
    - **documents**: 文档列表
    - **category**: 文档类别
    """
    try:
        if not request.documents:
            raise HTTPException(status_code=400, detail="文档列表不能为空")
        
        rag = get_rag_processor()
        result = rag.load_knowledge_base(request.documents)
        
        return ChatResponse(
            status=result["status"],
            message="知识库加载完成",
            data=result,
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载失败: {str(e)}")

@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """
    获取对话历史
    
    - **conversation_id**: 对话ID
    """
    try:
        # 这里应该从数据库读取历史记录
        # 示例代码
        return ChatResponse(
            status="success",
            message="获取历史记录成功",
            data={
                "conversation_id": conversation_id,
                "messages": []
            },
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")

@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "Chat API",
        "timestamp": datetime.now()
    }
