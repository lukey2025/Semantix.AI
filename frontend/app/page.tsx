'use client';

import { useState } from 'react';
import { BarChart3, CheckCircle, AlertCircle, BrainCircuit } from 'lucide-react';

// 定义 API 响应类型
interface FactItem {
  key: string;
  value: string;
}

interface ScenarioItem {
  scenario: string;
  pain_point: string;
  solution: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface OptimizedStructure {
  fact_table: FactItem[];
  scenarios: ScenarioItem[];
  faq: FAQItem[];
}

interface GCOAnalysisResponse {
  gco_score: number;
  analysis_summary: string;
  missing_elements: string[];
  optimized_structure: OptimizedStructure;
}

// 速度计组件
const Speedometer = ({ score }: { score: number }) => {
  // 计算颜色基于分数
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">GCO Score</h3>
        <div className="relative w-48 h-48">
          {/* 背景圆环 */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="10"
            />
            {/* 进度圆环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              strokeDasharray={`${(score / 100) * 283} 283`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* 分数文本 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          {score >= 80 ? 'Excellent AI Search Optimization' : 
           score >= 60 ? 'Good AI Search Optimization' : 
           'Needs Improvement'}
        </p>
      </div>
    </div>
  );
};

// 主页面组件
export default function Home() {
  const [originalText, setOriginalText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<GCOAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'facts' | 'scenarios' | 'faq'>('facts');

  // 分析产品描述
  const analyzeProduct = async () => {
    if (!originalText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_text: originalText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze product');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing product:', error);
      // 可以添加错误处理
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 标题栏 */}
      <header className="border-b border-purple-500/30 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Semantix AI
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            AI Search Engine Optimization for E-Commerce
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <h2 className="text-xl font-semibold text-purple-400 mb-4">
                Product Description
              </h2>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste your product description here..."
                className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <button
                onClick={analyzeProduct}
                disabled={isLoading || !originalText.trim()}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2
                  ${isLoading || !originalText.trim()
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    Analyze for AI
                  </>
                )}
              </button>
            </div>

            {/* 分析摘要 */}
            {analysisResult && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Analysis Summary</h3>
                <p className="text-gray-300 mb-4">{analysisResult.analysis_summary}</p>
                
                {/* 缺失元素 */}
                {analysisResult.missing_elements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Missing Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missing_elements.map((element, index) => (
                        <span key={index} className="flex items-center gap-1 bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded-full text-sm">
                          <AlertCircle className="h-3 w-3" />
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：结果区域 */}
          <div className="space-y-6">
            {/* 速度计 */}
            {analysisResult ? (
              <Speedometer score={analysisResult.gco_score} />
            ) : (
              <div className="bg-gray-900 rounded-2xl p-12 border border-purple-500/30 shadow-lg shadow-purple-500/10 flex flex-col items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-purple-500/50 mb-4" />
                <p className="text-gray-400 text-center">
                  Enter a product description and click "Analyze for AI" to see your GCO score
                </p>
              </div>
            )}

            {/* 标签页 */}
            {analysisResult && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                {/* 标签页导航 */}
                <div className="flex border-b border-gray-700 mb-6">
                  {[
                    { id: 'facts', label: 'Facts', icon: <CheckCircle className="h-4 w-4" /> },
                    { id: 'scenarios', label: 'Scenarios', icon: <BrainCircuit className="h-4 w-4" /> },
                    { id: 'faq', label: 'Q&A', icon: <AlertCircle className="h-4 w-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'text-purple-400 border-b-2 border-purple-500'
                          : 'text-gray-400 hover:text-gray-200'}
                      `}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 标签页内容 */}
                <div className="space-y-4">
                  {/* 事实表格 */}
                  {activeTab === 'facts' && (
                    <div className="space-y-3">
                      {analysisResult.optimized_structure.fact_table.map((fact, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700">
                            <span className="text-sm text-gray-400">{fact.key}</span>
                          </div>
                          <div className="bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700">
                            <span className="text-sm text-gray-200">{fact.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 场景 */}
                  {activeTab === 'scenarios' && (
                    <div className="space-y-4">
                      {analysisResult.optimized_structure.scenarios.map((scenario, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="font-semibold text-purple-300 mb-2">{scenario.scenario}</h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <div>
                                <span className="text-sm text-gray-400">Pain Point:</span>
                                <p className="text-sm text-gray-200">{scenario.pain_point}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <div>
                                <span className="text-sm text-gray-400">Solution:</span>
                                <p className="text-sm text-gray-200">{scenario.solution}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FAQ */}
                  {activeTab === 'faq' && (
                    <div className="space-y-4">
                      {analysisResult.optimized_structure.faq.map((faq, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="font-semibold text-blue-300 mb-2">{faq.question}</h4>
                          <p className="text-sm text-gray-300">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}