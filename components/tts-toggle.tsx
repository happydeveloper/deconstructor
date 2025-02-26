"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAtom } from "jotai";
import { atomWithStorage } from 'jotai/utils';

// 클라이언트 사이드 이벤트 타입 정의
interface TTSToggleEvent extends CustomEvent {
  detail: { enabled: boolean };
}

// 전역 상태 atom 정의
export const ttsEnabledAtom = atomWithStorage<boolean>('ttsEnabled', true);

interface TTSToggleButtonProps {
  enabled: boolean;
  onClick: () => void;
}

function TTSToggleButton({ enabled, onClick }: TTSToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      title={enabled ? "TTS 끄기" : "TTS 켜기"}
    >
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

export default function TTSToggle() {
  const [ttsEnabled, setTtsEnabled] = useAtom(ttsEnabledAtom);

  const handleToggle = () => {
    const newState = !ttsEnabled;
    
    // TTS 상태 업데이트
    setTtsEnabled(newState);

    // 브라우저 TTS 중지
    if (!newState) {
      window.speechSynthesis.cancel();
      if (window._currentAudio) {
        window._currentAudio.pause();
        URL.revokeObjectURL(window._currentAudio.src);
        window._currentAudio = null;
      }
    }

    // 커스텀 이벤트 발생
    document.dispatchEvent(new CustomEvent('ttsStateChange', {
      detail: { enabled: newState }
    }));
  };

  return <TTSToggleButton enabled={ttsEnabled} onClick={handleToggle} />;
} 