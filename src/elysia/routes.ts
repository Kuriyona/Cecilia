import { t, type AnyElysia } from "elysia";
import {
  checkMusic,
  cloudSearch,
  getAlbum,
  getAlbumDynamic,
  getAlbumList,
  getAlbumPrivileges,
  getAlbumProduct,
  getAlbumSaleBoard,
  getArtist,
  getArtistAlbums,
  getArtistDesc,
  getArtistDetail,
  getArtistList,
  getArtistMvs,
  getArtistSongs,
  getArtistTopSongs,
  getArtistVideos,
  getDefaultSearchKeyword,
  getHighQualityPlaylists,
  getHighQualityTags,
  getHotSearchDetail,
  getHotSearches,
  getLyric,
  getLyricNew,
  getNewestAlbums,
  getPlaylistCategories,
  getPlaylistDetail,
  getPlaylistDetailDynamic,
  getPlaylistTracks,
  getRelatedPlaylists,
  getSearchSuggest,
  getSimilarSongs,
  getSongUrl,
  getSongsDetail,
  getTopPlaylists,
  search,
  searchMultimatch,
} from "../index";
import type { RequestOptions } from "../client";
import type {
  AlbumSaleBoardParams,
  ArtistSongsParams,
  TopPlaylistsParams,
} from "../types/params";
import type { SearchType } from "../types/search";

/** 入站 Cookie 原样转发给上游，会员态由调用方自带。 */
const optionsOf = (request: Request): RequestOptions | undefined => {
  const cookie = request.headers.get("cookie");
  return cookie === null ? undefined : { cookie };
};

/** 逗号分隔的数字 id 列表，`1,2,3`。 */
const idListSchema = t.String({ pattern: "^[0-9]+(,[0-9]+)*$" });

const idsOf = (value: string): number[] => value.split(",").map(Number);

const pagingSchema = {
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
};

/** 与 src/types/search.ts 的 SearchType 保持同步。 */
const SEARCH_TYPES = [
  1, 10, 100, 1000, 1002, 1004, 1006, 1009, 1014, 2000,
] as const satisfies readonly SearchType[];

const searchTypeOf = (value: number | undefined): SearchType | undefined =>
  value === undefined
    ? undefined
    : SEARCH_TYPES.find((candidate) => candidate === value);

/** 白名单外的取值返回 undefined，由调用方回 400。 */
const pickEnum = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined =>
  value === undefined
    ? undefined
    : allowed.find((candidate) => candidate === value);

const invalidEnum = (field: string, allowed: readonly (string | number)[]) => ({
  code: 400,
  message: `${field} 只支持 ${allowed.join(" / ")}`,
});

const TOP_PLAYLIST_ORDERS = [
  "hot",
  "new",
] as const satisfies readonly NonNullable<TopPlaylistsParams["order"]>[];

const ARTIST_SONG_ORDERS = [
  "hot",
  "time",
] as const satisfies readonly NonNullable<ArtistSongsParams["order"]>[];

const ALBUM_SALE_TYPES = [
  "daily",
  "week",
  "year",
  "total",
] as const satisfies readonly NonNullable<AlbumSaleBoardParams["type"]>[];

const ALBUM_TYPES = ["0", "1"] as const;

/** Query 里 `albumType` 是字符串，窄化回 0 | 1。 */
const albumTypeOf = (value: "0" | "1" | undefined): 0 | 1 | undefined =>
  value === undefined ? undefined : value === "0" ? 0 : 1;

const searchRoutes = (app: AnyElysia): AnyElysia =>
  app
    .get(
      "/search",
      ({ query, request, set }) => {
        const type = searchTypeOf(query.type);
        if (query.type !== undefined && type === undefined) {
          set.status = 400;
          return invalidEnum("type", SEARCH_TYPES);
        }
        return search(
          {
            keywords: query.keywords,
            type,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          keywords: t.String({ minLength: 1 }),
          type: t.Optional(t.Numeric()),
          ...pagingSchema,
        }),
      },
    )
    .get(
      "/cloudsearch",
      ({ query, request, set }) => {
        const type = searchTypeOf(query.type);
        if (query.type !== undefined && type === undefined) {
          set.status = 400;
          return invalidEnum("type", SEARCH_TYPES);
        }
        return cloudSearch(
          {
            keywords: query.keywords,
            type,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          keywords: t.String({ minLength: 1 }),
          type: t.Optional(t.Numeric()),
          ...pagingSchema,
        }),
      },
    )
    .get(
      "/search/suggest",
      ({ query, request }) =>
        getSearchSuggest(
          { keywords: query.keywords, mobile: query.mobile },
          optionsOf(request),
        ),
      {
        query: t.Object({
          keywords: t.Optional(t.String()),
          mobile: t.Optional(t.BooleanString()),
        }),
      },
    )
    .get("/search/hot", ({ request }) => getHotSearches(optionsOf(request)))
    .get("/search/hot/detail", ({ request }) =>
      getHotSearchDetail(optionsOf(request)),
    )
    .get("/search/default-keyword", ({ request }) =>
      getDefaultSearchKeyword(optionsOf(request)),
    )
    .get(
      "/search/multimatch",
      ({ query, request, set }) => {
        const type = searchTypeOf(query.type);
        if (query.type !== undefined && type === undefined) {
          set.status = 400;
          return invalidEnum("type", SEARCH_TYPES);
        }
        return searchMultimatch(
          { keywords: query.keywords, type },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          keywords: t.Optional(t.String()),
          type: t.Optional(t.Numeric()),
        }),
      },
    );

const songRoutes = (app: AnyElysia): AnyElysia =>
  app
    .get(
      "/song/detail",
      ({ query, request }) =>
        getSongsDetail(idsOf(query.ids), optionsOf(request)),
      { query: t.Object({ ids: idListSchema }) },
    )
    .get(
      "/song/url",
      ({ query, request }) =>
        getSongUrl({ id: idsOf(query.id), br: query.br }, optionsOf(request)),
      {
        query: t.Object({ id: idListSchema, br: t.Optional(t.Numeric()) }),
      },
    )
    .get(
      "/lyric",
      ({ query, request }) => getLyric(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/lyric/new",
      ({ query, request }) => getLyricNew(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/check/music",
      ({ query, request }) =>
        checkMusic({ id: query.id, br: query.br }, optionsOf(request)),
      {
        query: t.Object({ id: t.Numeric(), br: t.Optional(t.Numeric()) }),
      },
    )
    .get(
      "/simi/song",
      ({ query, request }) => getSimilarSongs(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    );

const playlistRoutes = (app: AnyElysia): AnyElysia =>
  app
    .get(
      "/playlist/detail",
      ({ query, request }) => getPlaylistDetail(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/playlist/track/all",
      ({ query, request }) =>
        getPlaylistTracks(
          { id: query.id, limit: query.limit, offset: query.offset },
          optionsOf(request),
        ),
      { query: t.Object({ id: t.Numeric(), ...pagingSchema }) },
    )
    .get(
      "/playlist/detail/dynamic",
      ({ query, request }) =>
        getPlaylistDetailDynamic(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get("/playlist/highquality/tags", ({ request }) =>
      getHighQualityTags(optionsOf(request)),
    )
    .get(
      "/playlist/top",
      ({ query, request, set }) => {
        const order = pickEnum(query.order, TOP_PLAYLIST_ORDERS);
        if (query.order !== undefined && order === undefined) {
          set.status = 400;
          return invalidEnum("order", TOP_PLAYLIST_ORDERS);
        }
        return getTopPlaylists(
          {
            cat: query.cat,
            order,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          cat: t.Optional(t.String()),
          order: t.Optional(t.String()),
          ...pagingSchema,
        }),
      },
    )
    .get(
      "/playlist/highquality/list",
      ({ query, request }) =>
        getHighQualityPlaylists(
          { cat: query.cat, limit: query.limit, before: query.before },
          optionsOf(request),
        ),
      {
        query: t.Object({
          cat: t.Optional(t.String()),
          limit: t.Optional(t.Numeric()),
          before: t.Optional(t.Numeric()),
        }),
      },
    )
    .get("/playlist/catalogue", ({ request }) =>
      getPlaylistCategories(optionsOf(request)),
    )
    .get(
      "/playlist/related",
      ({ query, request }) => getRelatedPlaylists(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    );

const artistRoutes = (app: AnyElysia): AnyElysia =>
  app
    .get(
      "/artist",
      ({ query, request }) => getArtist(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/artist/detail",
      ({ query, request }) => getArtistDetail(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/artist/songs",
      ({ query, request, set }) => {
        const order = pickEnum(query.order, ARTIST_SONG_ORDERS);
        if (query.order !== undefined && order === undefined) {
          set.status = 400;
          return invalidEnum("order", ARTIST_SONG_ORDERS);
        }
        return getArtistSongs(
          {
            id: query.id,
            order,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          id: t.Numeric(),
          order: t.Optional(t.String()),
          ...pagingSchema,
        }),
      },
    )
    .get(
      "/artist/top/song",
      ({ query, request }) => getArtistTopSongs(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/artist/album",
      ({ query, request }) =>
        getArtistAlbums(
          { id: query.id, limit: query.limit, offset: query.offset },
          optionsOf(request),
        ),
      { query: t.Object({ id: t.Numeric(), ...pagingSchema }) },
    )
    .get(
      "/artist/list",
      ({ query, request }) =>
        getArtistList(
          {
            area: query.area,
            type: query.type,
            initial: query.initial,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        ),
      {
        query: t.Object({
          area: t.Optional(t.Numeric()),
          type: t.Optional(t.Numeric()),
          initial: t.Optional(t.String()),
          ...pagingSchema,
        }),
      },
    )
    .get(
      "/artist/desc",
      ({ query, request }) => getArtistDesc(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/artist/mv",
      ({ query, request }) =>
        getArtistMvs(
          { id: query.id, limit: query.limit, offset: query.offset },
          optionsOf(request),
        ),
      { query: t.Object({ id: t.Numeric(), ...pagingSchema }) },
    )
    .get(
      "/artist/video",
      ({ query, request }) =>
        getArtistVideos(
          {
            id: query.id,
            size: query.size,
            cursor: query.cursor,
            order: query.order,
          },
          optionsOf(request),
        ),
      {
        query: t.Object({
          id: t.Numeric(),
          size: t.Optional(t.Numeric()),
          cursor: t.Optional(t.Numeric()),
          order: t.Optional(t.Numeric()),
        }),
      },
    );

const albumRoutes = (app: AnyElysia): AnyElysia =>
  app
    .get(
      "/album",
      ({ query, request }) => getAlbum(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/album/product",
      ({ query, request }) => getAlbumProduct(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/album/dynamic",
      ({ query, request }) => getAlbumDynamic(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/album/sale/board",
      ({ query, request, set }) => {
        const albumType = pickEnum(query.albumType, ALBUM_TYPES);
        if (query.albumType !== undefined && albumType === undefined) {
          set.status = 400;
          return invalidEnum("albumType", ALBUM_TYPES);
        }
        const type = pickEnum(query.type, ALBUM_SALE_TYPES);
        if (query.type !== undefined && type === undefined) {
          set.status = 400;
          return invalidEnum("type", ALBUM_SALE_TYPES);
        }
        return getAlbumSaleBoard(
          {
            albumType: albumTypeOf(albumType),
            type,
            year: query.year,
          },
          optionsOf(request),
        );
      },
      {
        query: t.Object({
          albumType: t.Optional(t.String()),
          type: t.Optional(t.String()),
          year: t.Optional(t.Numeric()),
        }),
      },
    )
    .get(
      "/album/privilege",
      ({ query, request }) => getAlbumPrivileges(query.id, optionsOf(request)),
      { query: t.Object({ id: t.Numeric() }) },
    )
    .get(
      "/album/list",
      ({ query, request }) =>
        getAlbumList(
          {
            area: query.area,
            type: query.type,
            limit: query.limit,
            offset: query.offset,
          },
          optionsOf(request),
        ),
      {
        query: t.Object({
          area: t.Optional(t.String()),
          type: t.Optional(t.String()),
          ...pagingSchema,
        }),
      },
    )
    .get("/album/new", ({ request }) => getNewestAlbums(optionsOf(request)));

/** 37 个函数各一条 GET 路由，按 搜索 / 歌曲 / 歌单 / 歌手 / 专辑 依次注册。 */
export const registerRoutes = (app: AnyElysia): AnyElysia =>
  albumRoutes(artistRoutes(playlistRoutes(songRoutes(searchRoutes(app)))));
