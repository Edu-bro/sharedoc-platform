import React from 'react';
import { Brain, Users, MessageCircle } from 'lucide-react';
import AIEvaluationTab from './AIEvaluationTab';
import HumanReviewTab from './HumanReviewTab';
import CommentsTab from './CommentsTab';

const RightTabs = ({ activeTab, onTabChange, document, currentPage, isOwner }) => {
  const tabs = [
    {
      id: 'ai',
      label: 'AI 평가',
      icon: Brain,
      component: AIEvaluationTab
    },
    {
      id: 'human',
      label: '사람 평가',
      icon: Users,
      component: HumanReviewTab
    },
    {
      id: 'comments',
      label: '페이지 코멘트',
      icon: MessageCircle,
      component: CommentsTab
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="h-full flex flex-col">
      {/* 탭 헤더 */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {ActiveComponent && (
          <ActiveComponent
            document={document}
            currentPage={currentPage}
            isOwner={isOwner}
          />
        )}
      </div>
    </div>
  );
};

export default RightTabs;