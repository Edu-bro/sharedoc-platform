import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { 
  Play, 
  RefreshCw, 
  TrendingUp, 
  BookOpen, 
  Palette, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const AIEvaluationTab = ({ document, isOwner }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadLatestResult();
  }, [document.id]);

  const loadLatestResult = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getResult(document.id);
      
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      // 결과가 없는 경우는 정상적인 상황
      console.log('AI 평가 결과 없음:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAIEvaluation = async () => {
    try {
      setRunning(true);
      const response = await aiAPI.run(document.id, {});
      
      if (response.success) {
        setResult(response.data);
        toast.success('AI 평가가 완료되었습니다!');
      } else {
        toast.error('AI 평가 실행에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 평가 실행 오류:', error);
      toast.error('AI 평가 실행 중 오류가 발생했습니다.');
    } finally {
      setRunning(false);
    }
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      market: {
        label: '시장성',
        icon: TrendingUp,
        color: '#10b981',
        description: '시장 규모, 성장성, 기회 분석'
      },
      story: {
        label: '스토리',
        icon: BookOpen,
        color: '#3b82f6',
        description: '논리 구조, 설득력, 완성도'
      },
      design: {
        label: '디자인',
        icon: Palette,
        color: '#8b5cf6',
        description: '시각적 표현, 가독성, 일관성'
      },
      finance: {
        label: '재무',
        icon: DollarSign,
        color: '#f59e0b',
        description: '재무 모델, 지표, 수익성'
      }
    };
    return categoryMap[category] || {};
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return '우수';
    if (score >= 3) return '보통';
    return '개선 필요';
  };

  const chartData = result?.scores ? Object.entries(result.scores).map(([key, value]) => ({
    name: getCategoryInfo(key).label,
    score: value,
    fill: getCategoryInfo(key).color
  })) : [];

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="spinner"></div>
        <span className="ml-2">결과 로드 중...</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* 실행 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={runAIEvaluation}
            disabled={running}
            className="btn btn-primary flex-1"
          >
            {running ? (
              <>
                <div className="spinner"></div>
                분석 중...
              </>
            ) : (
              <>
                <Play size={16} />
                AI 평가 실행
              </>
            )}
          </button>
          
          {result && (
            <button
              onClick={runAIEvaluation}
              disabled={running}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {/* 진행 상태 */}
        {running && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-900">AI 분석 진행 중</p>
                <p className="text-xs text-blue-700">문서 내용을 분석하고 있습니다...</p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-4">
            {/* 전체 점수 차트 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">종합 평가</h3>
              </div>
              <div className="card-body">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 5]}
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}점`, '점수']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 항목별 상세 점수 */}
            <div className="space-y-3">
              {Object.entries(result.scores).map(([category, score]) => {
                const info = getCategoryInfo(category);
                const Icon = info.icon;
                
                return (
                  <div key={category} className="card">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={18} style={{ color: info.color }} />
                          <span className="font-medium">{info.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score}점
                          </div>
                          <div className={`text-xs ${getScoreColor(score)}`}>
                            {getScoreLabel(score)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                      
                      {/* 점수 바 */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(score / 5) * 100}%`,
                            backgroundColor: info.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 개선 제안 */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    개선 제안
                  </h3>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 분석 완료 시간 */}
            <div className="text-xs text-gray-500 text-center">
              분석 완료: {new Date(result.createdAt).toLocaleString('ko-KR')}
            </div>
          </div>
        )}

        {/* 결과가 없을 때 */}
        {!result && !running && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI 평가 시작</h3>
            <p className="text-gray-600 text-sm mb-4">
              문서를 AI가 분석하여 시장성, 스토리, 디자인, 재무 측면에서 평가해드립니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEvaluationTab;