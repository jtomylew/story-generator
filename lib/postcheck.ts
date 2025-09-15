import { GenerateRes, GenerateReq } from "@/lib/schema";

export type GenerateResType = typeof GenerateRes._type;
export type GenerateReqType = typeof GenerateReq._type;

const WORD_RANGES = {
  preschool: { min: 60, max: 140 },
  "early-elementary": { min: 120, max: 220 },
  elementary: { min: 180, max: 320 },
} as const;

export function postCheck(res: GenerateResType, level: string): void {
  // Check exactly 2 questions (already enforced by schema, but double-check)
  if (!res.questions || res.questions.length !== 2) {
    throw new Error(
      `Expected exactly 2 questions, got ${res.questions?.length || 0}`,
    );
  }

  // Check word count if meta is provided
  if (res.meta?.wordCount) {
    const range = WORD_RANGES[level as keyof typeof WORD_RANGES];
    const wordCount = res.meta.wordCount;

    if (wordCount < range.min || wordCount > range.max) {
      throw new Error(
        `Story word count (${wordCount}) is outside the acceptable range for ${level} (${range.min}-${range.max} words). ` +
          `Please adjust the story length to fit the target reading level.`,
      );
    }
  }

  // Additional validation: ensure questions are meaningful
  for (let i = 0; i < res.questions.length; i++) {
    const question = res.questions[i] as string;
    if (question.length < 10) {
      throw new Error(
        `Question ${i + 1} is too short (${question.length} chars). Questions should be at least 10 characters long.`,
      );
    }

    if (!question.endsWith("?")) {
      throw new Error(`Question ${i + 1} should end with a question mark.`);
    }
  }
}
