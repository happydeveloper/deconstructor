import { toast } from 'sonner';
import { ttsEnabledAtom } from '@/components/tts-toggle';
import { getDefaultStore } from 'jotai';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7일

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

// 캐시 키 생성 함수
function getCacheKey(text: string, voiceId: string): string {
  return `${voiceId}:${text}`;
}

// 캐시된 오디오 재생 함수
async function playAudio(audioBlob: Blob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  // 이전 오디오 정리
  if (window._currentAudio) {
    window._currentAudio.pause();
    URL.revokeObjectURL(window._currentAudio.src);
  }
  
  window._currentAudio = audio;
  await audio.play();

  // 메모리 정리
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

export function speak(text: string, lang?: string) {
  const store = getDefaultStore();
  const ttsEnabled = store.get(ttsEnabledAtom);

  if (!ttsEnabled) {
    console.log('TTS가 비활성화되어 있어 실행되지 않음');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || (/[a-zA-Z]/.test(text) ? 'en-US' : 'ko-KR');
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function speakSequentially(texts: string[], langs?: string[]) {
  const store = getDefaultStore();
  const ttsEnabled = store.get(ttsEnabledAtom);

  if (!ttsEnabled) return;

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

export async function speakWithElevenLabs(text: string) {
  // TTS 활성화 상태 확인
  const store = getDefaultStore();
  const ttsEnabled = store.get(ttsEnabledAtom);
  
  if (!ttsEnabled) {
    console.log('TTS가 비활성화되어 있어 실행되지 않음');
    return;
  }

  // 현재 재생 중인 오디오가 있으면 중지
  if (window._currentAudio) {
    window._currentAudio.pause();
    URL.revokeObjectURL(window._currentAudio.src);
    window._currentAudio = null;
  }

  if (!ELEVENLABS_API_KEY) {
    toast.error('ElevenLabs API 키가 설정되지 않았습니다.', {
      description: 'API 키를 .env.local 파일에 설정해주세요.',
      duration: 3000,
    });
    return;
  }

  try {
    const detectedLang = detectLanguage(text);
    const voiceId = VOICE_IDS[detectedLang];
    const cacheKey = getCacheKey(text, voiceId);

    // 캐시 확인
    const cached = audioCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      await playAudio(cached.blob);
      return;
    }

    // 한국어 음성을 위한 최적화된 설정
    const voiceSettings = {
      stability: detectedLang === "ko" ? 0.35 : 0.7,
      similarity_boost: detectedLang === "ko" ? 0.85 : 0.7,
      style: detectedLang === "ko" ? 0.65 : 0.5,
      use_speaker_boost: true
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings
        })
      }
    );

    if (!response.ok) {
      toast.error('음성 생성에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 3000,
      });
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    
    // 캐시 저장
    audioCache.set(cacheKey, {
      blob: audioBlob,
      timestamp: Date.now()
    });

    // 캐시 크기 제한 (최대 50개)
    if (audioCache.size > 50) {
      const oldestKey = Array.from(audioCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      audioCache.delete(oldestKey);
    }

    await playAudio(audioBlob);

  } catch (error) {
    console.error('Error generating speech:', error);
    toast.error('음성 생성 중 오류가 발생했습니다.', {
      description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      duration: 3000,
    });
  }
}

// 전역 타입 선언
declare global {
  interface Window {
    _currentAudio: HTMLAudioElement | null;
  }
} 