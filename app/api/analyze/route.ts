import { generateObject } from "ai";
import { wordSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { z } from "zod";

type WordOutput = z.infer<typeof wordSchema>;

export const maxDuration = 60;

function validateWordParts(word: string, parts: WordOutput["parts"]): string[] {
  const errors: string[] = [];
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

  if (lastLayer?.length === 1) {
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
    console.error("Error generating word deconstruction:", error);
    return NextResponse.json(
      { error: "Failed to generate word deconstruction" },
      { status: 500 }
    );
  }
} 