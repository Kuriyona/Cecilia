import type { PlaylistSummary } from "./common";
import type { RawPlaylist } from "./raw";

export interface RawPlaylistTrackId {
  id?: number | string;
  at?: number | string;
}

export interface RawPlaylistDetails {
  playlist: RawPlaylist & { trackIds?: RawPlaylistTrackId[] };
}

export interface PlaylistDetail {
  id: number;
  name: string;
  creatorId: number;
  coverUrl: string;
  createTime: number;
  songs: {
    id: number;
    addTime: number;
  }[];
}

export interface PlaylistStats {
  commentCount?: number;
  shareCount?: number;
  playCount?: number;
  subscribedCount?: number;
  playedCount?: number;
}

export interface PlaylistTag {
  name: string;
  hot: boolean;
}

export interface PlaylistPage {
  total?: number;
  more?: boolean;
  playlists: PlaylistSummary[];
}

export interface PlaylistCategory {
  name: string;
  subcategories: {
    name: string;
    category: number;
  }[];
}

export interface RawPlaylistStats {
  commentCount?: number | string;
  shareCount?: number | string;
  playCount?: number | string;
  subscribedCount?: number | string;
  playedCount?: number | string;
}

export interface RawPlaylistList {
  total?: number | string;
  more?: boolean;
  playlists?: RawPlaylist[];
}

export interface RawHighQualityTags {
  tags?: { name?: string; hot?: boolean }[];
}

export interface RawPlaylistCatalogue {
  categories?: Record<string, string>;
  sub?: { name?: string; category?: number | string }[];
}
