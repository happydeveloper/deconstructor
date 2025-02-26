"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAtom } from "jotai";
import { atomWithStorage } from 'jotai/utils';

// 단순화된 atom 정의
export const ttsEnabledAtom = atomWithStorage<boolean>('ttsEnabled', true);

export default function TTSToggle() {
  const [ttsEnabled, setTtsEnabled] = useAtom(ttsEnabledAtom);

  const handleToggle = () => {
    if (ttsEnabled) {
      window.speechSynthesis.cancel();
      if (window._currentAudio) {
        window._currentAudio.pause();
        URL.revokeObjectURL(window._currentAudio.src);
        window._currentAudio = null;
      }
    }
    setTtsEnabled(!ttsEnabled);
    console.log('TTS 상태 변경:', !ttsEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      title={ttsEnabled ? "TTS 끄기" : "TTS 켜기"}
    >
      {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
} 