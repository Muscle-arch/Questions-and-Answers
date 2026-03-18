"""
RAG问答处理模块
"""
import asyncio
import httpx
from typing import List, Dict
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import settings


class RAGProcessor:
    """RAG处理器"""
    
    def __init__(self):
        """初始化RAG处理器"""
        self.embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-zh")
        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_DB_PATH,
            embedding_function=self.embeddings
        )
        # DeepSeek作为LLM
        self.llm = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            model_name=settings.DEEPSEEK_MODEL,
            base_url="https://api.deepseek.com/v1",
            temperature=0.7
        )
    
    async def process_question(self, question: str, user_id: str = None) -> Dict:
        """处理问题并返回回答"""
        try:
            # 创建RAG链
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True,
                input_key="question"
            )
            
            # 获取答案
            result = await asyncio.to_thread(
                qa_chain,
                {"question": question}
            )
            
            return {
                "status": "success",
                "question": question,
                "answer": result["output_text"],
                "sources": [doc.metadata for doc in result.get("source_documents", [])]
            }
        except Exception as e:
            return {
                "status": "error",
                "question": question,
                "error": str(e)
            }
    
    def load_knowledge_base(self, documents: List[str]):
        """加载知识库"""
        try:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            
            docs = []
            for doc in documents:
                texts = text_splitter.split_text(doc)
                docs.extend([{"content": text} for text in texts])
            
            # 添加到向量数据库
            self.vector_store.add_texts(
                texts=[doc["content"] for doc in docs],
                metadatas=docs
            )
            
            return {"status": "success", "loaded_documents": len(docs)}
        except Exception as e:
            return {"status": "error", "error": str(e)}


class DeepSeekAPI:
    """DeepSeek API客户端"""
    
    def __init__(self):
        """初始化API客户端"""
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = "https://api.deepseek.com/v1"
    
    async def call_deepseek(self, messages: List[Dict], temperature: float = 0.7) -> str:
        """直接调用DeepSeek API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.DEEPSEEK_MODEL,
                        "messages": messages,
                        "temperature": temperature
                    }
                )
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            raise Exception(f"DeepSeek API调用失败: {str(e)}")


# 全局RAG处理器实例
rag_processor = None

def get_rag_processor():
    """获取RAG处理器实例"""
    global rag_processor
    if rag_processor is None:
        rag_processor = RAGProcessor()
    return rag_processor
