import type { LyricLine } from "../types/Lyric";

export interface LrcEntry {
  time: number;
  text: string;
}

export function mergeLyricTimelines(
  original: LrcEntry[],
  translation: LrcEntry[],
): LyricLine[] {
  const originalMap = new Map<number, string>();
  for (const item of original) {
    originalMap.set(item.time, item.text);
  }

  const translationMap = new Map<number, string>();
  for (const item of translation) {
    translationMap.set(item.time, item.text);
  }

  const allTimes = new Set<number>();
  for (const item of original) allTimes.add(item.time);
  for (const item of translation) allTimes.add(item.time);

  const sortedTimes = [...allTimes].sort((a, b) => a - b);

  const result: LyricLine[] = [];
  let lastOriginal: string | undefined;
  let lastTranslation: string | undefined;

  for (const time of sortedTimes) {
    if (originalMap.has(time)) {
      lastOriginal = originalMap.get(time);
    }
    if (translationMap.has(time)) {
      lastTranslation = translationMap.get(time);
    }

    result.push({
      time,
      text: lastOriginal ?? "",
      ...(lastTranslation !== undefined ? { translation: lastTranslation } : {}),
    });
  }

  return result;
}
