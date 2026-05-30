export interface RawSongDetails {
  songs: {
    id: number;
    name: string;
    ar: {
      id: number;
      name: string;
    }[];
    al: {
      id: number;
      name: string;
      picUrl: string;
    };
    dt: number; // duration
  }[];
}

export type SongDetail = {
  id: number;
  name: string;
  artists: {
    id: number;
    name: string;
  }[];
  album: {
    id: number;
    name: string;
    picUrl: string;
  };
  duration: number;
};
