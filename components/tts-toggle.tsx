"use client";

import { Volume2, VolumeX } from "lucide-react";
import { atom, useAtom } from "jotai";

export const ttsEnabledAtom = atom(true);

export default function TTSToggle() {
  const [ttsEnabled, setTtsEnabled] = useAtom(ttsEnabledAtom);

  return (
    <button
      onClick={() => setTtsEnabled(!ttsEnabled)}
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      title={ttsEnabled ? "TTS 끄기" : "TTS 켜기"}
    >
      {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
} 