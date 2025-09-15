import { createHash } from "crypto";

export async function reqHash(
  articleText: string,
  readingLevel: string,
): Promise<string> {
  const input = `${articleText}|${readingLevel}`;
  return createHash("sha256").update(input).digest("hex");
}
