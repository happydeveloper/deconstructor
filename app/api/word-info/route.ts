import { NextResponse } from 'next/server';

interface WordInfo {
  word: string;
  definition: string;
  examples: string[];
  related: string[];
}

interface ApiResponse {
  status: number;
  data: WordInfo;
  error?: string;
}

interface DictionaryDefinition {
  definition: string;
  example?: string;
}

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

interface DictionaryEntry {
  word: string;
  meanings: DictionaryMeaning[];
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
  const isEnglish = searchParams.get('isEnglish') === 'true';

  if (!word) {
    return new NextResponse('Word parameter is required', { status: 400 });
  }

  try {
    if (isEnglish) {
      // 영어 단어인 경우 Free Dictionary API 사용
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const data = await response.json() as DictionaryEntry[];

      const entry = data[0];
      const wordInfo: WordInfo = {
        word: entry.word,
        definition: entry.meanings[0].definitions[0].definition,
        examples: entry.meanings[0].definitions
          .filter(def => def.example)
          .map(def => def.example as string),
        related: []
      };
      const apiResponse: ApiResponse = {
        status: 200,
        data: wordInfo
      };
      return new Response(JSON.stringify(apiResponse));
    } else {
      // 한국어 단어인 경우 영어 번역 후 사전 검색
      const translateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ko|en`);
      const translateData = await translateResponse.json();
      const englishWord = translateData.responseData.translatedText;

      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(englishWord)}`);
      const dictData = await dictResponse.json() as DictionaryEntry[];

      const wordInfo: WordInfo = {
        word: word,
        definition: dictData[0].meanings[0].definitions[0].definition,
        examples: dictData[0].meanings[0].definitions
          .filter(def => def.example)
          .map(def => def.example as string),
        related: []
      };
      const apiResponse: ApiResponse = {
        status: 200,
        data: wordInfo
      };
      return new Response(JSON.stringify(apiResponse));
    }
  } catch (error) {
    console.error('Failed to fetch word info:', error);
    const errorResponse: ApiResponse = {
      status: 500,
      data: {
        word: "",
        definition: "",
        examples: [],
        related: []
      },
      error: error instanceof Error ? error.message : "Unknown error"
    };
    return new Response(JSON.stringify(errorResponse));
  }
} 