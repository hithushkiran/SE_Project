import { GoogleGenerativeAI } from "@google/generative-ai";

// Get Gemini API key from environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ParsedSearchQuery {
  query: string | null;
  categories: string[] | null;
  year: number | null;
  author: string | null;
}

/**
 * Parse natural language query using Gemini AI
 * @param userQuery - Natural language query from user
 * @param availableCategories - List of available category names from database
 * @returns Parsed search filters
 */
export async function parseSearchQueryWithGemini(
  userQuery: string,
  availableCategories: string[]
): Promise<ParsedSearchQuery> {
  try {
    console.log("Parsing query with Gemini:", userQuery);
    console.log("Available categories:", availableCategories);

    // Use Gemini 2.0 Flash - latest available model (Gemini 1.5 deprecated)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = buildPrompt(userQuery, availableCategories);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini raw response:", text);

    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response - no JSON found");
    }

    const parsed: ParsedSearchQuery = JSON.parse(jsonMatch[0]);
    
    console.log("Parsed query:", parsed);

    // Validate and clean the response
    return {
      query: parsed.query || null,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : null,
      year: parsed.year || null,
      author: parsed.author || null,
    };

  } catch (error: any) {
    // Log full error details for debugging
    console.error("Gemini AI parsing failed:", error);

    // Try a safe local fallback parser so the feature remains available
    try {
      const fallback = localParse(userQuery, availableCategories);
      console.warn("Using local fallback parser due to Gemini failure", fallback);
      return fallback;
    } catch (fallbackError) {
      console.error("Local fallback parser also failed:", fallbackError);
      // Surface original error message so frontend can show a useful message
      throw new Error(error?.message || "AI search temporarily unavailable");
    }
  }
}

/**
 * Local fallback parser - simple rule-based extraction
 * Keeps the app usable if Gemini fails or is blocked by CORS/key issues.
 */
function localParse(userQuery: string, availableCategories: string[]): ParsedSearchQuery {
  const q = userQuery.trim();
  const lower = q.toLowerCase();

  // Year extraction (first 4-digit year)
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  // Author extraction ("by NAME")
  let author: string | null = null;
  const byMatch = lower.match(/(?:by|authored by|written by)\s+([a-z .'-]+)(?:\s|$)/i);
  if (byMatch) {
    author = byMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Enhanced category matching with semantic keywords
  const categoryKeywords: Record<string, string[]> = {
    'computer science': ['machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence', 
      'neural network', 'computer vision', 'nlp', 'natural language', 'algorithm', 'programming', 
      'software', 'data science', 'robotics', 'computing', 'quantum computing', 'blockchain', 
      'cybersecurity', 'database', 'web development'],
    'physics': ['quantum', 'quantum mechanics', 'quantum physics', 'mechanics', 'relativity', 
      'particle', 'electromagnetic', 'thermodynamics', 'astrophysics', 'nuclear'],
    'biology': ['genetics', 'dna', 'rna', 'cell', 'molecular', 'organism', 'ecology', 'evolution',
      'biotechnology', 'microbiology'],
    'chemistry': ['molecule', 'compound', 'reaction', 'catalyst', 'organic', 'inorganic', 
      'biochemistry', 'chemical'],
    'mathematics': ['calculus', 'algebra', 'geometry', 'statistics', 'probability', 'theorem',
      'mathematical', 'discrete', 'topology'],
    'medicine': ['clinical', 'disease', 'treatment', 'therapy', 'diagnosis', 'patient', 'healthcare',
      'medical', 'pharmaceutical', 'surgery'],
    'environmental science': ['climate', 'sustainability', 'pollution', 'conservation', 'renewable',
      'environmental', 'ecology', 'green energy'],
    'engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'structural', 'industrial'],
    'economics': ['economics', 'economic', 'finance', 'financial', 'market', 'business'],
    'psychology': ['psychology', 'psychological', 'cognitive', 'behavioral', 'mental health']
  };

  const matched: string[] = [];
  const matchedSet = new Set<string>();
  const queryWords = new Set(lower.split(/\s+/).filter(w => w.length > 2));

  for (const cat of availableCategories) {
    const c = cat.toLowerCase();
    
    // 1. Exact category name match
    if (lower.includes(c)) {
      if (!matchedSet.has(cat)) {
        matched.push(cat);
        matchedSet.add(cat);
      }
      continue;
    }
    
    // 2. All words in category appear in query
    const parts = c.split(/\s+/);
    if (parts.every(p => p && lower.includes(p))) {
      if (!matchedSet.has(cat)) {
        matched.push(cat);
        matchedSet.add(cat);
      }
      continue;
    }

    // 3. Check semantic keywords (e.g., "computer vision" matches "Computer Science")
    const keywords = categoryKeywords[c] || [];
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        if (!matchedSet.has(cat)) {
          matched.push(cat);
          matchedSet.add(cat);
        }
        break;
      }
    }

    // 4. Partial word matching for compound terms (e.g., "quantum" in "computer quantum")
    const catWords = c.split(/\s+/);
    for (const catWord of catWords) {
      if (catWord.length > 3 && queryWords.has(catWord)) {
        // Boost score if multiple words match
        if (!matchedSet.has(cat)) {
          matched.push(cat);
          matchedSet.add(cat);
        }
        break;
      }
    }
  }

  // AI search is category-focused: if categories matched, don't filter by keywords
  // This way "computer vision" returns ALL Computer Science papers, not just ones with that text
  let keywords = lower;
  
  if (matched.length > 0) {
    // Categories found - make this a category-only search (no text filtering)
    keywords = '';
  } else {
    // No categories found - use keyword search
    if (year) keywords = keywords.replace(String(year), ' ');
    if (author) keywords = keywords.replace(new RegExp(author.toLowerCase(), 'g'), ' ');
    
    // remove common words
    keywords = keywords.replace(/\b(papers?|about|from|in|on|the|a|an|research|studies?|related|show me|get me|find)\b/g, ' ');
  }
  keywords = keywords.replace(/[^a-z0-9 ]+/g, ' ');
  keywords = keywords.trim().replace(/\s+/g, ' ');
  const keywordsResult = keywords.length > 0 ? keywords : null;

  console.log('Local parser results:', {
    input: userQuery,
    query: keywordsResult,
    categories: matched,
    availableCategories: availableCategories,
    year,
    author
  });

  return {
    query: keywordsResult,
    categories: matched.length > 0 ? matched : null,
    year,
    author
  };
}

/**
 * Build the prompt for Gemini with available categories
 */
function buildPrompt(userQuery: string, availableCategories: string[]): string {
  return `You are a research paper search query parser. Extract search filters from the user's natural language query.

**Available Categories:**
${availableCategories.map((cat, idx) => `${idx + 1}. ${cat}`).join('\n')}

**User Query:**
"${userQuery}"

**Instructions:**
1. PRIORITY: Match the query to ONE OR MORE categories from the available list above
2. Categories are matched based on topic/subject/domain (e.g., "computer vision" → "Computer Science")
3. If categories are matched, set query to null (category-only search)
4. If NO categories match, extract search keywords as fallback
5. Extract author name if mentioned (usually after words like "by", "authored by", "written by")
6. Extract year if mentioned (4-digit number like 2023, 2024)
7. Return ONLY valid JSON format, no markdown code blocks or additional explanation

**Output Format (JSON only):**
{
  "query": null (if categories matched) or "keywords" (if no categories),
  "categories": ["Category Name 1", "Category Name 2"] or null,
  "year": 2023 or null,
  "author": "Author Name" or null
}

**Examples:**

Query: "machine learning papers from 2023"
{
  "query": null,
  "categories": ["Computer Science"],
  "year": 2023,
  "author": null
}

Query: "computer vision research"
{
  "query": null,
  "categories": ["Computer Science"],
  "year": null,
  "author": null
}

Query: "research on quantum mechanics by John Smith"
{
  "query": "quantum mechanics",
  "categories": ["Physics"],
  "year": null,
  "author": "John Smith"
}

Query: "climate change and environmental sustainability studies"
{
  "query": "climate change sustainability",
  "categories": ["Environmental Science"],
  "year": null,
  "author": null
}

Query: "AI and deep learning"
{
  "query": "artificial intelligence deep learning",
  "categories": ["Computer Science", "Artificial Intelligence"],
  "year": null,
  "author": null
}

Now parse the user query above and return ONLY the JSON object (no markdown, no explanation).`;
}
