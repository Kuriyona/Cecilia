export interface RawPlaylistDetails {
  playlist: {
    id: number;
    name: string;
    coverImgId: number;
    coverImgUrl: string;
    userId: number;
    createTime: number;
    trackIds: {
      id: number;
      at: number; // timestamp
    }[];
  };
}

export interface PlaylistDetails {
  id: number;
  name: string;
  coverImgId: number;
  coverImgUrl: string;
  userId: number;
  createTime: number;
  songs: {
    id: number;
    addTime: number; // timestamp
  }[];
}
