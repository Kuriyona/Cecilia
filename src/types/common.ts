/** 全库统一语义词表。字段名不得在本文件之外重新发明。 */

export interface UserRef {
  id: number;
  name: string;
}

export interface ArtistRef {
  id: number;
  name: string;
}

export interface AlbumRef {
  id: number;
  name: string;
  coverUrl: string;
}

export interface Song {
  id: number;
  name: string;
  artists: ArtistRef[];
  album: AlbumRef;
  duration: number;
  alias?: string[];
  fee?: number;
  available?: boolean;
}

export interface Artist {
  id: number;
  name: string;
  alias?: string[];
  avatarUrl?: string;
  briefDesc?: string;
  albumCount?: number;
  songCount?: number;
  mvCount?: number;
  followed?: boolean;
  topSongs?: Song[];
}

export interface Album {
  id: number;
  name: string;
  coverUrl: string;
  artists?: ArtistRef[];
  publishTime?: number;
  company?: string;
  description?: string;
  size?: number;
  songs?: Song[];
}

export interface PlaylistSummary {
  id: number;
  name: string;
  coverUrl: string;
  trackCount?: number;
  playCount?: number;
  creator?: UserRef;
  description?: string;
  updateTime?: number;
  tags?: string[];
}

export interface SongUrl {
  id: number;
  url: string | null;
  br: number;
  size: number;
  level?: string;
  fee?: number;
  freeTrialInfo?: { start: number; end: number } | null;
}

export interface MvRef {
  id: number;
  name: string;
  coverUrl: string;
  playCount?: number;
  duration?: number;
  artistName?: string;
}

export interface VideoRef {
  id: number;
  name: string;
  coverUrl: string;
  playCount?: number;
  duration?: number;
  creator?: UserRef;
}
