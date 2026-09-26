import { request, type RequestOptions } from "../client";
import type {
  ArtistAlbumsParams,
  ArtistListParams,
  ArtistMvsParams,
  ArtistSongsParams,
  ArtistVideosParams,
} from "../types/params";
import type {
  ArtistDescription,
  ArtistPage,
  ArtistVideoPage,
  RawArtistAlbums,
  RawArtistDesc,
  RawArtistDetail,
  RawArtistHeadInfo,
  RawArtistList,
  RawArtistMvs,
  RawArtistSongs,
  RawArtistVideos,
} from "../types/artist";
import type { AlbumPage } from "../types/album";
import type { Artist, MvRef, Song, VideoRef } from "../types/common";
import { num } from "../utils/num";
import {
  toAlbums,
  toArtist,
  toArtists,
  toMvRefs,
  toSongs,
  toVideoRefs,
} from "./adapters";
import { requireField } from "./require";

const URI_ARTIST = "/api/v1/artist";
const URI_ARTIST_HEAD_INFO = "/api/artist/head/info/get";
const URI_ARTIST_SONGS = "/api/v1/artist/songs";
const URI_ARTIST_TOP_SONG = "/api/artist/top/song";
const URI_ARTIST_ALBUMS = "/api/artist/albums";
const URI_ARTIST_LIST = "/api/v1/artist/list";
const URI_ARTIST_INTRO = "/api/artist/introduction";
const URI_ARTIST_MVS = "/api/artist/mvs";
const URI_ARTIST_VIDEO = "/api/mlog/artist/video";

const toArtistInitial = (
  value: string | number | undefined,
): string | number | undefined => {
  if (typeof value !== "string" || !Number.isNaN(Number(value))) return value;
  return value.toUpperCase().charCodeAt(0) || undefined;
};

export const getArtist = async (
  id: number,
  options?: RequestOptions,
): Promise<Artist> => {
  const uri = `${URI_ARTIST}/${id}`;
  const res = await request(uri, {}, "weapi", options);
  // 上游响应结构，字段以 docs/probe/v1-artist.json 为准
  const body = res.body as RawArtistDetail;
  const artist = toArtist(requireField(body.artist, uri, res.status, "artist"));
  return {
    ...artist,
    ...(body.hotSongs ? { topSongs: toSongs(body.hotSongs) } : {}),
  };
};

export const getArtistDetail = async (
  id: number,
  options?: RequestOptions,
): Promise<Artist> => {
  const res = await request(URI_ARTIST_HEAD_INFO, { id }, "eapi", options);
  // 上游响应结构，字段以 docs/probe/artist-head-info-get.json 为准
  const body = res.body as RawArtistHeadInfo;
  const raw =
    body.data?.artist ??
    body.data ??
    requireField(body.artist, URI_ARTIST_HEAD_INFO, res.status, "artist");
  return toArtist(raw);
};

export const getArtistSongs = async (
  params: ArtistSongsParams,
  options?: RequestOptions,
): Promise<Song[]> => {
  const res = await request(
    URI_ARTIST_SONGS,
    {
      id: params.id,
      private_cloud: "true",
      work_type: 1,
      order: params.order ?? "hot",
      offset: params.offset ?? 0,
      limit: params.limit ?? 100,
    },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/v1-artist-songs.json 为准
  const body = res.body as RawArtistSongs;
  return toSongs(body.songs);
};

export const getArtistTopSongs = async (
  id: number,
  options?: RequestOptions,
): Promise<Song[]> => {
  const res = await request(URI_ARTIST_TOP_SONG, { id }, "weapi", options);
  // 上游响应结构，字段以 docs/probe/artist-top-song.json 为准
  const body = res.body as RawArtistSongs;
  return toSongs(body.songs);
};

export const getArtistAlbums = async (
  params: ArtistAlbumsParams,
  options?: RequestOptions,
): Promise<AlbumPage> => {
  const uri = `${URI_ARTIST_ALBUMS}/${params.id}`;
  const res = await request(
    uri,
    { limit: params.limit ?? 30, offset: params.offset ?? 0, total: true },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/artist-albums.json 为准
  const body = res.body as RawArtistAlbums;
  const total = num(body.total);
  return {
    ...(total !== undefined ? { total } : {}),
    ...(body.more !== undefined ? { more: body.more } : {}),
    albums: toAlbums(body.hotAlbums),
  };
};

export const getArtistList = async (
  params: ArtistListParams,
  options?: RequestOptions,
): Promise<ArtistPage> => {
  const res = await request(
    URI_ARTIST_LIST,
    {
      initial: toArtistInitial(params.initial),
      offset: params.offset ?? 0,
      limit: params.limit ?? 30,
      total: true,
      type: params.type ?? "1",
      area: params.area,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/v1-artist-list.json 为准
  const body = res.body as RawArtistList;
  const total = num(body.total ?? body.artistCount);
  return {
    ...(total !== undefined ? { total } : {}),
    ...(body.more !== undefined ? { more: body.more } : {}),
    artists: toArtists(body.artists),
  };
};

export const getArtistDesc = async (
  id: number,
  options?: RequestOptions,
): Promise<ArtistDescription> => {
  const res = await request(URI_ARTIST_INTRO, { id }, "weapi", options);
  // 上游响应结构，字段以 docs/probe/artist-introduction.json 为准
  const body = res.body as RawArtistDesc;
  return {
    briefDesc: body.briefDesc ?? "",
    sections: (body.introduction ?? []).map((item) => ({
      title: item.ti ?? "",
      text: item.tx ?? "",
    })),
  };
};

export const getArtistMvs = async (
  params: ArtistMvsParams,
  options?: RequestOptions,
): Promise<MvRef[]> => {
  const res = await request(
    URI_ARTIST_MVS,
    {
      artistId: params.id,
      limit: params.limit,
      offset: params.offset,
      total: true,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/artist-mvs.json 为准
  const body = res.body as RawArtistMvs;
  return toMvRefs(body.mvs);
};

export const getArtistVideos = async (
  params: ArtistVideosParams,
  options?: RequestOptions,
): Promise<ArtistVideoPage> => {
  const res = await request(
    URI_ARTIST_VIDEO,
    {
      artistId: params.id,
      page: JSON.stringify({
        size: params.size ?? 10,
        cursor: params.cursor ?? 0,
      }),
      tab: 0,
      order: params.order ?? 0,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/mlog-artist-video.json 为准
  const body = res.body as RawArtistVideos;
  const data = body.data ?? {};
  const videos: VideoRef[] = [];
  for (const record of data.records ?? []) {
    const base = record.resource?.mlogBaseData;
    const id = num(base?.id);
    if (id === undefined) continue;
    const playCount = num(record.resource?.mlogExtVO?.playCount);
    const duration = num(base?.duration);
    videos.push({
      id,
      name: base?.text ?? "",
      coverUrl: base?.coverUrl ?? "",
      ...(playCount !== undefined ? { playCount } : {}),
      ...(duration !== undefined ? { duration } : {}),
    });
  }
  return { hasMore: data.page?.more ?? body.hasMore ?? false, videos };
};
