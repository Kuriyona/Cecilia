import type { WordLine } from "../types/Lyric";

const YRC_LINE = /^\[(\d+),(\d+)\](.*)$/;
const YRC_WORD = /(\d+),(\d+),\d+,(\d+)\)([^()]*)/g;

export const parseYrc = (yrc: string): WordLine[] => {
  const lines: WordLine[] = [];
  for (const raw of yrc.split("\n")) {
    const match = raw.match(YRC_LINE);
    if (!match) continue;
    const [, start = "0", span = "0", body = ""] = match;
    const words: WordLine["words"] = [];
    for (const word of body.matchAll(YRC_WORD)) {
      const [, wordStart = "0", , wordSpan = "0", text = ""] = word;
      words.push({
        time: Number(wordStart),
        duration: Number(wordSpan),
        text,
      });
    }
    lines.push({ time: Number(start), duration: Number(span), words });
  }
  return lines;
};
