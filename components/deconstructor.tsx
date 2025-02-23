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
import { z } from "zod";
import { atom, useAtom } from "jotai";
import Spinner from "./spinner";
import { toast } from "sonner";
import { usePlausible } from "next-plausible";
import { useTheme } from "next-themes";
import { ttsEnabledAtom } from "./tts-toggle";
import { addToHistory, getCachedDefinition, cacheDefinition } from "@/utils/storage";
import { SearchHistory } from "./search-history";
import { ExternalLink, History, ChevronUp, ChevronDown, Book } from "lucide-react";
import { defaultDefinition } from '@/types/definition';
import type { Definition } from '@/types/definition';

const isLoadingAtom = atom(false);

const WordChunkNode = ({ data }: { data: { text: string } }) => {
  const [isLoading] = useAtom(isLoadingAtom);
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  
  const speak = () => {
    if (!ttsEnabled) return;
    const utterance = new SpeechSynthesisUtterance(data.text);
    utterance.lang = /[a-zA-Z]/.test(data.text) ? 'en-US' : 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-1000 ${
      isLoading ? "opacity-0 blur-[20px]" : ""
    }`}>
      <div 
        className="text-5xl font-serif mb-1 cursor-pointer transition-colors bg-card rounded-lg px-4 py-2"
        title="클릭하여 발음 듣기"
        onClick={speak}
      >
        <span className="text-card-foreground hover:text-blue-600 dark:hover:text-blue-400">
          {data.text}
        </span>
      </div>
      <div className="w-full h-3 border border-t-0 border-gray-400 dark:border-gray-600" />
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
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  
  const speak = () => {
    if (!ttsEnabled) return;
    const originalUtterance = new SpeechSynthesisUtterance(data.originalWord);
    originalUtterance.lang = /[a-zA-Z]/.test(data.originalWord) ? 'en-US' : 'ko-KR';
    
    const meaningUtterance = new SpeechSynthesisUtterance(data.meaning);
    meaningUtterance.lang = 'ko-KR';
    
    window.speechSynthesis.speak(originalUtterance);
    originalUtterance.onend = () => {
      window.speechSynthesis.speak(meaningUtterance);
    };
  };

  return (
    <div className={`flex flex-col items-stretch transition-all duration-1000 ${
      isLoading ? "opacity-0 blur-[20px]" : ""
    }`}>
      <div className="px-4 py-2 rounded-lg bg-card border border-border min-w-fit max-w-[180px]">
        <div className="flex flex-col items-start">
          <p 
            className="text-lg font-serif mb-1 whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-card-foreground"
            onClick={speak}
            title="클릭하여 발음 듣기"
          >
            {data.originalWord}
          </p>
          <p className="text-xs text-muted-foreground w-full">{data.origin}</p>
          <p 
            className="text-xs text-card-foreground w-full cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => {
              if (!ttsEnabled) return;
              const meaningUtterance = new SpeechSynthesisUtterance(data.meaning);
              meaningUtterance.lang = 'ko-KR';
              window.speechSynthesis.speak(meaningUtterance);
            }}
            title="클릭하여 의미 듣기"
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
  const [ttsEnabled] = useAtom(ttsEnabledAtom);
  
  const speak = () => {
    if (!ttsEnabled) return;
    const textUtterance = new SpeechSynthesisUtterance(data.text);
    textUtterance.lang = /[a-zA-Z]/.test(data.text) ? 'en-US' : 'ko-KR';
    
    const definitionUtterance = new SpeechSynthesisUtterance(data.definition);
    definitionUtterance.lang = 'ko-KR';
    
    window.speechSynthesis.speak(textUtterance);
    textUtterance.onend = () => {
      window.speechSynthesis.speak(definitionUtterance);
    };
  };

  return (
    <div className={`flex flex-col items-stretch transition-all duration-1000`}>
      <div className="px-4 py-2 rounded-lg bg-card border border-border min-w-fit max-w-[250px]">
        <div className="flex flex-col items-start">
          <p 
            className="text-xl font-serif mb-1 whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-card-foreground group"
            onClick={speak}
            title="클릭하여 발음 듣기"
          >
            <span className="group-hover:after:ml-2 group-hover:after:text-sm">
              {data.text}
            </span>
          </p>
          <p 
            className="text-sm text-card-foreground w-full cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => {
              if (!ttsEnabled) return;
              const definitionUtterance = new SpeechSynthesisUtterance(data.definition);
              definitionUtterance.lang = 'ko-KR';
              window.speechSynthesis.speak(definitionUtterance);
            }}
            title="클릭하여 의미 듣기"
          >
            <span className="group-hover:after:ml-2 group-hover:after:text-sm">
              {data.definition}
            </span>
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
      data: { text: part.text },
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
    const y = (layerIndex + 2) * verticalSpacing; // +2 to leave space for word chunks and origins

    layer.forEach((combination) => {
      // Add combination node
      initialNodes.push({
        id: combination.id,
        type: "combined",
        position: { x: 0, y },
        data: {
          text: combination.text,
          definition: combination.definition,
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

function Deconstructor({ word }: { word?: string }) {
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const { theme } = useTheme();
  const [definition, setDefinition] = useState<Definition>(() => {
    const cached = getCachedDefinition("우리가 사랑한 한국어");
    return cached || defaultDefinition;
  });
  const [currentWord, setCurrentWord] = useState<string>('우리가 사랑한 한국어');
  const plausible = usePlausible();
  const [historyOpen, setHistoryOpen] = useState(false);

  const DEFAULT_WORD = "우리가 사랑한 한국어";
  const BOOK_URL = "https://talktomeinkorean.com/product/2023-hanguel-day/";

  const handleWordSubmit = async (word: string) => {
    console.log("handleWordSubmit", word);
    setCurrentWord(word);
    setIsLoading(true);
    
    try {
      // 캐시 확인
      const cached = getCachedDefinition(word);
      if (cached) {
        setDefinition(cached);
        addToHistory(word);
        setIsLoading(false);
        return;
      }

      // API 경로 수정
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const parsed = wordSchema.parse(data);
      
      setDefinition(parsed);
      cacheDefinition(word, parsed);
      addToHistory(word);
      
      // Analytics
      plausible('analyze', {
        props: {
          word,
        },
      });
    } catch (err) {
      toast.error("Failed to analyze word");
      console.error("Failed to analyze word:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!word && currentWord === DEFAULT_WORD) {
      // 이미 기본 단어가 로드되어 있으면 스킵
      return;
    }
    
    async function fetchDefinition() {
      const wordToAnalyze = word || DEFAULT_WORD;
      setIsLoading(true);
      await handleWordSubmit(wordToAnalyze);
      setIsLoading(false);
    }
    fetchDefinition();
  }, [word]);

  const { initialNodes, initialEdges } = useMemo(
    () => createInitialNodes(definition, handleWordSubmit, word),
    [definition, word]
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
        onSelect={handleWordSubmit} 
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

export default function WordDeconstructor({ word }: { word?: string }) {
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
          <Deconstructor word={word} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
