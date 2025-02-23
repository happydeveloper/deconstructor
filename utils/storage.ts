import { Definition } from '@/types/definition';

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
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24시간

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
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

// 캐시 관리
export function getCachedDefinition(word: string): Definition | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const data = cache[word] as CacheData | undefined;
    
    if (data && Date.now() - data.timestamp < CACHE_DURATION) {
      return data.definition;
    }
    return null;
  } catch {
    return null;
  }
}

export function cacheDefinition(word: string, definition: Definition) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[word] = {
      definition,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache definition:', error);
  }
} 