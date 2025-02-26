"use client";

import { useEffect, useState } from 'react';
import { getHistory, type SearchHistory } from '@/utils/storage';
import { History, ChevronDown, ChevronUp, X, ExternalLink, Volume2 } from 'lucide-react';
import { speakWithElevenLabs } from '@/utils/tts';
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "./tts-toggle";
import { speak } from "@/utils/tts";

interface SearchHistoryProps {
  onSelect: (word: string) => void;
  currentWord?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Papago URL 생성 함수
const getPapagoUrl = (text: string) => {
  return `https://papago.naver.com/?sk=ko&tk=ko&hn=0&st=${encodeURIComponent(text)}`;
};

export function SearchHistory({ onSelect, currentWord, isOpen, onOpenChange }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  const [localTTSEnabled, setLocalTTSEnabled] = useState(ttsEnabled);

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
    
    // TTS 상태 변경 이벤트 리스너
    const handleTTSStateChange = (event: CustomEvent<{ enabled: boolean }>) => {
      setLocalTTSEnabled(event.detail.enabled);
    };

    document.addEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('wordAnalyzed', handleWordAnalyzed);
      document.removeEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    };
  }, [onOpenChange]);

  useEffect(() => {
    setLocalTTSEnabled(ttsEnabled);
  }, [ttsEnabled]);

  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (localTTSEnabled) {
      speak(word);
    }
  };

  // 사운드 버튼 렌더링 함수
  const renderSoundButton = (word: string) => (
    <button
      onClick={(e) => handleSpeak(word, e)}
      className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 
        ${localTTSEnabled 
          ? 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' 
          : 'text-gray-400 cursor-not-allowed opacity-50'
        }`}
      title={localTTSEnabled ? "발음 듣기" : "TTS 비활성화됨"}
      disabled={!localTTSEnabled}
    >
      <Volume2 size={16} />
    </button>
  );

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
              <div key={item.word} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onSelect(item.word);
                    if (isMobile) onOpenChange(false);
                  }}
                  className={`
                    flex-1 px-4 py-3 rounded-lg text-sm font-medium text-left
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
                {renderSoundButton(item.word)}
                <a
                  href={getPapagoUrl(item.word)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Papago에서 번역"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 