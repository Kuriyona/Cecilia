import type { LrcEntry } from "./mergeLyricTimelines";

export const parseLrc = (lrc: string): LrcEntry[] =>
  lrc
    .split("\n")
    .filter((l) => l.startsWith("["))
    .map((l): LrcEntry | null => {
      const match = l.match(/^\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/);
      if (!match) return null;
      const [, minutes = "0", seconds = "0", text = ""] = match;
      return {
        time: parseInt(minutes, 10) * 60 + parseFloat(seconds),
        text: text.trim(),
      };
    })
    .filter((e): e is LrcEntry => e !== null);
