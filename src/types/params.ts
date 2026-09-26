import type { SearchType } from "./search";

export interface SearchParams {
  keywords: string;
  type?: SearchType;
  limit?: number;
  offset?: number;
}

export interface SearchSuggestParams {
  keywords?: string;
  mobile?: boolean;
}

export interface SearchMultimatchParams {
  keywords?: string;
  type?: SearchType;
}

export interface SongUrlParams {
  id: number | number[];
  br?: number;
}

export interface CheckMusicParams {
  id: number;
  br?: number;
}

export interface PlaylistTracksParams {
  id: number;
  limit?: number;
  offset?: number;
}

export interface TopPlaylistsParams {
  cat?: string;
  order?: "hot" | "new";
  limit?: number;
  offset?: number;
}

export interface HighQualityPlaylistsParams {
  cat?: string;
  limit?: number;
  before?: number;
}

export interface ArtistSongsParams {
  id: number;
  order?: "hot" | "time";
  limit?: number;
  offset?: number;
}

export interface ArtistAlbumsParams {
  id: number;
  limit?: number;
  offset?: number;
}

export interface ArtistListParams {
  area?: number;
  type?: number;
  initial?: string | number;
  limit?: number;
  offset?: number;
}

export interface ArtistMvsParams {
  id: number;
  limit?: number;
  offset?: number;
}

export interface ArtistVideosParams {
  id: number;
  size?: number;
  cursor?: number;
  order?: number;
}

export interface AlbumSaleBoardParams {
  albumType?: 0 | 1;
  type?: "daily" | "week" | "year" | "total";
  year?: number;
}

export interface AlbumListParams {
  area?: string;
  type?: string;
  limit?: number;
  offset?: number;
}
