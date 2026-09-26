import type { Album, Artist, ArtistRef, MvRef, PlaylistSummary, Song, UserRef, VideoRef } from "./common";
import type { RawAlbum, RawArtist, RawMv, RawPlaylist, RawSong, RawUser, RawVideo } from "./raw";

export type SearchType = 1 | 10 | 100 | 1000 | 1002 | 1004 | 1006 | 1009 | 1014 | 2000;

export interface SearchLyric {
  id: number;
  name: string;
  artists: ArtistRef[];
}

export interface SearchRadio {
  id: number;
  name: string;
  coverUrl: string;
  djName?: string;
}

export interface SearchResult {
  songs?: Song[];
  artists?: Artist[];
  albums?: Album[];
  playlists?: PlaylistSummary[];
  users?: UserRef[];
  mvs?: MvRef[];
  videos?: VideoRef[];
  lyrics?: SearchLyric[];
  radios?: SearchRadio[];
  total?: number;
}

export interface SearchSuggest {
  keywords: string[];
  songs: Song[];
  artists: Artist[];
  albums: Album[];
}

export interface HotSearchGroup {
  first: string;
  second?: string | number;
  third?: string;
}

export interface HotSearchItem {
  keyword: string;
  position: number;
  content?: string;
  iconUrl?: string;
}

export interface RawSearchContainer {
  songs?: RawSong[];
  artists?: RawArtist[];
  albums?: RawAlbum[];
  playlists?: RawPlaylist[];
  userprofiles?: RawUser[];
  mvs?: RawMv[];
  videos?: RawVideo[];
  lyrics?: { id?: number | string; name?: string; artists?: RawArtist[] }[];
  resources?: RawSearchResource[];
  songCount?: number | string;
  albumCount?: number | string;
  order?: string[];
}

export interface RawSearchResource {
  id?: number | string;
  resourceId?: number | string;
  name?: string;
  title?: string;
  coverUrl?: string;
  picUrl?: string;
  djName?: string;
}

export interface RawSearchResponse {
  result?: RawSearchContainer;
  songs?: RawSong[];
  resources?: RawSearchResource[];
  total?: number | string;
}

/** /api/search/suggest/multimatch 用单数键返回各类型结果。 */
export interface RawMultimatchContainer {
  songs?: RawSong[];
  song?: RawSong[];
  artists?: RawArtist[];
  artist?: RawArtist[];
  albums?: RawAlbum[];
  album?: RawAlbum[];
  playlists?: RawPlaylist[];
  playlist?: RawPlaylist[];
}

export interface RawSearchHot {
  result?: {
    hots?: {
      first?: string;
      second?: string | number;
      third?: string | null;
    }[];
  };
}

export interface RawHotSearchDetail {
  data?: {
    searchWord?: string;
    content?: string;
    iconUrl?: string;
    position?: number | string;
  }[];
}

export interface RawDefaultKeyword {
  data?: { realkeyword?: string; showKeyword?: string };
}
