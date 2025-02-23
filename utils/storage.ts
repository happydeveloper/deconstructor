import { Definition } from '@/types/definition';
import { defaultCache, defaultHistory } from './default-data';

// 최근 분석한 문장을 저장하는 타입 정의
export interface SearchHistory {
  word: string;
  timestamp: number;
}

export interface CacheData {
  definition: Definition;
  timestamp: number;
}

const HISTORY_KEY = 'analyzed_sentences';
const CACHE_KEY = 'sentence_cache';
const MAX_HISTORY = 10;
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7일

// 초기화 함수
function initializeStorage() {
  try {
    const existingHistory = localStorage.getItem(HISTORY_KEY);
    const existingCache = localStorage.getItem(CACHE_KEY);

    if (!existingHistory) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(defaultHistory));
    }
    if (!existingCache) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(defaultCache));
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}

// 앱 시작 시 초기화
if (typeof window !== 'undefined') {
  initializeStorage();
}

// 최근 분석 문장 관리
export function addToHistory(word: string) {
  const history = getHistory();
  const newHistory = [
    { word, timestamp: Date.now() },
    ...history.filter(item => item.word !== word)
  ].slice(0, MAX_HISTORY);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  
  // 커스텀 이벤트 발생
  const event = new Event('wordAnalyzed');
  document.dispatchEvent(event);
  
  return newHistory;
}

export function getHistory(): SearchHistory[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || JSON.stringify(defaultHistory));
  } catch {
    return defaultHistory;
  }
}

// 캐시 관리
export function getCachedDefinition(word: string): Definition | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || JSON.stringify(defaultCache));
    const data = cache[word] as CacheData | undefined;
    
    if (data && Date.now() - data.timestamp < CACHE_DURATION) {
      return data.definition;
    }

    // 기본 캐시에서 확인
    const defaultData = defaultCache[word as keyof typeof defaultCache];
    if (defaultData) {
      return defaultData.definition;
    }

    return null;
  } catch {
    // 에러 발생 시 기본 캐시 사용
    const defaultData = defaultCache[word as keyof typeof defaultCache];
    return defaultData?.definition || null;
  }
}

export function cacheDefinition(word: string, definition: Definition) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, CacheData>;
    
    // 캐시 크기 제한 (예: 최대 50개 항목)
    const MAX_CACHE_ITEMS = 50;
    const entries = Object.entries(cache);
    if (entries.length >= MAX_CACHE_ITEMS) {
      // 가장 오래된 항목 제거
      const oldestEntry = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      delete cache[oldestEntry[0]];
    }
    
    cache[word] = {
      definition,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache definition:', error);
  }
} 