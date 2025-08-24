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

### Endpoint: `POST /api/generate-story`

**Request Body:**
```json
{
  "newsStory": "Your news story text here..."
}
```

**Success Response:**
```json
{
  "success": true,
  "story": "Generated allegorical story for children...",
  "originalNewsStory": "Original news story text..."
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
const response = await fetch('/api/generate-story', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    newsStory: 'Scientists discover a new species of butterfly in the Amazon rainforest.'
  })
});

const data = await response.json();
console.log(data.story);
```

## Features

- ✅ Takes news story text as input via POST request
- ✅ Sends to OpenAI GPT-4 with specialized prompt
- ✅ Generates 5-minute allegorical stories for kids under 10
- ✅ Returns JSON response with generated story
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Rate limiting and API error handling
