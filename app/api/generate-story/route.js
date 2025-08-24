import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse the request body
    const { newsStory } = await request.json();

    // Validate input
    if (!newsStory || typeof newsStory !== 'string') {
      return Response.json(
        { error: 'News story text is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Create the prompt for generating an allegorical story
    const prompt = `Based on this news story: "${newsStory}"

Create a 5-minute allegorical story for children under 10 years old. The story should:
- Be engaging and age-appropriate
- Include a clear moral lesson
- Use simple language and concepts
- Be approximately 500-800 words
- Include characters that children can relate to
- Have a clear beginning, middle, and end
- Be suitable for bedtime reading or classroom use

Please format the story with proper paragraphs and make it easy to read aloud.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a skilled children's storyteller who creates engaging, educational allegorical stories based on real-world events. Your stories are always age-appropriate, positive, and include valuable life lessons."
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
      return Response.json(
        { error: 'Failed to generate story' },
        { status: 500 }
      );
    }

    // Return the generated story
    return Response.json({
      success: true,
      story: generatedStory,
      originalNewsStory: newsStory
    });

  } catch (error) {
    console.error('Error generating story:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return Response.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 500) {
      return Response.json(
        { error: 'OpenAI service is currently unavailable' },
        { status: 503 }
      );
    }

    // Generic error response
    return Response.json(
      { error: 'An error occurred while generating the story' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return Response.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}

export async function PUT() {
  return Response.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return Response.json(
    { error: 'Method not allowed. Use POST to generate a story.' },
    { status: 405 }
  );
}
