"use client";

import { Handle, Position } from "@xyflow/react";
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "../tts-toggle";
import { speak } from "@/utils/tts";
import { Volume2 } from "lucide-react";

interface WordChunkNodeProps {
  data: { text: string };
}

export function WordChunkNode({ data }: WordChunkNodeProps) {
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  
  const handleSpeak = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            title="발음 듣기"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>
      <div className="w-full h-3 border border-t-0 border-gray-400 dark:border-gray-800" />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
} 