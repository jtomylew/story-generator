import { NextResponse } from "next/server";
import { GenerateReq, formatZodIssues } from "@/lib/schema";
import { openai } from "@/lib/openai";

export async function POST(req) {
  try {
    const raw = await req.json();
    const parsed = GenerateReq.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "BadRequest", issues: formatZodIssues(parsed.error) },
        { status: 400 }
      );
    }
    const { articleText, readingLevel } = parsed.data;

    // Create age-appropriate prompt based on reading level
    const getAgeSpecificPrompt = (level) => {
      switch (level) {
        case 'preschool':
          return `Create a very simple allegorical story for preschoolers (ages 3-5). The story should:
- Use very simple words and short sentences (2-4 words per sentence)
- Include lots of repetition and rhyming
- Be approximately 200-300 words
- Use familiar objects and animals
- Have a very clear, simple moral lesson
- Include sound effects and simple actions
- Be perfect for reading aloud to very young children
- Use bright, simple imagery and happy endings`;
        
        case 'early-elementary':
          return `Create an allegorical story for early elementary children (ages 5-7). The story should:
- Use simple vocabulary and short sentences
- Include some repetition and rhythm
- Be approximately 300-500 words
- Use familiar characters and settings
- Have a clear moral lesson explained simply
- Include dialogue and simple conversations
- Be engaging for beginning readers
- Use descriptive but simple language`;
        
        case 'elementary':
          return `Create an allegorical story for elementary children (ages 7-10). The story should:
- Use age-appropriate vocabulary with some challenging words
- Include varied sentence structures
- Be approximately 500-800 words
- Include more complex characters and plot
- Have a meaningful moral lesson
- Include rich dialogue and descriptions
- Be suitable for independent reading
- Use engaging storytelling techniques`;
        
        default:
          return `Create a 5-minute allegorical story for children under 10 years old. The story should:
- Be engaging and age-appropriate
- Include a clear moral lesson
- Use simple language and concepts
- Be approximately 500-800 words
- Include characters that children can relate to
- Have a clear beginning, middle, and end
- Be suitable for bedtime reading or classroom use`;
      }
    };

    const prompt = `Based on this news story: "${articleText}"

${getAgeSpecificPrompt(readingLevel)}

Please format the story with proper paragraphs and make it easy to read aloud.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a skilled children's storyteller who creates engaging, educational allegorical stories based on real-world events. You are specifically adapting stories for ${readingLevel} children. Your stories are always age-appropriate, positive, and include valuable life lessons tailored to the reading level.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Extract the generated story
    const generatedStory = completion.choices[0]?.message?.content;

    if (!generatedStory) {
      return NextResponse.json(
        { error: 'Failed to generate story' },
        { status: 500 }
      );
    }

    // Return the generated story
    return NextResponse.json({
      success: true,
      story: generatedStory,
      originalNewsStory: articleText,
      readingLevel: readingLevel
    });

  } catch (error) {
    console.error('Error generating story:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 500) {
      return NextResponse.json(
        { error: 'OpenAI service is currently unavailable' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An error occurred while generating the story' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}
