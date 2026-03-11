export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/```json\\s*([\\s\\S]*?)\\s*```/i);
    if (!match) return fallback;

    try {
      return JSON.parse(match[1]) as T;
    } catch {
      return fallback;
    }
  }
}
