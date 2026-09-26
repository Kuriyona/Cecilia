import type {
  Album,
  AlbumRef,
  Artist,
  ArtistRef,
  MvRef,
  PlaylistSummary,
  Song,
  UserRef,
  VideoRef,
} from "../types/common";
import type {
  RawAlbum,
  RawAlbumRef,
  RawArtist,
  RawMv,
  RawNamedRef,
  RawPlaylist,
  RawSong,
  RawUser,
  RawVideo,
} from "../types/raw";
import { num } from "../utils/num";

export const toArtistRef = (raw: RawNamedRef): ArtistRef => ({
  id: num(raw.id) ?? 0,
  name: raw.name ?? "",
});

export const toUserRef = (raw: RawUser): UserRef => ({
  id: num(raw.userId ?? raw.id) ?? 0,
  name: raw.nickname ?? raw.name ?? "",
});

export const toAlbumRef = (raw: RawAlbumRef): AlbumRef => ({
  id: num(raw.id) ?? 0,
  name: raw.name ?? "",
  coverUrl: raw.picUrl ?? raw.coverImgUrl ?? "",
});

/** id/duration 缺失的条目返回 undefined，由调用方丢弃。 */
export const toSong = (raw: RawSong): Song | undefined => {
  const id = num(raw.id);
  const duration = num(raw.dt ?? raw.duration);
  if (id === undefined || duration === undefined) return undefined;
  const album = raw.al ?? raw.album;
  const alias = raw.alia ?? raw.alias;
  const fee = num(raw.fee);
  const state = num(raw.st);
  return {
    id,
    name: raw.name ?? "",
    artists: (raw.ar ?? raw.artists ?? []).map(toArtistRef),
    album: album ? toAlbumRef(album) : { id: 0, name: "", coverUrl: "" },
    duration,
    ...(alias?.length ? { alias } : {}),
    ...(fee !== undefined ? { fee } : {}),
    ...(state !== undefined ? { available: state >= 0 } : {}),
  };
};

export const toSongs = (raws: RawSong[] | undefined): Song[] => {
  const songs: Song[] = [];
  for (const raw of raws ?? []) {
    const song = toSong(raw);
    if (song) songs.push(song);
  }
  return songs;
};

export const toArtist = (raw: RawArtist): Artist => {
  const albumCount = num(raw.albumSize);
  const songCount = num(raw.musicSize);
  const mvCount = num(raw.mvSize);
  const avatarUrl = raw.picUrl ?? raw.img1v1Url ?? raw.avatar;
  return {
    id: num(raw.id) ?? 0,
    name: raw.name ?? "",
    ...(raw.alias?.length ? { alias: raw.alias } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(raw.briefDesc ? { briefDesc: raw.briefDesc } : {}),
    ...(albumCount !== undefined ? { albumCount } : {}),
    ...(songCount !== undefined ? { songCount } : {}),
    ...(mvCount !== undefined ? { mvCount } : {}),
    ...(raw.followed !== undefined ? { followed: raw.followed } : {}),
  };
};

export const toArtists = (raws: RawArtist[] | undefined): Artist[] =>
  (raws ?? []).map(toArtist);

export const toAlbum = (raw: RawAlbum): Album => {
  const publishTime = num(raw.publishTime);
  const size = num(raw.size);
  const description = raw.description ?? raw.desc;
  const artists = raw.artists ?? raw.ar;
  return {
    id: num(raw.id) ?? 0,
    name: raw.name ?? "",
    coverUrl: raw.picUrl ?? raw.coverImgUrl ?? "",
    ...(artists?.length ? { artists: artists.map(toArtistRef) } : {}),
    ...(publishTime !== undefined ? { publishTime } : {}),
    ...(raw.company ? { company: raw.company } : {}),
    ...(description ? { description } : {}),
    ...(size !== undefined ? { size } : {}),
  };
};

export const toAlbums = (raws: RawAlbum[] | undefined): Album[] =>
  (raws ?? []).map(toAlbum);

export const toPlaylistSummary = (raw: RawPlaylist): PlaylistSummary => {
  const trackCount = num(raw.trackCount);
  const playCount = num(raw.playCount);
  const updateTime = num(raw.updateTime);
  return {
    id: num(raw.id) ?? 0,
    name: raw.name ?? "",
    coverUrl: raw.coverImgUrl ?? "",
    ...(trackCount !== undefined ? { trackCount } : {}),
    ...(playCount !== undefined ? { playCount } : {}),
    ...(raw.creator ? { creator: toUserRef(raw.creator) } : {}),
    ...(raw.description ? { description: raw.description } : {}),
    ...(updateTime !== undefined ? { updateTime } : {}),
    ...(raw.tags?.length ? { tags: raw.tags } : {}),
  };
};

export const toPlaylistSummaries = (raws: RawPlaylist[] | undefined): PlaylistSummary[] =>
  (raws ?? []).map(toPlaylistSummary);

export const toMvRef = (raw: RawMv): MvRef => {
  const playCount = num(raw.playCount);
  const duration = num(raw.duration);
  return {
    id: num(raw.id) ?? 0,
    name: raw.name ?? "",
    coverUrl: raw.cover ?? raw.picUrl ?? raw.imgurl16v9 ?? raw.imgurl ?? "",
    ...(playCount !== undefined ? { playCount } : {}),
    ...(duration !== undefined ? { duration } : {}),
    ...(raw.artistName ? { artistName: raw.artistName } : {}),
  };
};

export const toMvRefs = (raws: RawMv[] | undefined): MvRef[] =>
  (raws ?? []).map(toMvRef);

export const toVideoRef = (raw: RawVideo): VideoRef => {
  const playCount = num(raw.playCount);
  const duration = num(raw.duration);
  return {
    id: num(raw.vid ?? raw.id) ?? 0,
    name: raw.title ?? raw.name ?? "",
    coverUrl: raw.coverUrl ?? "",
    ...(playCount !== undefined ? { playCount } : {}),
    ...(duration !== undefined ? { duration } : {}),
    ...(raw.creator ? { creator: toUserRef(raw.creator) } : {}),
  };
};

export const toVideoRefs = (raws: RawVideo[] | undefined): VideoRef[] =>
  (raws ?? []).map(toVideoRef);
