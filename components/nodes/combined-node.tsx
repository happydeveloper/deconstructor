"use client";

import { Handle, Position } from "@xyflow/react";
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "../tts-toggle";
import { speak, speakSequentially } from "@/utils/tts";
import { TTSButton } from "../ui/tts-button";

interface NodeData {
  text: string;
  definition: string;
}

interface TextProps {
  text: string;
  className?: string;
  onClick: (e: React.MouseEvent) => void;
  title: string;
}

function Text({ text, className = "", onClick, title }: TextProps) {
  return (
    <p 
      onClick={onClick}
      className={`cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-card-foreground ${className}`}
      title={title}
    >
      {text}
    </p>
  );
}

export function CombinedNode({ data }: { data: NodeData }) {
  const [ttsEnabled] = useAtom(ttsEnabledAtom);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ttsEnabled) return;
    speakSequentially([data.text, data.definition]);
  };

  const handleDefinitionSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ttsEnabled) return;
    speak(data.definition);
  };

  return (
    <div className="flex flex-col items-stretch">
      <div className="px-4 py-2 rounded-lg bg-card border border-border max-w-[250px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Text
              text={data.text}
              className="text-xl font-serif"
              onClick={handleSpeak}
              title="클릭하여 전체 발음 듣기"
            />
            <TTSButton 
              onClick={handleDefinitionSpeak}
              enabled={ttsEnabled}
            />
          </div>
          <Text
            text={data.definition}
            className="text-sm"
            onClick={handleDefinitionSpeak}
            title="클릭하여 정의 듣기"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
} 