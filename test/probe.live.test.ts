import { mkdirSync, writeFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { request, type Crypto } from "../src/client";
import { getRelatedPlaylists } from "../src/apis/playlist";
import { getPlaylistTracks } from "../src/apis/playlist";
import { search } from "../src/apis/search";

const PROBE_DIR = "docs/probe";
const ARTIST_HOYO_MIX = 12487174;
const ARTIST_CHEVY = 47992679;

let playlistId = 0;
let albumId = 0;
let productAlbumId = 0;
let topSongId = 0;

const writeDump = (name: string, content: string, ext: string): void => {
  writeFileSync(`${PROBE_DIR}/${name}.${ext}`, content);
};

const codeOf = (body: unknown): unknown => {
  if (typeof body !== "object" || body === null || !("code" in body)) {
    return undefined;
  }
  return body.code;
};

const probeRaw = async (
  name: string,
  uri: string,
  data: Record<string, unknown>,
  crypto: Crypto,
): Promise<unknown> => {
  try {
    const res = await request(uri, data, crypto);
    writeDump(name, JSON.stringify(res.body, null, 2), "json");
    expect(codeOf(res.body)).toBe(200);
    return res.body;
  } catch (error) {
    writeDump(
      name,
      `${new Date().toISOString()}\n${String(error)}\n${JSON.stringify(
        error instanceof Error && "body" in error ? error.body : undefined,
        null,
        2,
      )}\n`,
      "error.txt",
    );
    throw error;
  }
};

type ProbeSpec = {
  name: string;
  build: () => { uri: string; data: Record<string, unknown>; crypto: Crypto };
};

const RAW_PROBES: ProbeSpec[] = [
  {
    name: "search",
    build: () => ({
      uri: "/api/search/get",
      data: { s: "HoYo-MiX", type: 1, limit: 30, offset: 0 },
      crypto: "eapi",
    }),
  },
  {
    name: "cloudsearch-pc",
    build: () => ({
      uri: "/api/cloudsearch/pc",
      data: { s: "HoYo-MiX", type: 1, limit: 30, offset: 0, total: true },
      crypto: "eapi",
    }),
  },
  {
    name: "search-suggest-web",
    build: () => ({
      uri: "/api/search/suggest/web",
      data: { s: "HoYo" },
      crypto: "weapi",
    }),
  },
  {
    name: "search-hot",
    build: () => ({
      uri: "/api/search/hot",
      data: { type: 1111 },
      crypto: "eapi",
    }),
  },
  {
    name: "hotsearchlist-get",
    build: () => ({
      uri: "/api/hotsearchlist/get",
      data: {},
      crypto: "weapi",
    }),
  },
  {
    name: "search-defaultkeyword-get",
    build: () => ({
      uri: "/api/search/defaultkeyword/get",
      data: {},
      crypto: "eapi",
    }),
  },
  {
    name: "search-suggest-multimatch",
    build: () => ({
      uri: "/api/search/suggest/multimatch",
      data: { type: 1, s: "HoYo-MiX" },
      crypto: "weapi",
    }),
  },
  {
    name: "v3-song-detail",
    build: () => ({
      uri: "/api/v3/song/detail",
      data: { c: `[{"id":${topSongId}}]` },
      crypto: "weapi",
    }),
  },
  {
    name: "song-enhance-player-url",
    build: () => ({
      uri: "/api/song/enhance/player/url",
      data: { ids: JSON.stringify([String(topSongId)]), br: 999000 },
      crypto: "eapi",
    }),
  },
  {
    name: "check-music",
    build: () => ({
      uri: "/api/song/enhance/player/url",
      data: { ids: `[${topSongId}]`, br: 999000 },
      crypto: "weapi",
    }),
  },
  {
    name: "song-lyric",
    build: () => ({
      uri: "/api/song/lyric",
      data: { id: topSongId, tv: -1, lv: -1, rv: -1, kv: -1, _nmclfl: 1 },
      crypto: "eapi",
    }),
  },
  {
    name: "song-lyric-v1",
    build: () => ({
      uri: "/api/song/lyric/v1",
      data: {
        id: topSongId,
        cp: false,
        tv: 0,
        lv: 0,
        rv: 0,
        kv: 0,
        yv: 0,
        ytv: 0,
        yrv: 0,
      },
      crypto: "eapi",
    }),
  },
  {
    name: "simi-song",
    build: () => ({
      uri: "/api/link/position/show/resource",
      data: {
        positionCode: "toolBarRcmdSong",
        resourceId: topSongId,
        resourceType: "song",
      },
      crypto: "eapi",
    }),
  },
  {
    name: "v6-playlist-detail",
    build: () => ({
      uri: "/api/v6/playlist/detail",
      data: { id: playlistId, n: 100000, s: 8 },
      crypto: "eapi",
    }),
  },
  {
    name: "playlist-detail-dynamic",
    build: () => ({
      uri: "/api/playlist/detail/dynamic",
      data: { id: playlistId, n: 100000, s: 8 },
      crypto: "eapi",
    }),
  },
  {
    name: "playlist-highquality-tags",
    build: () => ({
      uri: "/api/playlist/highquality/tags",
      data: {},
      crypto: "weapi",
    }),
  },
  {
    name: "playlist-list",
    build: () => ({
      uri: "/api/playlist/list",
      data: {
        cat: "全部",
        order: "hot",
        limit: 5,
        offset: 0,
        total: true,
      },
      crypto: "weapi",
    }),
  },
  {
    name: "playlist-highquality-list",
    build: () => ({
      uri: "/api/playlist/highquality/list",
      data: { cat: "全部", limit: 5, lasttime: 0, total: true },
      crypto: "weapi",
    }),
  },
  {
    name: "playlist-catalogue",
    build: () => ({
      uri: "/api/playlist/catalogue",
      data: {},
      crypto: "eapi",
    }),
  },
  {
    name: "v1-artist",
    build: () => ({
      uri: `/api/v1/artist/${ARTIST_HOYO_MIX}`,
      data: {},
      crypto: "weapi",
    }),
  },
  {
    name: "artist-head-info-get",
    build: () => ({
      uri: "/api/artist/head/info/get",
      data: { id: ARTIST_HOYO_MIX },
      crypto: "eapi",
    }),
  },
  {
    name: "v1-artist-songs",
    build: () => ({
      uri: "/api/v1/artist/songs",
      data: {
        id: ARTIST_CHEVY,
        private_cloud: "true",
        work_type: 1,
        order: "hot",
        offset: 0,
        limit: 5,
      },
      crypto: "eapi",
    }),
  },
  {
    name: "artist-top-song",
    build: () => ({
      uri: "/api/artist/top/song",
      data: { id: ARTIST_HOYO_MIX },
      crypto: "weapi",
    }),
  },
  {
    name: "artist-albums",
    build: () => ({
      uri: `/api/artist/albums/${ARTIST_HOYO_MIX}`,
      data: { limit: 5, offset: 0, total: true },
      crypto: "weapi",
    }),
  },
  {
    name: "v1-artist-list",
    build: () => ({
      uri: "/api/v1/artist/list",
      data: { initial: undefined, offset: 0, limit: 5, total: true, type: 1, area: -1 },
      crypto: "weapi",
    }),
  },
  {
    name: "artist-introduction",
    build: () => ({
      uri: "/api/artist/introduction",
      data: { id: ARTIST_HOYO_MIX },
      crypto: "weapi",
    }),
  },
  {
    name: "artist-mvs",
    build: () => ({
      uri: "/api/artist/mvs",
      data: { artistId: ARTIST_HOYO_MIX, limit: 5, offset: 0, total: true },
      crypto: "weapi",
    }),
  },
  {
    name: "mlog-artist-video",
    build: () => ({
      uri: "/api/mlog/artist/video",
      data: {
        artistId: ARTIST_HOYO_MIX,
        page: JSON.stringify({ size: 5, cursor: 0 }),
        tab: 0,
        order: 0,
      },
      crypto: "weapi",
    }),
  },
  {
    name: "v1-album",
    build: () => ({
      uri: `/api/v1/album/${albumId}`,
      data: {},
      crypto: "weapi",
    }),
  },
  {
    name: "vipmall-albumproduct-detail",
    build: () => ({
      uri: "/api/vipmall/albumproduct/detail",
      data: { id: productAlbumId },
      crypto: "weapi",
    }),
  },
  {
    name: "album-detail-dynamic",
    build: () => ({
      uri: "/api/album/detail/dynamic",
      data: { id: albumId },
      crypto: "weapi",
    }),
  },
  {
    name: "feealbum-songsaleboard-daily-type",
    build: () => ({
      uri: "/api/feealbum/songsaleboard/daily/type",
      data: { albumType: 0 },
      crypto: "weapi",
    }),
  },
  {
    name: "album-privilege",
    build: () => ({
      uri: "/api/album/privilege",
      data: { id: albumId },
      crypto: "eapi",
    }),
  },
  {
    name: "vipmall-albumproduct-list",
    build: () => ({
      uri: "/api/vipmall/albumproduct/list",
      data: { limit: 5, offset: 0, total: true, area: "ALL" },
      crypto: "weapi",
    }),
  },
  {
    name: "discovery-newalbum",
    build: () => ({
      uri: "/api/discovery/newAlbum",
      data: {},
      crypto: "weapi",
    }),
  },
];

describe("probe", () => {
  beforeAll(async () => {
    mkdirSync(PROBE_DIR, { recursive: true });
    const playlists = await search({ keywords: "HoYo-MiX", type: 1000 });
    playlistId = playlists.playlists?.[0]?.id ?? 0;
    const albums = await search({ keywords: "HoYo-MiX", type: 10 });
    albumId = albums.albums?.[0]?.id ?? 0;
    const top = await request(
      "/api/artist/top/song",
      { id: ARTIST_HOYO_MIX },
      "weapi",
    );
    const songs = (top.body as { songs?: { id?: number }[] }).songs ?? [];
    topSongId = songs[0]?.id ?? 0;
    const products = await request(
      "/api/vipmall/albumproduct/list",
      { limit: 1, offset: 0, total: true, area: "ALL" },
      "weapi",
    );
    productAlbumId =
      (products.body as { products?: { albumId?: number }[] }).products?.[0]
        ?.albumId ?? 0;
    expect(playlistId).toBeGreaterThan(0);
    expect(albumId).toBeGreaterThan(0);
    expect(topSongId).toBeGreaterThan(0);
    expect(productAlbumId).toBeGreaterThan(0);
  });

  for (const spec of RAW_PROBES) {
    it(`probe ${spec.name}`, async () => {
      const { uri, data, crypto } = spec.build();
      await probeRaw(spec.name, uri, data, crypto);
    });
  }

  it("probe playlist-track-all（两段式，dump 整形结果）", async () => {
    const tracks = await getPlaylistTracks({ id: playlistId, limit: 10 });
    writeDump("playlist-track-all", JSON.stringify(tracks, null, 2), "json");
    expect(tracks.length).toBe(10);
  });

  it("probe related-playlist（HTML 抓取）", async () => {
    const playlists = await getRelatedPlaylists(playlistId);
    writeDump("related-playlist", JSON.stringify(playlists, null, 2), "json");
    expect(Array.isArray(playlists)).toBe(true);
  });
});
