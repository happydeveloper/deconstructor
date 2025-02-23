export interface Part {
  id: string;
  text: string;
  originalWord: string;
  origin: string;
  meaning: string;
}

export interface Combination {
  id: string;
  text: string;
  definition: string;
  sourceIds: string[];
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
    sourceIds: []
  }]]
}; 