"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAtom } from "jotai";
import { atomWithStorage } from 'jotai/utils';


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
    setTtsEnabled(newState);

    if (!newState && window._currentAudio) {
      window._currentAudio.pause();
      URL.revokeObjectURL(window._currentAudio.src);
      window._currentAudio = null;
    }

    document.dispatchEvent(new CustomEvent('ttsStateChange', {
      detail: { enabled: newState }
    }));
  };

  return <TTSToggleButton enabled={ttsEnabled} onClick={handleToggle} />;
} 