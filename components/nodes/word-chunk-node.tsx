"use client";

import { Handle, Position } from "@xyflow/react";
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "../tts-toggle";
import { speak } from "@/utils/tts";
import { TTSButton } from "../ui/tts-button";

interface WordChunkNodeProps {
  data: { text: string };
}

export function WordChunkNode({ data }: WordChunkNodeProps) {
  const [ttsEnabled] = useAtom(ttsEnabledAtom);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ttsEnabled) return;
    speak(data.text);
  };

  return (
    <div className="flex flex-col items-center transition-all duration-1000">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {data.text}
          </span>
          <TTSButton onClick={handleSpeak} enabled={ttsEnabled} />
        </div>
      </div>
      <div className="w-full h-3 border border-t-0 border-gray-400 dark:border-gray-800" />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
} 