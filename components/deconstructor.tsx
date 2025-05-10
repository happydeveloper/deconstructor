"use client";
import {
  ReactFlow,
  Background,
  type Edge,
  Handle,
  type Node,
  Position,
  ReactFlowProvider,
  useReactFlow,
  useNodesInitialized,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState, useMemo } from "react";
import { wordSchema } from "@/utils/schema";
import { atom, useAtom } from "jotai";
import Spinner from "./spinner";
import { toast } from "sonner";
import { usePlausible } from "next-plausible";
import { useTheme } from "next-themes";
import { addToHistory, getCachedDefinition, cacheDefinition } from "@/utils/storage";
import { SearchHistory } from "./search-history";
import { History, ChevronUp, ChevronDown, Book } from "lucide-react";
import { defaultDefinition } from '@/types/definition';
import type { Definition } from '@/types/definition';
import { speak, speakSequentially } from "@/utils/tts";

const isLoadingAtom = atom(false);

const WordChunkNode = ({ data }: { data: { text: string; partOfSpeech?: string } }) => {
  const [isLoading] = useAtom(isLoadingAtom);
  
  // 품사별 스타일 매핑
  const getPartOfSpeechStyle = (partOfSpeech?: string) => {
    const styles = {
      // 한글 품사
      '명사': 'bg-blue-100 dark:bg-blue-900',
      '대명사': 'bg-blue-100 dark:bg-blue-900',
      '수사': 'bg-blue-100 dark:bg-blue-900',
      '동사': 'bg-yellow-100 dark:bg-yellow-900',
      '형용사': 'bg-green-100 dark:bg-green-900',
      '관형사': 'bg-purple-100 dark:bg-purple-900',
      '부사': 'bg-pink-100 dark:bg-pink-900',
      '감탄사': 'bg-red-100 dark:bg-red-900',
      '조사': 'bg-purple-100 dark:bg-purple-900',
      
      // 영어 품사
      'noun': 'bg-blue-100 dark:bg-blue-900',
      'pronoun': 'bg-blue-100 dark:bg-blue-900',
      'verb': 'bg-yellow-100 dark:bg-yellow-900',
      'adjective': 'bg-green-100 dark:bg-green-900',
      'adverb': 'bg-pink-100 dark:bg-pink-900',
      'preposition': 'bg-purple-100 dark:bg-purple-900',
      'conjunction': 'bg-orange-100 dark:bg-orange-900',
      'article': 'bg-gray-100 dark:bg-gray-700',
      'interjection': 'bg-red-100 dark:bg-red-900'
    };
    
    return styles[partOfSpeech as keyof typeof styles] || 'bg-card';
  };

  const handleNodeClick = async () => {
    try {
      await navigator.clipboard.writeText(data.text);
      toast.success('클립보드에 복사되었습니다', {
        description: '이 단어를 분석합니다...'
      });

      const input = document.querySelector('[data-word-input="true"]') as HTMLInputElement;
      const analyzeButton = document.querySelector('[data-analyze-button="true"]') as HTMLButtonElement;
      
      if (input && analyzeButton) {
        input.value = data.text;
        input.focus();
        setTimeout(() => {
          analyzeButton.click();
        }, 100);
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      toast.error('클립보드 복사 실패', {
        description: '하지만 분석은 계속됩니다'
      });
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(data.text);
  };

  const style = getPartOfSpeechStyle(data.partOfSpeech);
  const isKorean = /[가-힣]/.test(data.text);

  return (
    <div className={`flex flex-col items-center transition-all duration-1000 ${
      isLoading ? "opacity-0 blur-[20px]" : ""
    }`}>
      <div 
        className={`rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group ${style}`}
        onClick={handleNodeClick}
        title={`클릭하여 이 단어 분석하기${data.partOfSpeech ? ` (${data.partOfSpeech})` : ''}`}
      >
        <div className="flex flex-col items-center gap-1">
          <span 
            onClick={handleSpeak}
            className={`text-xl cursor-pointer text-card-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
              data.partOfSpeech === 'verb' || data.partOfSpeech === '동사' ? 'font-bold' : ''
            } ${isKorean ? 'font-noto-sans-kr' : 'font-serif'}`}
            title="클릭하여 발음 듣기"
          >
            {data.text}
          </span>
          {data.partOfSpeech && (
            <span className="text-xs text-muted-foreground">
              {data.partOfSpeech}
            </span>
          )}
        </div>
      </div>
      <div className="w-full h-3 border border-t-0 border-gray-400 dark:border-gray-800" />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const OriginNode = ({
  data,
}: {
  data: { originalWord: string; origin: string; meaning: string };
}) => {
  const [isLoading] = useAtom(isLoadingAtom);
  
  const handleNodeClick = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다', {
        description: '이 단어를 분석합니다...'
      });

      const input = document.querySelector('[data-word-input="true"]') as HTMLInputElement;
      const analyzeButton = document.querySelector('[data-analyze-button="true"]') as HTMLButtonElement;
      
      if (input && analyzeButton) {
        input.value = text;
        input.focus();
        setTimeout(() => {
          analyzeButton.click();
        }, 100);
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      toast.error('클립보드 복사 실패', {
        description: '하지만 분석은 계속됩니다'
      });
    }
  };

  const handleSpeak = () => {
    speakSequentially([data.originalWord, data.meaning]);
  };

  return (
    <div className={`flex flex-col items-stretch transition-all duration-1000 ${
      isLoading ? "opacity-0 blur-[20px]" : ""
    }`}>
      <div 
        className="px-4 py-2 rounded-lg bg-card border border-border min-w-fit max-w-[180px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => handleNodeClick(data.originalWord)}
        title="클릭하여 이 단어 분석하기"
      >
        <div className="flex flex-col items-start">
          <p 
            className="text-lg font-serif mb-1 whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-card-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            title="클릭하여 발음 듣기"
          >
            {data.originalWord}
          </p>
          <p 
            className="text-xs text-muted-foreground w-full cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(data.origin);
            }}
            title="클릭하여 이 단어 분석하기"
          >
            {data.origin}
          </p>
          <p 
            className="text-xs text-card-foreground w-full cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(data.meaning);
            }}
            title="클릭하여 이 단어 분석하기"
          >
            {data.meaning}
          </p>
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const CombinedNode = ({
  data,
}: {
  data: { text: string; definition: string };
}) => {
  
  const handleNodeClick = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다', {
        description: '이 단어를 분석합니다...'
      });

      const input = document.querySelector('[data-word-input="true"]') as HTMLInputElement;
      const analyzeButton = document.querySelector('[data-analyze-button="true"]') as HTMLButtonElement;
      
      if (input && analyzeButton) {
        input.value = text;
        input.focus();
        setTimeout(() => {
          analyzeButton.click();
        }, 100);
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      toast.error('클립보드 복사 실패', {
        description: '하지만 분석은 계속됩니다'
      });
    }
  };

  const handleSpeak = () => {
    speakSequentially([data.text, data.definition]);
  };

  return (
    <div className="flex flex-col items-stretch transition-all duration-1000">
      <div 
        className="px-4 py-2 rounded-lg bg-card border border-border min-w-fit max-w-[250px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => handleNodeClick(data.text)}
        title="클릭하여 이 단어 분석하기"
      >
        <div className="flex flex-col items-start">
          <p 
            className="text-xl font-serif mb-1 whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-card-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            title="클릭하여 발음 듣기"
          >
            {data.text}
          </p>
          <p 
            className="text-sm text-card-foreground w-full cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(data.definition);
            }}
            title="클릭하여 이 단어 분석하기"
          >
            {data.definition}
          </p>
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const InputNode = ({
  data,
}: {
  data: { onSubmit: (word: string) => Promise<void>; initialWord?: string };
}) => {
  const [word, setWord] = useState(data.initialWord || "");
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setIsLoading(true);
    await Promise.all([
      data.onSubmit(word),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsLoading(false);
  };

  return (
    <form
      className="px-6 py-4 rounded-xl bg-card border border-border shadow-xl flex gap-3"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="단어를 입력하세요..."
        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`w-[100px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors flex items-center justify-center ${
          isLoading ? "cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? <Spinner /> : "분석하기"}
      </button>
    </form>
  );
};

const wordChunkPadding = 3;
const originPadding = 10;
const verticalSpacing = 50;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const newNodes: Node[] = [];
  console.log("layouting nodes", nodes);

  const inputNode = nodes.find((node) => node.type === "inputNode");
  const inputWidth = inputNode?.measured?.width ?? 0;
  const inputHeight = inputNode?.measured?.height ?? 0;
  let nextY = inputHeight + verticalSpacing;

  if (inputNode) {
    newNodes.push({
      ...inputNode,
      position: { x: -inputWidth / 2, y: 0 },
    });
  }

  let totalWordChunkWidth = 0;

  // First pass: measure word chunks
  nodes.forEach((node) => {
    if (node.type === "wordChunk") {
      totalWordChunkWidth += (node.measured?.width ?? 0) + wordChunkPadding;
    }
  });

  // Position word chunks
  let lastWordChunkX = 0;
  nodes.forEach((node) => {
    if (node.type === "wordChunk") {
      newNodes.push({
        ...node,
        position: {
          x: -totalWordChunkWidth / 2 + lastWordChunkX,
          y: nextY,
        },
      });
      lastWordChunkX += (node.measured?.width ?? 0) + wordChunkPadding;
    }
  });

  nextY +=
    verticalSpacing +
    (nodes.find((node) => node.type === "wordChunk")?.measured?.height ?? 0);

  // Position origins
  let totalOriginWidth = 0;
  nodes.forEach((node) => {
    if (node.type === "origin") {
      totalOriginWidth += (node.measured?.width ?? 0) + originPadding;
    }
  });

  let lastOriginX = 0;
  nodes.forEach((node) => {
    if (node.type === "origin") {
      newNodes.push({
        ...node,
        position: {
          x: -totalOriginWidth / 2 + lastOriginX,
          y: nextY,
        },
      });
      lastOriginX += (node.measured?.width ?? 0) + originPadding;
    }
  });

  nextY +=
    verticalSpacing +
    Math.max(
      ...nodes
        .filter((node) => node.type === "origin")
        .map((node) => node.measured?.height ?? 0)
    );

  // Position combinations by layer
  const combinationsByY = new Map<number, Node[]>();
  nodes.forEach((node) => {
    if (node.type === "combined") {
      const layer = node.position.y / verticalSpacing - 2; // Convert y back to layer number
      if (!combinationsByY.has(layer)) {
        combinationsByY.set(layer, []);
      }
      combinationsByY.get(layer)!.push(node);
    }
  });

  // Layout each layer of combinations
  const sortedLayers = Array.from(combinationsByY.keys()).sort((a, b) => a - b);
  sortedLayers.forEach((layer) => {
    const layerNodes = combinationsByY.get(layer)!;
    let totalWidth = 0;
    layerNodes.forEach((node) => {
      totalWidth += (node.measured?.width ?? 0) + originPadding;
    });

    let lastX = 0;
    layerNodes.forEach((node) => {
      newNodes.push({
        ...node,
        position: {
          x: -totalWidth / 2 + lastX,
          y: nextY,
        },
      });
      lastX += (node.measured?.width ?? 0) + originPadding;
    });
    nextY +=
      verticalSpacing +
      Math.max(...layerNodes.map((node) => node.measured?.height ?? 0));
  });

  return { nodes: newNodes, edges };
}

function createInitialNodes(
  definition: Definition,
  handleWordSubmit: (word: string) => void,
  initialWord?: string
) {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  initialNodes.push({
    id: "input1",
    type: "inputNode",
    position: { x: 0, y: 0 },
    data: { onSubmit: handleWordSubmit, initialWord },
  });

  // Add word parts and their origins
  definition.parts.forEach((part) => {
    // Word chunk node
    initialNodes.push({
      id: part.id,
      type: "wordChunk",
      position: { x: 0, y: 0 },
      data: { 
        text: part.text,
        partOfSpeech: part.partOfSpeech 
      },
    });

    // Origin node - position relative to word chunk width
    const originId = `origin-${part.id}`;
    initialNodes.push({
      id: originId,
      type: "origin",
      position: { x: 0, y: 0 },
      data: {
        originalWord: part.originalWord,
        origin: part.origin,
        meaning: part.meaning,
      },
    });

    // Connect word part to origin
    initialEdges.push({
      id: `edge-${part.id}-${originId}`,
      source: part.id,
      target: originId,
      type: "straight",
      style: { 
        stroke: "#4B5563", 
        strokeWidth: 1 
      },
      animated: true,
    });
  });

  // Add combinations layer by layer
  definition.combinations.forEach((layer, layerIndex) => {
    const y = (layerIndex + 2) * verticalSpacing;

    layer.forEach((combination) => {
      // Add combination node
      initialNodes.push({
        id: combination.id,
        type: "combined",
        position: { x: 0, y },
        data: {
          text: combination.text,
          definition: combination.definition,
          partOfSpeech: combination.partOfSpeech
        },
      });

      // Add edges from all sources
      combination.sourceIds.forEach((sourceId) => {
        // If source is a word part, connect from its origin node
        const isPart = definition.parts.find((p) => p.id === sourceId);
        const actualSourceId = isPart ? `origin-${sourceId}` : sourceId;

        initialEdges.push({
          id: `edge-${actualSourceId}-${combination.id}`,
          source: actualSourceId,
          target: combination.id,
          type: "straight",
          style: { 
            stroke: "#4B5563", 
            strokeWidth: 1 
          },
          animated: true,
        });
      });
    });
  });

  return { initialNodes, initialEdges };
}

const nodeTypes = {
  wordChunk: WordChunkNode,
  origin: OriginNode,
  combined: CombinedNode,
  inputNode: InputNode,
};

interface DeconstructorProps {
  initialWord?: string;
  onWordChange?: (word: string) => void;
}

function Deconstructor({ initialWord, onWordChange }: DeconstructorProps) {
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const { theme } = useTheme();
  const [definition, setDefinition] = useState<Definition>(() => {
    const cached = getCachedDefinition("우리가 사랑한 한국어");
    return cached || defaultDefinition;
  });
  const [currentWord, setCurrentWord] = useState<string>(initialWord || "우리가 사랑한 한국어");
  const plausible = usePlausible();
  const [historyOpen, setHistoryOpen] = useState(false);

  const BOOK_URL = "https://talktomeinkorean.com/product/2023-hanguel-day/";

  // URL을 통한 초기 분석 처리
  useEffect(() => {
    if (initialWord) {
      setCurrentWord(initialWord);
      handleAnalyze(initialWord);
    }
  }, [initialWord]);

  // 단어가 변경될 때마다 URL 업데이트
  const handleWordChange = (word: string) => {
    setCurrentWord(word);
    onWordChange?.(word);
  };

  // 분석 함수 수정
  const handleAnalyze = async (wordToAnalyze?: string) => {
    const wordToUse = wordToAnalyze || currentWord;
    if (!wordToUse.trim()) {
      toast.error("분석할 단어를 입력해주세요");
      return;
    }

    handleWordChange(wordToUse); // URL 업데이트
    setIsLoading(true);

    try {
      // 캐시 확인
      const cached = getCachedDefinition(wordToUse);
      if (cached) {
        setDefinition(cached);
        addToHistory(wordToUse);
        setIsLoading(false);
        return;
      }

      // API 경로 수정
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: wordToUse }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const parsed = wordSchema.parse(data);
      
      setDefinition(parsed);
      cacheDefinition(wordToUse, parsed);
      addToHistory(wordToUse);
      
      // Analytics
      plausible('analyze', {
        props: {
          word: wordToUse,
        },
      });
    } catch (err) {
      toast.error("Failed to analyze word");
      console.error("Failed to analyze word:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { initialNodes, initialEdges } = useMemo(
    () => createInitialNodes(definition, handleAnalyze, initialWord),
    [definition, initialWord]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized({ includeHiddenNodes: false });

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  useEffect(() => {
    console.log("nodesInitialized", nodesInitialized);
    if (nodesInitialized) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [nodesInitialized]);

  useEffect(() => {
    console.log("detected nodes change", nodes);
    fitView({
      duration: 1000,
    });
  }, [nodes]);

  console.log(nodes);

  return (
    <div className={`h-screen bg-background text-foreground transition-colors duration-300 ${
      isLoading ? "opacity-50" : ""
    }`}>
      <div className="fixed top-5 left-0 z-50 flex flex-col gap-2">
        <div 
          className="transition-all duration-300 transform -translate-x-[calc(100%-32px)] hover:translate-x-0 group"
        >
          <a
            href={BOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between pl-4 pr-2 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-r-lg shadow-lg border border-l-0 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[32px]"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              우리가 사랑한 한국어 단어들
            </span>
            <Book size={16} className="text-blue-500 dark:text-blue-400 shrink-0 min-w-[16px]" />
          </a>
        </div>

        <div 
          className="transition-all duration-300 transform -translate-x-[calc(100%-32px)] hover:translate-x-0 group"
        >
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center justify-between pl-4 pr-2 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-r-lg shadow-lg border border-l-0 border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full min-w-[32px]"
          >
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Recent Sentences
            </span>
            <div className="flex items-center gap-1">
              {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <History size={16} className="text-blue-500 dark:text-blue-400 shrink-0 min-w-[16px]" />
            </div>
          </button>
        </div>
      </div>

      <SearchHistory 
        onSelect={handleAnalyze} 
        currentWord={currentWord}
        isOpen={historyOpen}
        onOpenChange={setHistoryOpen}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        className="bg-background h-[calc(100vh-6rem)]"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color={theme === "dark" ? "#333" : theme === "light" ? "#999" : "#668"} 
          className="transition-colors duration-300"
        />
      </ReactFlow>
    </div>
  );
}

export default function WordDeconstructor({ initialWord }: DeconstructorProps) {
  const [isLoading] = useAtom(isLoadingAtom);

  return (
    <div
      className="h-screen bg-gray-900 text-gray-100"
      style={
        { "--loading-state": isLoading ? "1" : "0" } as React.CSSProperties
      }
    >
      <div className="h-full w-full">
        <ReactFlowProvider>
          <Deconstructor initialWord={initialWord} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
