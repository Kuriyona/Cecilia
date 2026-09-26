export interface RawLyric {
  transUser?: {
    id?: number;
    nickname?: string;
  };
  lrc?: {
    lyric?: string;
  };
  tlyric?: {
    lyric?: string;
  } | null;
  yrc?: {
    lyric?: string;
  } | null;
  romalrc?: {
    lyric?: string;
  } | null;
}

export interface Lyric {
  lines: LyricLine[];
  translator?: {
    id: number;
    nickname: string;
  };
}

export type LyricLine = {
  time: number;
  text: string;
  translation?: string;
};

export interface WordLine {
  time: number;
  duration: number;
  words: {
    time: number;
    duration: number;
    text: string;
  }[];
}

export interface LyricNew {
  lines: LyricLine[];
  wordLines?: WordLine[];
  romaLines?: LyricLine[];
}
