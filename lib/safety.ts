// Light keyword/NER screen for obviously unsafe topics
const UNSAFE_KEYWORDS = [
  // Violence
  'violence', 'violent', 'attack', 'assault', 'murder', 'kill', 'death', 'die', 'dead',
  'weapon', 'gun', 'knife', 'bomb', 'explosion', 'war', 'battle', 'fight', 'fighting',
  
  // Adult content
  'sex', 'sexual', 'porn', 'adult', 'nude', 'naked', 'intimate',
  
  // Drugs and alcohol
  'drug', 'drugs', 'cocaine', 'heroin', 'marijuana', 'alcohol', 'drunk', 'drinking',
  
  // Self-harm
  'suicide', 'self-harm', 'cutting', 'overdose',
  
  // Hate speech indicators
  'hate', 'racist', 'discrimination', 'prejudice', 'bigotry'
];

const CONTEXT_SAFE_WORDS = [
  // These words might appear in safe contexts
  'news', 'article', 'story', 'report', 'event', 'situation', 'problem', 'issue',
  'help', 'support', 'community', 'education', 'awareness', 'prevention'
];

export function maybeRefuse(input: string): { refuse: boolean; reason?: string } {
  const lowerInput = input.toLowerCase();
  
  // Check for unsafe keywords
  const foundUnsafe = UNSAFE_KEYWORDS.filter(keyword => 
    lowerInput.includes(keyword.toLowerCase())
  );
  
  if (foundUnsafe.length > 0) {
    // Check if the context might be safe (educational, news reporting, etc.)
    const hasSafeContext = CONTEXT_SAFE_WORDS.some(safeWord => 
      lowerInput.includes(safeWord.toLowerCase())
    );
    
    if (!hasSafeContext) {
      return {
        refuse: true,
        reason: `Content contains potentially inappropriate topics: ${foundUnsafe.join(', ')}. Please provide a different news article.`
      };
    }
  }
  
  // Check for excessive length (might be trying to bypass filters)
  if (input.length > 10000) {
    return {
      refuse: true,
      reason: "Article text is too long. Please provide a shorter, more focused news article."
    };
  }
  
  // Check for minimum meaningful content
  if (input.trim().length < 50) {
    return {
      refuse: true,
      reason: "Article text is too short. Please provide a more detailed news article."
    };
  }
  
  return { refuse: false };
}
