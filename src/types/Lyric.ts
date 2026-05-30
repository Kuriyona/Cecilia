export interface RawLyric {
  lrc: {
    v: number;
    lyric: string;
    // format: [00:00.00]我是歌词
  };
}

export type LyricLine = {
  time: number;
  text: string;
};
