import { request, type RequestOptions } from "../client";
import { NeteaseApiError } from "../errors";
import type {
  SearchMultimatchParams,
  SearchParams,
  SearchSuggestParams,
} from "../types/params";
import type {
  HotSearchGroup,
  HotSearchItem,
  RawDefaultKeyword,
  RawHotSearchDetail,
  RawMultimatchContainer,
  RawSearchContainer,
  RawSearchHot,
  RawSearchResponse,
  SearchRadio,
  SearchResult,
  SearchSuggest,
} from "../types/search";
import { num } from "../utils/num";
import {
  toAlbums,
  toArtistRef,
  toArtists,
  toMvRefs,
  toPlaylistSummaries,
  toSongs,
  toUserRef,
  toVideoRefs,
} from "./adapters";

const URI_SEARCH = "/api/search/get";
const URI_SEARCH_VOICE = "/api/search/voice/get";
const URI_CLOUD_SEARCH = "/api/cloudsearch/pc";
const URI_SEARCH_SUGGEST = "/api/search/suggest/web";
const URI_SEARCH_SUGGEST_KEYWORD = "/api/search/suggest/keyword";
const URI_SEARCH_HOT = "/api/search/hot";
const URI_HOT_SEARCH_DETAIL = "/api/hotsearchlist/get";
const URI_DEFAULT_KEYWORD = "/api/search/defaultkeyword/get";
const URI_SEARCH_MULTIMATCH = "/api/search/suggest/multimatch";

const toSearchResult = (
  raw: RawSearchContainer,
  total?: number,
): SearchResult => {
  const lyrics = raw.lyrics?.map((item) => ({
    id: num(item.id) ?? 0,
    name: item.name ?? "",
    artists: (item.artists ?? []).map(toArtistRef),
  }));
  return {
    ...(raw.songs ? { songs: toSongs(raw.songs) } : {}),
    ...(raw.artists ? { artists: toArtists(raw.artists) } : {}),
    ...(raw.albums ? { albums: toAlbums(raw.albums) } : {}),
    ...(raw.playlists ? { playlists: toPlaylistSummaries(raw.playlists) } : {}),
    ...(raw.userprofiles ? { users: raw.userprofiles.map(toUserRef) } : {}),
    ...(raw.mvs ? { mvs: toMvRefs(raw.mvs) } : {}),
    ...(raw.videos ? { videos: toVideoRefs(raw.videos) } : {}),
    ...(lyrics ? { lyrics } : {}),
    ...(total !== undefined ? { total } : {}),
  };
};

const toVoiceSearchResult = (
  raw: RawSearchResponse,
  status: number,
): SearchResult => {
  const container = raw.result ?? {};
  const songs = container.songs ?? raw.songs;
  if (songs) {
    return toSearchResult(
      { ...container, songs },
      num(container.songCount ?? raw.total),
    );
  }
  const resources = container.resources ?? raw.resources;
  if (resources) {
    const radios: SearchRadio[] = [];
    for (const item of resources) {
      const id = num(item.id ?? item.resourceId);
      if (id === undefined) continue;
      radios.push({
        id,
        name: item.name ?? item.title ?? "",
        coverUrl: item.coverUrl ?? item.picUrl ?? "",
        ...(item.djName ? { djName: item.djName } : {}),
      });
    }
    return { radios };
  }
  throw new NeteaseApiError(URI_SEARCH_VOICE, -1, status, {
    code: -1,
    msg: "响应中既没有 songs 也没有 resources",
  });
};

export const search = async (
  params: SearchParams,
  options?: RequestOptions,
): Promise<SearchResult> => {
  if (params.type === 2000) {
    const voice = await request(
      URI_SEARCH_VOICE,
      {
        keyword: params.keywords,
        scene: "normal",
        limit: params.limit ?? 30,
        offset: params.offset ?? 0,
      },
      "eapi",
      options,
    );
    // 上游响应结构，字段以 docs/probe/search-voice-get.json 为准
    return toVoiceSearchResult(voice.body as RawSearchResponse, voice.status);
  }
  const res = await request(
    URI_SEARCH,
    {
      s: params.keywords,
      type: params.type ?? 1,
      limit: params.limit ?? 30,
      offset: params.offset ?? 0,
    },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/search.json 为准
  const body = res.body as RawSearchResponse;
  const container = body.result ?? {};
  return toSearchResult(
    container,
    num(container.songCount ?? container.albumCount ?? body.total),
  );
};

export const cloudSearch = async (
  params: SearchParams,
  options?: RequestOptions,
): Promise<SearchResult> => {
  const res = await request(
    URI_CLOUD_SEARCH,
    {
      s: params.keywords,
      type: params.type ?? 1,
      limit: params.limit ?? 30,
      offset: params.offset ?? 0,
      total: true,
    },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/cloudsearch-pc.json 为准
  const body = res.body as RawSearchResponse;
  const container = body.result ?? {};
  return toSearchResult(
    container,
    num(container.songCount ?? container.albumCount ?? body.total),
  );
};

export const getSearchSuggest = async (
  params: SearchSuggestParams,
  options?: RequestOptions,
): Promise<SearchSuggest> => {
  const res = await request(
    params.mobile ? URI_SEARCH_SUGGEST_KEYWORD : URI_SEARCH_SUGGEST,
    { s: params.keywords ?? "" },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/search-suggest-web.json 为准
  const container = (res.body as RawSearchResponse).result ?? {};
  return {
    keywords: container.order ?? [],
    songs: toSongs(container.songs),
    artists: toArtists(container.artists),
    albums: toAlbums(container.albums),
  };
};

export const getHotSearches = async (
  options?: RequestOptions,
): Promise<HotSearchGroup[]> => {
  const res = await request(URI_SEARCH_HOT, { type: 1111 }, "eapi", options);
  // 上游响应结构，字段以 docs/probe/search-hot.json 为准
  const body = res.body as RawSearchHot;
  return (body.result?.hots ?? []).map((item) => ({
    first: item.first ?? "",
    ...(item.second !== undefined && item.second !== null
      ? { second: item.second }
      : {}),
    ...(typeof item.third === "string" ? { third: item.third } : {}),
  }));
};

export const getHotSearchDetail = async (
  options?: RequestOptions,
): Promise<HotSearchItem[]> => {
  const res = await request(URI_HOT_SEARCH_DETAIL, {}, "weapi", options);
  // 上游响应结构，字段以 docs/probe/hotsearchlist-get.json 为准
  const body = res.body as RawHotSearchDetail;
  return (body.data ?? []).map((item, index) => ({
    keyword: item.searchWord ?? "",
    position: num(item.position) ?? index + 1,
    ...(item.content ? { content: item.content } : {}),
    ...(item.iconUrl ? { iconUrl: item.iconUrl } : {}),
  }));
};

export const getDefaultSearchKeyword = async (
  options?: RequestOptions,
): Promise<string> => {
  const res = await request(URI_DEFAULT_KEYWORD, {}, "eapi", options);
  // 上游响应结构，字段以 docs/probe/search-defaultkeyword-get.json 为准
  const body = res.body as RawDefaultKeyword;
  return body.data?.realkeyword ?? body.data?.showKeyword ?? "";
};

export const searchMultimatch = async (
  params: SearchMultimatchParams,
  options?: RequestOptions,
): Promise<SearchResult> => {
  const res = await request(
    URI_SEARCH_MULTIMATCH,
    { type: params.type ?? 1, s: params.keywords ?? "" },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/search-suggest-multimatch.json 为准
  const body = res.body as { result?: RawMultimatchContainer };
  const container = body.result ?? {};
  const songs = container.songs ?? container.song;
  const artists = container.artists ?? container.artist;
  const albums = container.albums ?? container.album;
  const playlists = container.playlists ?? container.playlist;
  return {
    ...(songs ? { songs: toSongs(songs) } : {}),
    ...(artists ? { artists: toArtists(artists) } : {}),
    ...(albums ? { albums: toAlbums(albums) } : {}),
    ...(playlists ? { playlists: toPlaylistSummaries(playlists) } : {}),
  };
};
