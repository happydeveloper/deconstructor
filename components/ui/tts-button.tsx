"use client";

import { Volume2 } from "lucide-react";
import { TTSButtonProps } from "@/types/tts";

export function TTSButton({ 
  onClick, 
  enabled, 
  size = 16,
  className = "p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
}: TTSButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${className} ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={enabled ? "발음 듣기" : "TTS 비활성화됨"}
      disabled={!enabled}
    >
      <Volume2 size={size} />
    </button>
  );
} 