from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 初始化 FastAPI 应用
app = FastAPI(title="Semantix MVP API", version="1.0.0")

# 配置 CORS，允许来自 localhost:3000 的请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 模型定义

# 输入模型：产品文本请求
class ProductTextRequest(BaseModel):
    original_text: str = Field(..., description="原始产品描述文本")

# 输出模型中嵌套的结构
class FactItem(BaseModel):
    key: str = Field(..., description="事实的键")
    value: str = Field(..., description="事实的值")

class ScenarioItem(BaseModel):
    scenario: str = Field(..., description="使用场景")
    pain_point: str = Field(..., description="痛点")
    solution: str = Field(..., description="解决方案")

class FAQItem(BaseModel):
    question: str = Field(..., description="常见问题")
    answer: str = Field(..., description="问题答案")

class OptimizedStructure(BaseModel):
    fact_table: List[FactItem] = Field(..., description="事实表格")
    scenarios: List[ScenarioItem] = Field(..., description="使用场景列表")
    faq: List[FAQItem] = Field(..., description="常见问题列表")

# 主输出模型：GCO 分析响应
class GCOAnalysisResponse(BaseModel):
    gco_score: int = Field(..., ge=0, le=100, description="GCO 分数 (0-100)")
    analysis_summary: str = Field(..., description="分析摘要")
    missing_elements: List[str] = Field(..., description="缺失的元素列表")
    optimized_structure: OptimizedStructure = Field(..., description="优化后的结构")

# 高质量模拟响应
MOCK_RESPONSE = GCOAnalysisResponse(
    gco_score=75,
    analysis_summary="产品描述包含基本信息，但缺乏特定使用场景和结构化数据。需要优化以提高 AI 搜索可见性。",
    missing_elements=["Missing specific usage scenarios", "Missing structured fact table", "Missing FAQ section"],
    optimized_structure=OptimizedStructure(
        fact_table=[
            {"key": "Material", "value": "100% Organic Cotton"},
            {"key": "Size", "value": "S, M, L, XL"},
            {"key": "Color", "value": "Black, White, Gray"},
            {"key": "Care Instructions", "value": "Machine wash cold, tumble dry low"},
            {"key": "Origin", "value": "Made in USA"}
        ],
        scenarios=[
            {
                "scenario": "Daily Casual Wear",
                "pain_point": "Uncomfortable fabric for all-day wear",
                "solution": "Soft organic cotton provides breathability and comfort for extended use"
            },
            {
                "scenario": "Workout Sessions",
                "pain_point": "Clothing that doesn't wick away sweat",
                "solution": "Moisture-wicking properties keep you dry during intense workouts"
            }
        ],
        faq=[
            {
                "question": "Is this shirt shrink-resistant?",
                "answer": "Yes, the fabric is pre-shrunk to maintain its size after washing"
            },
            {
                "question": "Can I iron this shirt?",
                "answer": "Yes, you can iron it on low heat setting"
            }
        ]
    )
)

# DeepSeek API 调用函数
def call_deepseek_api(original_text: str) -> Dict[str, Any]:
    # 获取 DeepSeek API 密钥
    api_key = os.getenv("DEEPSEEK_API_KEY")
    
    # 如果 API 密钥缺失，返回模拟响应
    if not api_key:
        return MOCK_RESPONSE.model_dump()
    
    try:
        # DeepSeek API 端点
        url = "https://api.deepseek.com/v1/chat/completions"
        
        # 系统提示词：Amazon Rufus 算法审计员
        system_prompt = """You are an Amazon Rufus Algorithm Auditor. Your task is to analyze e-commerce product descriptions and evaluate them according to Amazon Rufus' GCO (Generative Commerce Optimization) standards. 
        
        Return a JSON response with the following schema:
        {
          "gco_score": integer (0-100),
          "analysis_summary": string (2 sentences),
          "missing_elements": list[string] (e.g., "Missing specific usage scenarios"),
          "optimized_structure": {
            "fact_table": list[{"key": str, "value": str}],
            "scenarios": list[{"scenario": str, "pain_point": str, "solution": str}],
            "faq": list[{"question": str, "answer": str}]
          }
        }
        
        The GCO score should reflect how well the product description is optimized for AI search engines like Amazon Rufus. Higher scores indicate better optimization.
        
        Focus on:
        1. Structured data presentation
        2. Specific usage scenarios
        3. Clear pain points and solutions
        4. Comprehensive FAQ section
        5. Relevant facts and specifications
        """
        
        # 构建请求体
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": original_text}
            ],
            "response_format": {"type": "json"}
        }
        
        # 发送请求
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # 检查 HTTP 错误
        
        # 解析响应
        result = response.json()
        return result["choices"][0]["message"]["content"]
        
    except Exception as e:
        # 如果 API 调用失败，返回模拟响应
        print(f"DeepSeek API call failed: {str(e)}")
        return MOCK_RESPONSE.model_dump()

# API 端点：分析产品文本
@app.post("/analyze", response_model=GCOAnalysisResponse)
async def analyze_product_text(request: ProductTextRequest):
    """
    分析产品描述文本，返回 GCO 分析结果
    
    - **original_text**: 原始产品描述文本
    - 返回：包含 GCO 分数、分析摘要、缺失元素和优化结构的响应
    """
    # 调用 DeepSeek API 或返回模拟响应
    result = call_deepseek_api(request.original_text)
    
    # 确保结果符合 GCOAnalysisResponse 模型
    return GCOAnalysisResponse(**result)

# 根路径
@app.get("/")
async def root():
    return {"message": "Semantix MVP API is running"}

# 运行应用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)