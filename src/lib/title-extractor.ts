/**
 * AI-Powered Film Title Extractor
 * Uses Claude Haiku to intelligently extract actual film titles from event names
 */

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

interface ExtractionResult {
  filmTitle: string;
  eventType?: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Extract the actual film title from a screening event name
 *
 * Examples:
 * - "Saturday Morning Picture Club: The Muppets Christmas Carol" → "The Muppets Christmas Carol"
 * - "UK PREMIERE I Only Rest in the Storm" → "Only Rest in the Storm"
 * - "35mm: Casablanca" → "Casablanca"
 * - "Star Wars: A New Hope" → "Star Wars: A New Hope" (kept as-is, it's the real title)
 */
export async function extractFilmTitle(rawTitle: string): Promise<ExtractionResult> {
  // Quick pass: if it looks like a clean title already, skip the API call
  if (isLikelyCleanTitle(rawTitle)) {
    return {
      filmTitle: cleanBasicCruft(rawTitle),
      confidence: "high",
    };
  }

  try {
    const response = await getClient().messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Extract the actual film title from this cinema screening listing. The listing may include event prefixes (like "Kids Club:", "35mm:", "UK PREMIERE"), format info, or Q&A notes that are NOT part of the film title.

Listing: "${rawTitle}"

Respond with ONLY a JSON object (no markdown):
{"title": "The Actual Film Title", "event": "event type if any", "confidence": "high|medium|low"}

Examples:
- "Saturday Morning Picture Club: The Muppets Christmas Carol" → {"title": "The Muppets Christmas Carol", "event": "kids screening", "confidence": "high"}
- "Star Wars: A New Hope" → {"title": "Star Wars: A New Hope", "confidence": "high"}
- "35mm: Casablanca (PG)" → {"title": "Casablanca", "event": "35mm screening", "confidence": "high"}
- "UK PREMIERE I Only Rest in the Storm" → {"title": "Only Rest in the Storm", "event": "premiere", "confidence": "high"}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const parsed = JSON.parse(text.trim());

    return {
      filmTitle: cleanBasicCruft(parsed.title || rawTitle),
      eventType: parsed.event,
      confidence: parsed.confidence || "medium",
    };
  } catch (error) {
    console.warn(`[TitleExtractor] AI extraction failed for "${rawTitle}":`, error);
    // Fallback to basic cleaning
    return {
      filmTitle: cleanBasicCruft(rawTitle),
      confidence: "low",
    };
  }
}

/**
 * Batch extract titles (with rate limiting)
 */
export async function batchExtractTitles(
  rawTitles: string[]
): Promise<Map<string, ExtractionResult>> {
  const results = new Map<string, ExtractionResult>();
  const uniqueTitles = [...new Set(rawTitles)];

  // Process titles that need AI extraction
  const needsExtraction: string[] = [];

  for (const title of uniqueTitles) {
    if (isLikelyCleanTitle(title)) {
      results.set(title, {
        filmTitle: cleanBasicCruft(title),
        confidence: "high",
      });
    } else {
      needsExtraction.push(title);
    }
  }

  // Batch process with rate limiting (~2 requests/second for Haiku)
  for (let i = 0; i < needsExtraction.length; i++) {
    const title = needsExtraction[i];
    const result = await extractFilmTitle(title);
    results.set(title, result);

    // Rate limit
    if (i < needsExtraction.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Check if a title is likely already clean (no event prefixes)
 */
function isLikelyCleanTitle(title: string): boolean {
  const normalized = title.toLowerCase().trim();

  // Known event prefix patterns
  const eventPatterns = [
    /^(saturday|sunday|weekday)\s+(morning|afternoon)/i,
    /^(kids?|family|toddler|baby)\s*(club|time|film)/i,
    /^(uk|world)\s+premiere/i,
    /^(35|70)mm[:\s]/i,
    /^(imax|4k|restoration)[:\s]/i,
    /^(sing[\s-]?a[\s-]?long|quote[\s-]?a[\s-]?long)[:\s]/i,
    /^(preview|sneak|advance)[:\s]/i,
    /^(special|member'?s?)\s+screening/i,
    /^(double|triple)\s+(feature|bill)/i,
    /^(cult|classic|christmas)\s+(classic|film)/i,
    /^(late\s+night|midnight)/i,
    /^(marathon|retrospective|tribute)[:\s]/i,
    /^(q\s*&\s*a|live\s+q)/i,
    /^(intro(duced)?\s+by|with\s+q)/i,
    // Cinema-specific event series
    /^(classic\s+matinee)[:\s]/i,
    /^(queer|horror|comedy|sci-?fi)\s+(night|horror|film)/i,
    /^(doc\s*'?n'?\s*roll)[:\s]/i,
    /^(lsff|bfi|afi|tiff)[:\s]/i,  // Festival abbreviations
    /^(underscore\s+cinema)[:\s]/i,
    /^(neurospicy|dyke\s+tv)[:\s!]/i,
    // Generic patterns for event titles with suffixes
    /\+\s*q\s*&?\s*a\s*$/i,  // ends with "+ Q&A"
    /with\s+shadow\s+cast/i,  // special screenings with performers
    /\+\s*(discussion|intro|live)/i,  // ends with "+ discussion" etc.
  ];

  for (const pattern of eventPatterns) {
    if (pattern.test(normalized)) {
      return false; // Needs extraction
    }
  }

  // Also check for suspicious colon patterns (but allow film subtitles)
  if (normalized.includes(":")) {
    const beforeColon = normalized.split(":")[0];
    // If before colon is very short (1-2 words) and doesn't look like a franchise
    const words = beforeColon.trim().split(/\s+/);
    if (words.length <= 2 && !/^(star\s+wars|indiana|harry|lord|mission|pirates|fast|jurassic|matrix|batman|spider|alien|terminator|mad|back|die|lethal|home|rocky|rambo|godfather|toy|finding|avengers|guardians|shrek|dark)/i.test(beforeColon)) {
      return false; // Suspicious, needs extraction
    }
  }

  return true; // Looks clean
}

/**
 * Basic title cleanup (BBFC ratings, format suffixes, etc.)
 */
function cleanBasicCruft(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .trim()
    // Remove BBFC ratings
    .replace(/\s*\((U|PG|12A?|15|18)\*?\)\s*$/i, "")
    // Remove bracketed notes
    .replace(/\s*\[.*?\]\s*$/g, "")
    // Remove format suffixes
    .replace(/\s*-\s*(35mm|70mm|4k|imax)\s*$/i, "")
    // Remove Q&A suffixes
    .replace(/\s*\+\s*(q\s*&\s*a|discussion|intro)\s*$/i, "")
    .trim();
}

/**
 * Cache for extracted titles (to avoid repeated API calls)
 */
const titleCache = new Map<string, ExtractionResult>();

/**
 * Extract with caching
 */
export async function extractFilmTitleCached(rawTitle: string): Promise<ExtractionResult> {
  const cached = titleCache.get(rawTitle);
  if (cached) {
    return cached;
  }

  const result = await extractFilmTitle(rawTitle);
  titleCache.set(rawTitle, result);
  return result;
}

/**
 * Clear the title cache
 */
export function clearTitleCache(): void {
  titleCache.clear();
}
