import { z } from "zod";

/** Allowed reading levels (align with your UI options) */
export const ReadingLevel = z.enum(["preschool", "early-elementary", "elementary"]);
export type ReadingLevel = z.infer<typeof ReadingLevel>;

/** Request schema for POST /api/generate */
export const GenerateReq = z.object({
  articleText: z.string().min(50, "Provide at least a full paragraph of article text."),
  readingLevel: ReadingLevel,
});
export type GenerateReq = z.infer<typeof GenerateReq>;

/** (Optional) Response schema you can validate against before returning */
export const GenerateRes = z.object({
  story: z.string().min(50),
  ageBand: ReadingLevel,
  newsSummary: z.string().min(10),
  sourceHash: z.string(),
  model: z.string(),
  tokens: z.object({ prompt: z.number(), completion: z.number() }).optional(),
  safety: z.object({ flagged: z.boolean(), reasons: z.array(z.string()) }),
  cached: z.boolean(),
  createdAt: z.string().optional(), // ISO timestamp
});
export type GenerateRes = z.infer<typeof GenerateRes>;

/** Helper to format Zod issues for API errors */
export function formatZodIssues(err: z.ZodError) {
  return err.issues.map(i => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
}
