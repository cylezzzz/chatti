/**
 * Chat agent helper functions.
 *
 * This module encapsulates simple intent detection and suggestion
 * generation for the chat application.  It is not a full agent
 * implementation; instead it exports helpers that can be invoked from
 * your UI when you wish to determine which add‑ons might be
 * appropriate for a given user input.
 */

export interface Suggestion {
  id: string;
  label: string;
  json: string;
}

/**
 * getSuggestions
 *
 * Returns an array of add‑on suggestions based on the provided
 * user input.  The algorithm is rudimentary and searches for
 * keywords that map to specific add‑ons.  If no keywords match,
 * the returned array will be empty.
 *
 * Currently recognised intents:
 *  - clothing‑change: triggered by phrases like "Kleidung ändern", "Outfit ändern" or "neues Outfit".
 */
export function getSuggestions(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const lower = text.toLowerCase();
  // Recognise requests to change clothing/outfits
  if (/\b(kleidung ändern|outfit ändern|neues outfit)\b/.test(lower)) {
    suggestions.push({
      id: "clothing-change",
      label: "Outfit ändern",
      json: "/data/addons/clothing-change.json",
    });
  }
  return suggestions;
}