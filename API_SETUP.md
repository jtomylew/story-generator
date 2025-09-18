# API Setup Guide

## Environment Configuration

To use the `/api/generate-story` endpoint, you need to configure your OpenAI API key:

1. Create a `.env.local` file in your project root
2. Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o
```

You can get your API key from: https://platform.openai.com/api-keys

**Optional Configuration:**

- `MODEL_NAME`: The OpenAI model to use (defaults to `gpt-4o` if not set)
  - Examples: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`

## API Usage

### Endpoint: `POST /api/generate`

**Request Body:**

```json
{
  "articleText": "Your news story text here...",
  "readingLevel": "elementary"
}
```

**Reading Level Options (Optional):**

- `"preschool"` - Very simple vocabulary, short sentences, lots of repetition
- `"early-elementary"` - Simple vocabulary, short sentences, some repetition
- `"elementary"` - Age-appropriate vocabulary, varied sentence structures (default)

**Note:** The `readingLevel` field is optional. If not provided, stories will default to "elementary" level (7-10 year olds).

**Success Response:**

```json
{
  "story": "Generated allegorical story for children...",
  "questions": ["First discussion question?", "Second discussion question?"],
  "meta": {
    "readingLevel": "elementary",
    "wordCount": 250
  }
}
```

**Error Response:**

```json
{
  "error": "Error message description"
}
```

### Example Usage

```javascript
const response = await fetch("/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    articleText:
      "Scientists discover a new species of butterfly in the Amazon rainforest.",
    readingLevel: "elementary", // Optional - defaults to "elementary" if not provided
  }),
});

const data = await response.json();
console.log(data.story);
console.log(data.questions); // Array of 2 discussion questions
```

## Features

- ✅ Takes news story text as input via POST request
- ✅ Sends to OpenAI GPT-4 with specialized prompt
- ✅ Generates 5-minute allegorical stories for kids under 10
- ✅ Returns JSON response with generated story
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Rate limiting and API error handling
