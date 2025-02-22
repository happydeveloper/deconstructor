export interface WordChunkData {
  text: string;
}

export interface OriginData {
  originalWord: string;
  origin: string;
  meaning: string;
}

export interface CombinedData {
  text: string;
  definition: string;
}

export interface InputData {
  onSubmit: (word: string) => Promise<void>;
  initialWord?: string;
} 