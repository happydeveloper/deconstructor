"use client";

import { useEffect, useState } from 'react';
import { getHistory, type SearchHistory } from '@/utils/storage';
import { History } from 'lucide-react';

interface SearchHistoryProps {
  onSelect: (word: string) => void;
  currentWord?: string;  // 현재 분석 중인 단어 추가
}

export function SearchHistory({ onSelect, currentWord }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []); // 초기 로딩

  // 현재 단어가 변경될 때마다 히스토리 업데이트
  useEffect(() => {
    if (currentWord) {
      setHistory(getHistory());
    }
  }, [currentWord]);

  useEffect(() => {
    const handleStorage = () => {
      setHistory(getHistory());
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="fixed right-5 top-20 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4 w-72">
      <div className="flex items-center gap-2 mb-3">
        <History size={16} className="text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          최근 분석한 문장
        </h3>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.timestamp}
            onClick={() => onSelect(item.word)}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 break-words"
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  );
} 