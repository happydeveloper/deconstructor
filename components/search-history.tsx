"use client";

import { useEffect, useState } from 'react';
import { getHistory, type SearchHistory } from '@/utils/storage';
import { History, ChevronDown, ChevronUp, X } from 'lucide-react';

interface SearchHistoryProps {
  onSelect: (word: string) => void;
  currentWord?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchHistory({ onSelect, currentWord, isOpen, onOpenChange }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleWordAnalyzed = () => {
      setHistory(getHistory());
      onOpenChange(true);
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('wordAnalyzed', handleWordAnalyzed);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('wordAnalyzed', handleWordAnalyzed);
    };
  }, []);

  if (history.length === 0) return null;

  return (
    <div 
      className={`
        fixed left-0 transition-all duration-300 ease-in-out z-40
        ${isOpen 
          ? 'opacity-100 ' + (isMobile ? 'top-[80px] bottom-[50%]' : 'top-[60px]') 
          : 'opacity-0 pointer-events-none'
        }
        ${isMobile ? 'w-full' : 'max-w-[300px] ml-4'}
      `}
    >
      <div className="relative w-full h-full bg-white dark:bg-gray-900 shadow-lg rounded-r-lg border border-l-0 border-gray-200 dark:border-gray-800">
        {/* 닫기 버튼 (모바일) */}
        {isMobile && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
        
        {/* 제목 (모바일) */}
        {isMobile && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recent Sentences
            </h3>
          </div>
        )}
        
        {/* 목록 */}
        <div className="h-full overflow-y-auto p-2">
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((item) => (
              <button
                key={item.word}
                onClick={() => {
                  onSelect(item.word);
                  if (isMobile) onOpenChange(false);
                }}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium text-left
                  transition-colors break-words
                  ${
                    currentWord === item.word
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }
                `}
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 