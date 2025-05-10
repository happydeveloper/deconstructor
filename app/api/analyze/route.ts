import { generateObject } from "ai";
import { wordSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Part, Combination } from "@/types/definition";

type WordOutput = z.infer<typeof wordSchema>;

export const maxDuration = 60;

function validateWordParts(word: string, parts: WordOutput["parts"]): string[] {
  const errors: string[] = [];
  
  // 문장인 경우 (공백이 있는 경우) 검증 건너뛰기
  if (word.includes(" ")) {
    return errors;
  }

  const combinedParts = parts.map((p) => p.text).join("");
  const commaSeparatedParts = parts.map((p) => p.text).join(", ");

  if (combinedParts.toLowerCase() !== word.toLowerCase().replaceAll(" ", "")) {
    errors.push(
      `The parts "${commaSeparatedParts}" do not combine to form the word "${word}"`
    );
  }
  return errors;
}

function validateUniqueIds(output: WordOutput): string[] {
  const errors: string[] = [];
  const seenIds = new Map<string, string>();

  output.parts.forEach((part) => {
    seenIds.set(part.id, "parts");
  });

  output.combinations.forEach((layer, layerIndex) => {
    layer.forEach((combo) => {
      if (seenIds.has(combo.id)) {
        errors.push(
          `ID "${combo.id}" in combinations layer ${layerIndex + 1} is already used`
        );
      }
      seenIds.set(combo.id, `combinations layer ${layerIndex + 1}`);
    });
  });

  return errors;
}

function validateCombinations(word: string, output: WordOutput): string[] {
  const errors: string[] = [];
  const lastLayer = output.combinations[output.combinations.length - 1];
  
  if (lastLayer.length !== 1) {
    errors.push("The last layer should have exactly one item");
  }

  // 문장인 경우 (공백이 있는 경우) 최종 단어 검증 건너뛰기
  if (!word.includes(" ") && lastLayer?.length === 1) {
    const finalWord = lastLayer[0].text.toLowerCase();
    if (finalWord !== word.toLowerCase()) {
      errors.push(
        `The final combination "${finalWord}" does not match the input word "${word}"`
      );
    }
  }

  return errors;
}

interface LastAttempt {
  errors: string[];
  output: WordOutput;
}

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Word is required and must be a string" },
        { status: 400 }
      );
    }

    // 문장인 경우 AI를 사용하여 분석
    if (word.includes(" ")) {
      const result = await generateObject({
        model: google("gemini-2.0-flash"),
        system: `You are a linguistic expert specializing in both English and Korean language analysis. Analyze the given sentence and provide detailed grammatical information.

For Korean sentences:
1. Identify each word/eojeol (어절) and its components
2. For each component, provide:
   - The exact text
   - Part of speech (품사) in Korean:
     * 체언 (체언): 명사(名詞), 대명사(代名詞), 수사(數詞)
     * 용언 (用言): 동사(動詞), 형용사(形容詞)
     * 수식언 (修飾言): 관형사(冠形詞), 부사(副詞)
     * 독립언 (獨立言): 감탄사(感歎詞)
     * 관계언 (關係言): 조사(助詞)
   - Grammatical function (문장성분): 주어, 서술어, 목적어, 보어, 관형어, 부사어, 독립어
   - A brief explanation of its role

For English sentences:
1. Identify each word
2. For each word, provide:
   - The exact text
   - Part of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, article, interjection
   - Grammatical function: subject, predicate, object, complement, modifier, etc.
   - A brief explanation of its role

Return the analysis in the following JSON format:
{
  "thought": "Brief analysis of the sentence structure in the original language",
  "parts": [
    {
      "id": "word-1",
      "text": "the word/eojeol",
      "originalWord": "the word/eojeol",
      "origin": "Korean/English",
      "meaning": "brief explanation of its role",
      "partOfSpeech": "exact part of speech"
    }
  ],
  "combinations": [
    [
      {
        "id": "combo-1",
        "text": "the word/eojeol",
        "definition": "grammatical function",
        "sourceIds": ["word-1"],
        "partOfSpeech": "exact part of speech"
      }
    ],
    [
      {
        "id": "final",
        "text": "complete sentence",
        "definition": "sentence structure analysis",
        "sourceIds": ["combo-1", "combo-2", ...],
        "partOfSpeech": "sentence"
      }
    ]
  ]
}

Example for Korean:
Input: "나는 학교에 갑니다"
Output should identify:
- 나는: 대명사(代名詞) + 조사(助詞), 주어
- 학교에: 명사(名詞) + 조사(助詞), 부사어
- 갑니다: 동사(動詞), 서술어

Example for English:
Input: "I go to school"
Output should identify:
- I: pronoun, subject
- go: verb, predicate
- to: preposition
- school: noun, object`,
        prompt: `Analyze this sentence: "${word}"`,
        schema: wordSchema,
      });

      return NextResponse.json(result.object);
    }

    // 단일 단어인 경우 기존 로직 사용
    const attempts: LastAttempt[] = [];
    const maxAttempts = 3;

    while (attempts.length < maxAttempts) {
      const prompt = attempts.length === 0
        ? `Deconstruct the word: ${word}`
        : `Deconstruct the word: ${word}\n\nPrevious attempts:\n${attempts
            .map((attempt, index) => `Attempt ${index + 1}:\n${JSON.stringify(attempt.output, null, 2)}\nErrors:\n${attempt.errors.map((error) => `- ${error}`).join("\n")}`)
            .join("\n")}\n\nPlease fix all the issues and try again.`;

      const result = await generateObject({
        model: google("gemini-2.0-flash"),
        system: `You are a linguistic expert that deconstructs words into their meaningful parts and explains their etymology...`,
        prompt,
        schema: wordSchema,
      });

      const errors = [
        ...validateWordParts(word, result.object.parts),
        ...validateUniqueIds(result.object),
        ...validateCombinations(word, result.object),
      ];

      if (errors.length === 0) {
        return NextResponse.json(result.object);
      }

      console.log("validation errors:", errors);
      attempts.push({
        errors,
        output: result.object,
      });
    }

    // Return the last attempt anyway
    return NextResponse.json(attempts[attempts.length - 1]?.output, {
      status: 203,
    });
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 }
    );
  }
}

// 단어의 품사를 분석하는 함수
async function analyzePartOfSpeech(word: string): Promise<string> {
  // 기본적인 품사 패턴
  const patterns = {
    verb: [
      /^(be|am|is|are|was|were|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must)$/i,
      /^[a-z]+(s|es)$/i,
      /^[a-z]+(ed|d)$/i,
      /^[a-z]+ing$/i,
      /^[a-z]+(en|ed|d)$/i
    ],
    adjective: [
      /^[a-z]+(ful|less|ous|ious|eous|able|ible|al|ial|ical|ic|ive|ative|itive|ous|ious|eous|y|ary|ory|ent|ant|ate|en|ed|ing|ly)$/i
    ],
    preposition: [
      /^(in|on|at|to|for|with|by|about|like|through|over|before|between|after|since|without|under|within|along|following|across|behind|beyond|plus|except|but|up|out|around|down|off|above|near)$/i
    ],
    article: [
      /^(a|an|the)$/i
    ],
    conjunction: [
      /^(and|or|but|nor|for|yet|so|because|although|though|while|if|unless|since|as|when|where|whether)$/i
    ],
    pronoun: [
      /^(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their|mine|yours|hers|ours|theirs|this|that|these|those|who|whom|whose|which|what)$/i
    ]
  };

  // 각 품사 패턴에 대해 검사
  for (const [pos, posPatterns] of Object.entries(patterns)) {
    if (posPatterns.some(pattern => pattern.test(word))) {
      return pos;
    }
  }

  // 기본값은 명사로 처리
  return "noun";
} 