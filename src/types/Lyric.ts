export interface RawLyric {
  transUser?: {
    id: number;
    nickname: string;
  };
  lrc: {
    v: number;
    lyric: string;
    // format: [00:00.00]我是歌词
  };
  tlyric: {
    v: number;
    lyric: string;
    // format: [by:用户名]
    // format: [00:00.00]我是歌词
  };
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
