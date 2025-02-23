import { Definition } from '@/types/definition';

export interface CacheData {
  definition: Definition;
  timestamp: number;
}

export const defaultHistory = [
  { word: "TTMIK 세요", timestamp: 1740279036274 },
  { word: "우리가 사랑한 한국어 단어, 109", timestamp: 1740278287030 },
  { word: "우리가 사랑한 한국어", timestamp: 1740278157700 },
  { word: "TTMIK Seyo", timestamp: 1740277994038 },
  { word: "TTMIK Stories", timestamp: 1740277992868 },
  { word: "TTMIK 코스", timestamp: 1740277992302 },
  { word: "Our Beloved Korean Words, 109", timestamp: 1740277991452 },
  { word: "TTMIK 책", timestamp: 1740277990134 },
  { word: "TTMIK Books", timestamp: 1740277989367 },
  { word: "TTMIK", timestamp: 1740277988199 }
];

export const defaultCache: Record<string, CacheData> = {
  "우리가 사랑한 한국어": {
    definition: {
      thought: "The phrase '우리가 사랑한 한국어' translates to 'The Korean language that we love'.",
      parts: [
        { id: "u", text: "우리", originalWord: "우리", origin: "Korean", meaning: "we" },
        { id: "ga", text: "가", originalWord: "가", origin: "Korean", meaning: "subject marker" },
        { id: "saranghan", text: "사랑한", originalWord: "사랑한", origin: "Korean", meaning: "loved" },
        { id: "hangu", text: "한국", originalWord: "한국", origin: "Korean", meaning: "Korea" },
        { id: "geo", text: "어", originalWord: "어", origin: "Korean", meaning: "language" }
      ],
      combinations: [
        [{ id: "uri", text: "우리", definition: "We", sourceIds: ["u"] }],
        [{ id: "uriga", text: "우리가", definition: "We who love", sourceIds: ["uri", "ga"] }],
        [{ id: "hangugeo", text: "한국어", definition: "Korean language", sourceIds: ["hangu", "geo"] }],
        [{ id: "final", text: "우리가 사랑한 한국어", definition: "Korean language that we love", sourceIds: ["uriga", "hangugeo"] }]
      ]
    },
    timestamp: Date.now()
  },
  "TTMIK": {
    definition: {
      thought: "TTMIK is an initialism for the phrase 'Talk To Me In Korean'. It is a popular online resource for learning the Korean language.",
      parts: [
        { id: "tt", text: "TT", originalWord: "Talk To", origin: "English Acronym", meaning: "Talk To" },
        { id: "mi", text: "MI", originalWord: "Me In", origin: "English Acronym", meaning: "Me In" },
        { id: "k", text: "K", originalWord: "Korean", origin: "English Acronym", meaning: "Korean" }
      ],
      combinations: [
        [{ id: "talktomeinkorean", text: "TTMIK", definition: "Talk To Me In Korean", sourceIds: ["tt", "mi", "k"] }]
      ]
    },
    timestamp: 1740276636900
  },
  "안녕하세요": {
    definition: {
      thought: "안녕하세요 is a common greeting in Korean. It is a combination of 안녕 (an-nyeong) which means peace and 하세요 (ha-se-yo) which means please do.",
      parts: [
        { id: "an1", text: "안", originalWord: "안", origin: "Korean", meaning: "Peace" },
        { id: "nyeong1", text: "녕", originalWord: "녕", origin: "Korean", meaning: "Comfort, well-being" },
        { id: "haseyo1", text: "하세요", originalWord: "하세요", origin: "Korean", meaning: "Do you do?" }
      ],
      combinations: [
        [{ id: "an", text: "안", definition: "Peace", sourceIds: ["an1"] },
         { id: "nyeong", text: "녕", definition: "Comfort, well-being", sourceIds: ["nyeong1"] }],
        [{ id: "anyeong", text: "안녕", definition: "To be at peace?", sourceIds: ["an", "nyeong"] }],
        [{ id: "haseyo", text: "하세요", definition: "Are you at peace?", sourceIds: ["haseyo1"] }],
        [{ id: "final", text: "안녕하세요", definition: "Hello, are you at peace?", sourceIds: ["anyeong", "haseyo"] }]
      ]
    },
    timestamp: 1740276651433
  },
  "우리가 사랑한 한국어 단어, 109": {
    definition: {
      thought: "The phrase translates to 'Korean words we loved, 109'.",
      parts: [
        { id: "u", text: "우리", originalWord: "우리", origin: "Korean", meaning: "we" },
        { id: "ga_part", text: "가", originalWord: "가", origin: "Korean", meaning: "subject marker" },
        { id: "sarang_part", text: "사랑", originalWord: "사랑", origin: "Korean", meaning: "love" },
        { id: "han_part", text: "한", originalWord: "한", origin: "Korean", meaning: "past tense marker" },
        { id: "hangugeo_part", text: "한국어", originalWord: "한국어", origin: "Korean", meaning: "Korean language" },
        { id: "daneo_part", text: "단어", originalWord: "단어", origin: "Korean", meaning: "word" },
        { id: "num_part", text: "109", originalWord: "109", origin: "Numeral", meaning: "one hundred and nine" }
      ],
      combinations: [
        [{ id: "uri", text: "우리", definition: "we", sourceIds: ["u"] }],
        [{ id: "final", text: "우리가 사랑한 한국어 단어, 109", definition: "Korean words we loved, 109", sourceIds: ["uri"] }]
      ]
    },
    timestamp: 1740278287030
  }
}; 