import { request, type RequestOptions } from "../client";
import { NeteaseApiError } from "../errors";
import type {
  PlaylistCategory,
  PlaylistDetail,
  PlaylistPage,
  PlaylistStats,
  PlaylistTag,
  RawHighQualityTags,
  RawPlaylistCatalogue,
  RawPlaylistDetails,
  RawPlaylistList,
  RawPlaylistStats,
} from "../types/PlaylistDetail";
import type {
  HighQualityPlaylistsParams,
  PlaylistTracksParams,
  TopPlaylistsParams,
} from "../types/params";
import type { PlaylistSummary, Song } from "../types/common";
import { WEAPI_DOMAIN } from "../crypto";
import { getText } from "../http";
import { num } from "../utils/num";
import { parseRelatedPlaylists } from "../utils/parseRelatedPlaylists";
import { toPlaylistSummaries } from "./adapters";
import { getSongsDetail } from "./song";

const URI_PLAYLIST_DETAIL = "/api/v6/playlist/detail";
const URI_PLAYLIST_DYNAMIC = "/api/playlist/detail/dynamic";
const URI_HIGH_QUALITY_TAGS = "/api/playlist/highquality/tags";
const URI_PLAYLIST_LIST = "/api/playlist/list";
const URI_HIGH_QUALITY_LIST = "/api/playlist/highquality/list";
const URI_PLAYLIST_CATALOGUE = "/api/playlist/catalogue";

export const getPlaylistDetail = async (
  id: number,
  options?: RequestOptions,
): Promise<PlaylistDetail> => {
  const res = await request(
    URI_PLAYLIST_DETAIL,
    { id, n: 100000, s: 8 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/v6-playlist-detail.json 为准
  const { playlist } = res.body as RawPlaylistDetails;
  const songs: PlaylistDetail["songs"] = [];
  for (const track of playlist.trackIds ?? []) {
    const trackId = num(track.id);
    const addTime = num(track.at);
    if (trackId === undefined || addTime === undefined) continue;
    songs.push({ id: trackId, addTime });
  }
  return {
    id: num(playlist.id) ?? 0,
    name: playlist.name ?? "",
    creatorId: num(playlist.userId) ?? 0,
    coverUrl: playlist.coverImgUrl ?? "",
    createTime: num(playlist.createTime) ?? 0,
    songs,
  };
};

export const getPlaylistTracks = async (
  params: PlaylistTracksParams,
  options?: RequestOptions,
): Promise<Song[]> => {
  const res = await request(
    URI_PLAYLIST_DETAIL,
    { id: params.id, n: 100000, s: 8 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/v6-playlist-detail.json 为准
  const { playlist } = res.body as RawPlaylistDetails;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 1000;
  const ids: number[] = [];
  for (const track of (playlist.trackIds ?? []).slice(offset, offset + limit)) {
    const trackId = num(track.id);
    if (trackId !== undefined) ids.push(trackId);
  }
  return getSongsDetail(ids, options);
};

export const getPlaylistDetailDynamic = async (
  id: number,
  options?: RequestOptions,
): Promise<PlaylistStats> => {
  const res = await request(
    URI_PLAYLIST_DYNAMIC,
    { id, n: 100000, s: 8 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/playlist-detail-dynamic.json 为准
  const body = res.body as RawPlaylistStats;
  const commentCount = num(body.commentCount);
  const shareCount = num(body.shareCount);
  const playCount = num(body.playCount);
  const subscribedCount = num(body.subscribedCount);
  const playedCount = num(body.playedCount);
  return {
    ...(commentCount !== undefined ? { commentCount } : {}),
    ...(shareCount !== undefined ? { shareCount } : {}),
    ...(playCount !== undefined ? { playCount } : {}),
    ...(subscribedCount !== undefined ? { subscribedCount } : {}),
    ...(playedCount !== undefined ? { playedCount } : {}),
  };
};

export const getHighQualityTags = async (
  options?: RequestOptions,
): Promise<PlaylistTag[]> => {
  const res = await request(URI_HIGH_QUALITY_TAGS, {}, "weapi", options);
  // 上游响应结构，字段以 docs/probe/playlist-highquality-tags.json 为准
  const body = res.body as RawHighQualityTags;
  return (body.tags ?? []).map((tag) => ({
    name: tag.name ?? "",
    hot: tag.hot ?? false,
  }));
};

const toPlaylistPage = (body: RawPlaylistList): PlaylistPage => {
  const total = num(body.total);
  return {
    ...(total !== undefined ? { total } : {}),
    ...(body.more !== undefined ? { more: body.more } : {}),
    playlists: toPlaylistSummaries(body.playlists),
  };
};

export const getTopPlaylists = async (
  params: TopPlaylistsParams,
  options?: RequestOptions,
): Promise<PlaylistPage> => {
  const res = await request(
    URI_PLAYLIST_LIST,
    {
      cat: params.cat ?? "全部",
      order: params.order ?? "hot",
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      total: true,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/playlist-list.json 为准
  return toPlaylistPage(res.body as RawPlaylistList);
};

export const getHighQualityPlaylists = async (
  params: HighQualityPlaylistsParams,
  options?: RequestOptions,
): Promise<PlaylistPage> => {
  const res = await request(
    URI_HIGH_QUALITY_LIST,
    {
      cat: params.cat ?? "全部",
      limit: params.limit ?? 50,
      lasttime: params.before ?? 0,
      total: true,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/playlist-highquality-list.json 为准
  return toPlaylistPage(res.body as RawPlaylistList);
};

export const getPlaylistCategories = async (
  options?: RequestOptions,
): Promise<PlaylistCategory[]> => {
  const res = await request(URI_PLAYLIST_CATALOGUE, {}, "eapi", options);
  // 上游响应结构，字段以 docs/probe/playlist-catalogue.json 为准
  const body = res.body as RawPlaylistCatalogue;
  const categories = body.categories ?? {};
  const sub = body.sub ?? [];
  return Object.keys(categories)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => {
      const category = Number(key);
      return {
        name: categories[key] ?? "",
        subcategories: sub
          .filter((item) => num(item.category) === category)
          .map((item) => ({ name: item.name ?? "", category })),
      };
    });
};

export const getRelatedPlaylists = async (
  id: number,
  options?: RequestOptions,
): Promise<PlaylistSummary[]> => {
  const url = `${WEAPI_DOMAIN}/playlist?id=${id}`;
  const res = await getText(url, options?.timeout ?? 10_000);
  if (res.status !== 200) {
    throw new NeteaseApiError(url, -1, res.status, { code: -1, msg: res.text.slice(0, 200) });
  }
  const playlists = parseRelatedPlaylists(res.text);
  if (playlists.length === 0 || playlists.some((item) => !item.coverUrl)) {
    throw new NeteaseApiError(url, -1, res.status, {
      code: -1,
      msg: "相关歌单页面结构可能已变化",
    });
  }
  return playlists;
};
