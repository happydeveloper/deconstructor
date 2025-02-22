"use client";

import { Handle, Position } from "@xyflow/react";
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "../tts-toggle";
import { speakSequentially } from "@/utils/tts";
import { Volume2 } from "lucide-react";

interface CombinedNodeProps {
  data: { 
    text: string; 
    definition: string;
  };
}

export function CombinedNode({ data }: CombinedNodeProps) {
  const [ttsEnabled] = useAtom(ttsEnabledAtom);

  const handleSpeak = () => {
    if (!ttsEnabled) return;
    speakSequentially([data.text, data.definition]);
  };

  return (
    <div className="flex flex-col items-stretch transition-all duration-1000">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-2">
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
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.definition}
        </p>
      </div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
} 