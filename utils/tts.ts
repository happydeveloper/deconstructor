import { toast } from 'sonner';
import { ttsEnabledAtom } from '@/components/tts-toggle';
import { getDefaultStore } from 'jotai';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 14; // 2주

// 언어별 음성 ID 설정
const VOICE_IDS = {
  ko: "TxGEqnHWrfWFTfGW9XjX",  // 한국어 여성 음성 (더 자연스러운 음성으로 변경)
  en: "EXAVITQu4vr4xnSDxMaL"   // 영어 음성 (Rachel)
};

// 오디오 캐시 인터페이스
interface AudioCache {
  blob: Blob;
  timestamp: number;
}

// 캐시 저장소
const audioCache = new Map<string, AudioCache>();

// 캐시 키 생성
function getCacheKey(text: string, lang: string): string {
  return `tts:${lang}:${text}`;
}

// 캐시 정리 함수
function cleanupCache() {
  const now = Date.now();
  for (const [key, cache] of audioCache.entries()) {
    if (now - cache.timestamp > CACHE_DURATION) {
      audioCache.delete(key);
    }
  }
}

// 오디오 재생 함수
async function playAudio(audioBlob: Blob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  
  if (window._currentAudio) {
    window._currentAudio.pause();
    URL.revokeObjectURL(window._currentAudio.src);
  }
  
  const audio = new Audio(audioUrl);
  window._currentAudio = audio;
  await audio.play();

  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
    window._currentAudio = null;
  };
}

// 텍스트에서 언어 비율 계산
function getLanguageRatio(text: string): { ko: number; en: number } {
  const koreanChars = text.match(/[가-힣]/g)?.length || 0;
  const englishChars = text.match(/[a-zA-Z]/g)?.length || 0;
  const total = koreanChars + englishChars;
  
  if (total === 0) return { ko: 0.5, en: 0.5 };
  
  return {
    ko: koreanChars / total,
    en: englishChars / total
  };
}

// 언어 감지 함수 수정 - 한글이 있으면 무조건 한국어로 처리
export function detectLanguage(text: string): "ko" | "en" {
  return /[가-힣]/.test(text) ? "ko" : "en";
}

// 통합 TTS 함수
export async function speak(text: string, lang?: string) {
  const store = getDefaultStore();
  const ttsEnabled = store.get(ttsEnabledAtom);

  if (!ttsEnabled) {
    console.log('TTS가 비활성화되어 있어 실행되지 않음');
    return;
  }

  if (ELEVENLABS_API_KEY) {
    await speakWithElevenLabs(text);
  } else {
    speakWithBrowser(text, lang);
  }
}

// 브라우저 TTS
function speakWithBrowser(text: string, lang?: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || (/[a-zA-Z]/.test(text) ? 'en-US' : 'ko-KR');
  window.speechSynthesis.speak(utterance);
}

// ElevenLabs TTS
async function speakWithElevenLabs(text: string) {
  try {
    const detectedLang = /[가-힣]/.test(text) ? "ko" : "en";
    const voiceId = detectedLang === "ko" 
      ? "TxGEqnHWrfWFTfGW9XjX"
      : "EXAVITQu4vr4xnSDxMaL";

    const cacheKey = getCacheKey(text, detectedLang);
    
    // 캐시 확인
    const cached = audioCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      await playAudio(cached.blob);
      return;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: detectedLang === "ko" ? 0.35 : 0.7,
            similarity_boost: detectedLang === "ko" ? 0.85 : 0.7,
            style: detectedLang === "ko" ? 0.65 : 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    
    // 캐시 저장
    audioCache.set(cacheKey, {
      blob: audioBlob,
      timestamp: Date.now()
    });

    // 캐시 크기가 100개를 넘으면 오래된 항목 정리
    if (audioCache.size > 100) {
      cleanupCache();
    }

    await playAudio(audioBlob);

  } catch (error) {
    console.error('ElevenLabs TTS 실패, 브라우저 TTS로 대체:', error);
    speakWithBrowser(text);
  }
}

// 연속 재생 함수
export async function speakSequentially(texts: string[], langs?: string[]) {
  const store = getDefaultStore();
  const ttsEnabled = store.get(ttsEnabledAtom);

  if (!ttsEnabled) return;

  // ElevenLabs API가 있으면 텍스트를 합쳐서 한 번에 재생
  if (ELEVENLABS_API_KEY) {
    const combinedText = texts.join('. ');
    await speak(combinedText);
    return;
  }

  // 브라우저 TTS로 순차 재생
  let currentIndex = 0;
  
  const speakNext = () => {
    if (currentIndex >= texts.length) return;
    
    const utterance = new SpeechSynthesisUtterance(texts[currentIndex]);
    utterance.lang = langs?.[currentIndex] || (/[a-zA-Z]/.test(texts[currentIndex]) ? 'en-US' : 'ko-KR');
    utterance.onend = () => {
      currentIndex++;
      speakNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
}

// 전역 타입 선언
declare global {
  interface Window {
    _currentAudio: HTMLAudioElement | null;
  }
} 