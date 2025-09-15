import { z } from "zod";

/** Allowed reading levels (align with your UI options) */
export const ReadingLevel = z.enum([
  "preschool",
  "early-elementary",
  "elementary",
]);
export type ReadingLevel = z.infer<typeof ReadingLevel>;

/** Request schema for POST /api/generate */
export const GenerateReq = z.object({
  articleText: z
    .string()
    .min(50, "Provide at least a full paragraph of article text."),
  readingLevel: ReadingLevel,
});
export type GenerateReq = z.infer<typeof GenerateReq>;

/** Response schema for validated story generation */
export const GenerateRes = z.object({
  story: z.string().min(50),
  questions: z.tuple([z.string().min(3), z.string().min(3)]),
  meta: z
    .object({
      readingLevel: z.string(),
      wordCount: z.number().int().positive(),
    })
    .optional(),
});
export type GenerateRes = z.infer<typeof GenerateRes>;

/** Helper to format Zod issues for API errors */
export function formatZodIssues(err: z.ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
}
