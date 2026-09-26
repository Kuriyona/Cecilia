import type { Song } from "./common";
import type { RawSong } from "./raw";

export type SongDetail = Song;

export interface RawSongDetails {
  songs: RawSong[];
}

export interface RawSongUrlItem {
  id?: number | string;
  url?: string | null;
  br?: number | string;
  size?: number | string;
  level?: string;
  fee?: number | string;
  code?: number | string;
  message?: string;
  freeTrialInfo?: { start?: number | string; end?: number | string } | null;
}

export interface RawSongUrl {
  code?: number | string;
  data?: RawSongUrlItem[];
}

export interface RawSimilarSongItem {
  resourceId?: number | string;
  resourceType?: string;
  extraMap?: { songId?: number | string };
}

export interface RawSimilarSongs {
  data?: { commonResourceList?: RawSimilarSongItem[] };
  songs?: RawSong[];
}

export interface MusicAvailability {
  available: boolean;
  message: string;
}
