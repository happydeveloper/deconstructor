export interface Part {
  id: string;
  text: string;
  originalWord: string;
  origin: string;
  meaning: string;
  partOfSpeech: string;
}

export interface Combination {
  id: string;
  text: string;
  definition: string;
  sourceIds: string[];
  partOfSpeech: string;
}

export interface Definition {
  thought: string;
  parts: Part[];
  combinations: Combination[][];
}

export const defaultDefinition: Definition = {
  thought: "",
  parts: [],
  combinations: [[{
    id: "default",
    text: "",
    definition: "",
    sourceIds: [],
    partOfSpeech: "noun"
  }]]
}; 