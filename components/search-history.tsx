"use client";

import { useEffect, useState } from 'react';
import { getHistory, type SearchHistory } from '@/utils/storage';
import { X, ExternalLink, Volume2 } from 'lucide-react';
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "./tts-toggle";
import { speak } from "@/utils/tts";

// Props 타입 정의
interface SearchHistoryProps {
  onSelect: (word: string) => void;
  currentWord?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 유틸리티 함수들
const getPapagoUrl = (text: string) => 
  `https://papago.naver.com/?sk=ko&tk=ko&hn=0&st=${encodeURIComponent(text)}`;

// 버튼 컴포넌트들
interface SoundButtonProps {
  word: string;
  isEnabled: boolean;
  onSpeak: (word: string, e: React.MouseEvent) => void;
}

const SoundButton = ({ word, isEnabled, onSpeak }: SoundButtonProps) => (
  <button
    onClick={(e) => onSpeak(word, e)}
    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 
      ${isEnabled 
        ? 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' 
        : 'text-gray-400 cursor-not-allowed opacity-50'
      }`}
    title={isEnabled ? "발음 듣기" : "TTS 비활성화됨"}
    disabled={!isEnabled}
  >
    <Volume2 size={16} />
  </button>
);

const TranslateButton = ({ word }: { word: string }) => (
  <a
    href={getPapagoUrl(word)}
    target="_blank"
    rel="noopener noreferrer"
    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    title="Papago에서 번역"
  >
    <ExternalLink size={16} />
  </a>
);

export function SearchHistory({ onSelect, currentWord, isOpen, onOpenChange }: SearchHistoryProps) {
  // 상태 관리
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  const [localTTSEnabled, setLocalTTSEnabled] = useState(ttsEnabled);

  // 이벤트 핸들러
  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (localTTSEnabled) {
      speak(word);
    }
  };

  const handleWordSelect = (word: string) => {
    onSelect(word);
    if (isMobile) onOpenChange(false);
  };

  // 사이드 이펙트 관리
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleWordAnalyzed = () => {
      setHistory(getHistory());
      onOpenChange(true);
    };
    const handleTTSStateChange = (event: CustomEvent<{ enabled: boolean }>) => {
      setLocalTTSEnabled(event.detail.enabled);
    };

    // 초기 상태 설정
    setHistory(getHistory());
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    document.addEventListener('wordAnalyzed', handleWordAnalyzed);
    document.addEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    
    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('wordAnalyzed', handleWordAnalyzed);
      document.removeEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    };
  }, [onOpenChange]);

  useEffect(() => {
    setLocalTTSEnabled(ttsEnabled);
  }, [ttsEnabled]);

  if (history.length === 0) return null;

  return (
    <div className={`
      fixed left-0 transition-all duration-300 ease-in-out z-40
      ${isOpen 
        ? 'opacity-100 ' + (isMobile ? 'top-[80px] bottom-[50%]' : 'top-[60px]') 
        : 'opacity-0 pointer-events-none'
      }
      ${isMobile ? 'w-full' : 'max-w-[300px] ml-4'}
    `}>
      <div className="relative w-full h-full bg-white dark:bg-gray-900 shadow-lg rounded-r-lg border border-l-0 border-gray-200 dark:border-gray-800">
        {isMobile && (
          <>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} className="text-gray-500" />
            </button>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Recent Sentences
              </h3>
            </div>
          </>
        )}
        
        <div className="h-full overflow-y-auto p-2">
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((item) => (
              <div key={item.word} className="flex items-center gap-1">
                <button
                  onClick={() => handleWordSelect(item.word)}
                  className={`
                    flex-1 px-4 py-3 rounded-lg text-sm font-medium text-left
                    transition-colors break-words
                    ${currentWord === item.word
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {item.word}
                </button>
                <SoundButton 
                  word={item.word}
                  isEnabled={localTTSEnabled}
                  onSpeak={handleSpeak}
                />
                <TranslateButton word={item.word} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 