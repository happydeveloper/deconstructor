import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch word info');
      }

      const entry = data[0];
      return NextResponse.json({
        word: entry.word,
        phonetic: entry.phonetic,
        meanings: entry.meanings.map((meaning: any) => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.map((def: any) => def.definition),
          examples: meaning.definitions
            .filter((def: any) => def.example)
            .map((def: any) => def.example),
        })),
      });
    } else {
      // 한국어 단어인 경우 영어 번역 후 사전 검색
      const translateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ko|en`);
      const translateData = await translateResponse.json();
      const englishWord = translateData.responseData.translatedText;

      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(englishWord)}`);
      const dictData = await dictResponse.json();

      return NextResponse.json({
        word: word,
        englishWord: englishWord,
        meanings: dictData[0].meanings.map((meaning: any) => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.map((def: any) => def.definition),
          examples: meaning.definitions
            .filter((def: any) => def.example)
            .map((def: any) => def.example),
        })),
      });
    }
  } catch (error) {
    console.error('Failed to fetch word info:', error);
    return new NextResponse('Failed to fetch word info', { status: 500 });
  }
} 