import type { Artist, VideoRef } from "./common";
import type { RawAlbum, RawArtist, RawMv, RawSong } from "./raw";

export interface ArtistPage {
  total?: number;
  more?: boolean;
  artists: Artist[];
}

export interface ArtistDescription {
  briefDesc: string;
  sections: {
    title: string;
    text: string;
  }[];
}

export interface ArtistVideoPage {
  hasMore: boolean;
  videos: VideoRef[];
}

export interface RawArtistDetail {
  artist?: RawArtist;
  hotSongs?: RawSong[];
}

export interface RawArtistHeadInfo {
  data?: RawArtist & { artist?: RawArtist };
  artist?: RawArtist;
}

export interface RawArtistSongs {
  songs?: RawSong[];
}

export interface RawArtistAlbums {
  total?: number | string;
  more?: boolean;
  hotAlbums?: RawAlbum[];
}

export interface RawArtistList {
  total?: number | string;
  artistCount?: number | string;
  more?: boolean;
  artists?: RawArtist[];
}

export interface RawArtistDesc {
  briefDesc?: string;
  introduction?: { ti?: string; tx?: string }[];
}

export interface RawArtistMvs {
  mvs?: RawMv[];
  hasMore?: boolean;
}

export interface RawArtistVideoRecord {
  resource?: {
    mlogBaseData?: {
      id?: number | string;
      text?: string;
      coverUrl?: string;
      duration?: number | string;
      pubTime?: number | string;
    };
    mlogExtVO?: { playCount?: number | string };
  };
}

export interface RawArtistVideos {
  data?: {
    records?: RawArtistVideoRecord[];
    page?: { size?: number | string; cursor?: string; more?: boolean };
  };
  hasMore?: boolean;
}
