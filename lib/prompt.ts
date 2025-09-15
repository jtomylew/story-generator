import { readFileSync } from "fs";
import { join } from "path";

export interface PromptVariables {
  readingLevel: string;
  articleText: string;
  styleHints?: string;
}

export function loadPrompt(templateName: string, variables: PromptVariables): string {
  try {
    const templatePath = join(process.cwd(), "prompts", `${templateName}.md`);
    const template = readFileSync(templatePath, "utf8");
    
    return substituteVariables(template, variables);
  } catch (error) {
    console.warn(`Failed to load prompt template ${templateName}, using fallback`);
    return getFallbackPrompt(templateName, variables);
  }
}

function substituteVariables(template: string, variables: PromptVariables): string {
  let result = template;
  
  // Simple {{variable}} substitution
  result = result.replace(/\{\{readingLevel\}\}/g, variables.readingLevel);
  result = result.replace(/\{\{articleText\}\}/g, variables.articleText);
  
  if (variables.styleHints) {
    result = result.replace(/\{\{styleHints\}\}/g, variables.styleHints);
  } else {
    // Remove conditional blocks if styleHints is not provided
    result = result.replace(/\{\{#if styleHints\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }
  
  return result;
}

function getFallbackPrompt(templateName: string, variables: PromptVariables): string {
  if (templateName === "system.story") {
    return `You are a skilled children's storyteller who creates engaging, educational allegorical stories based on real-world events. You are specifically adapting stories for ${variables.readingLevel} children. Your stories are always age-appropriate, positive, and include valuable life lessons tailored to the reading level.

Return a JSON object with exactly this structure:
{
  "story": "Your complete story here...",
  "questions": ["First discussion question?", "Second discussion question?"]
}`;
  }
  
  if (templateName === "user.story") {
    return `Based on this news story: "${variables.articleText}"

Create an allegorical story for ${variables.readingLevel} children that transforms the real-world events into an age-appropriate animal story or fantasy scenario. Include exactly 2 discussion questions that help children think about the story's themes.`;
  }
  
  return `Create a story for ${variables.readingLevel} children based on: ${variables.articleText}`;
}
