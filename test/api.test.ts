import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eapiDecrypt } from "../src/crypto/eapi";
import { weapiDecryptParams } from "../src/crypto/weapi";

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
} from "../src/index";

import type * as NodeCrypto from "node:crypto";

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof NodeCrypto>();
  // 固定 weapi 的随机 secretKey，使离线测试能解密请求体
  return { ...actual, randomInt: () => 0 };
});

type FetchArgs = [input: string, init: RequestInit];

const mockFetch = vi.fn<(input: string, init: RequestInit) => Promise<Response>>();
const originalFetch = globalThis.fetch;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

const text = (body: string, status = 200): Response =>
  new Response(body, { status });

const urlOf = (index: number): string => mockFetch.mock.calls[index]?.[0] ?? "";
const formOf = (index: number): URLSearchParams =>
  new URLSearchParams(String(mockFetch.mock.calls[index]?.[1].body));

const FIXED_SECRET_KEY = "aaaaaaaaaaaaaaaa";

/** eapi 请求体的明文 payload（node:crypto 的 randomInt 已被固定，weapi 同理可解）。 */
const eapiFormOf = (index: number): Record<string, unknown> => {
  const params = formOf(index).get("params") ?? "";
  return eapiDecrypt(params).data as Record<string, unknown>;
};

const weapiFormOf = (index: number): Record<string, unknown> => {
  const params = formOf(index).get("params") ?? "";
  return JSON.parse(weapiDecryptParams(params, FIXED_SECRET_KEY));
};

beforeEach(() => {
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockReset();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** 极简原始歌曲，字段路径与 docs/probe/v3-song-detail.json 一致。 */
const rawSong = {
  id: 3437729493,
  name: "雪人",
  ar: [{ id: 12487174, name: "HOYO-MiX" }],
  al: { id: 398969728, name: "原神", picUrl: "https://p1.music.126.net/a.jpg" },
  dt: 82300,
  alia: ["Snowman"],
  fee: 0,
  st: 0,
};

describe("歌曲域", () => {
  it("getSongsDetail 走 weapi 并整形 ar/al/dt", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200, songs: [rawSong] }));

    const songs = await getSongsDetail([3437729493]);

    expect(urlOf(0)).toBe("https://music.163.com/weapi/v3/song/detail");
    expect(songs).toEqual([
      {
        id: 3437729493,
        name: "雪人",
        artists: [{ id: 12487174, name: "HOYO-MiX" }],
        album: {
          id: 398969728,
          name: "原神",
          coverUrl: "https://p1.music.126.net/a.jpg",
        },
        duration: 82300,
        alias: ["Snowman"],
        fee: 0,
        available: true,
      },
    ]);
  });

  it("getSongsDetail 丢弃缺少 id/duration 的条目", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, songs: [{ name: "残缺" }, rawSong] }),
    );

    const songs = await getSongsDetail([1]);

    expect(songs).toHaveLength(1);
    expect(songs[0]?.id).toBe(3437729493);
  });

  it("getSongUrl 按入参 id 顺序重排并保留 freeTrialInfo", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: [
          {
            id: 2,
            url: "https://example.com/2.mp3",
            br: 320000,
            size: 100,
            level: "exhigh",
            fee: 0,
            freeTrialInfo: null,
          },
          {
            id: 1,
            url: null,
            br: 128000,
            size: 50,
            fee: 1,
            freeTrialInfo: { start: 30, end: 60 },
          },
        ],
      }),
    );

    const urls = await getSongUrl({ id: [1, 2] });

    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/song/enhance/player/url",
    );
    expect(urls).toEqual([
      { id: 1, url: null, br: 128000, size: 50, fee: 1, freeTrialInfo: { start: 30, end: 60 } },
      {
        id: 2,
        url: "https://example.com/2.mp3",
        br: 320000,
        size: 100,
        level: "exhigh",
        fee: 0,
      },
    ]);
  });

  it("checkMusic 走 weapi，可用与不可用两种结果", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, data: [{ id: 1, code: 200 }] }),
    );
    expect(await checkMusic({ id: 1 })).toEqual({
      available: true,
      message: "ok",
    });
    expect(urlOf(0)).toBe(
      "https://music.163.com/weapi/song/enhance/player/url",
    );

    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: [{ id: 1, code: 404, message: "亲爱的,暂无版权" }],
      }),
    );
    expect(await checkMusic({ id: 1 })).toEqual({
      available: false,
      message: "亲爱的,暂无版权",
    });
  });

  it("getLyric 合并原文与译文并带出译者", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        transUser: { id: 100, nickname: "Translater" },
        lrc: { lyric: "[00:01.00]Hello\n[00:02.00]World" },
        tlyric: { lyric: "[00:01.00]你好" },
        romalrc: { lyric: "" },
      }),
    );

    const lyric = await getLyric(1);

    expect(urlOf(0)).toBe("https://interfacepc.music.163.com/eapi/song/lyric");
    expect(lyric).toEqual({
      lines: [
        { time: 1, text: "Hello", translation: "你好" },
        { time: 2, text: "World", translation: "你好" },
      ],
      translator: { id: 100, nickname: "Translater" },
    });
  });

  it("getLyricNew 带出逐字歌词与罗马音", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        lrc: { lyric: "[00:01.00]Hello" },
        tlyric: { lyric: "[00:01.00]你好" },
        romalrc: { lyric: "[00:01.00]Hello" },
        yrc: { lyric: "[1000,2000](1000,500,0,500)He(1500,500,0,500)llo" },
      }),
    );

    const lyric = await getLyricNew(1);

    expect(lyric.lines).toEqual([{ time: 1, text: "Hello", translation: "你好" }]);
    expect(lyric.wordLines).toEqual([
      {
        time: 1000,
        duration: 2000,
        words: [
          { time: 1000, duration: 500, text: "He" },
          { time: 1500, duration: 500, text: "llo" },
        ],
      },
    ]);
    expect(lyric.romaLines).toEqual([{ time: 1, text: "Hello" }]);
  });

  it("getSimilarSongs 用相似歌曲 id 再查歌曲详情", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: {
          commonResourceList: [
            { resourceId: "3437729493", resourceType: "similar_rcmd_song" },
          ],
        },
      }),
    );
    mockFetch.mockResolvedValueOnce(json({ code: 200, songs: [rawSong] }));

    const songs = await getSimilarSongs(1);

    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/link/position/show/resource",
    );
    expect(urlOf(1)).toBe("https://music.163.com/weapi/v3/song/detail");
    expect(songs[0]?.id).toBe(3437729493);
  });
});

describe("搜索域", () => {
  it("search 映射 search/get 的 result 并取 songCount 为 total", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        result: {
          songs: [rawSong],
          songCount: 1,
          hasMore: false,
        },
      }),
    );

    const result = await search({ keywords: "HoYo-MiX" });

    expect(urlOf(0)).toBe("https://interfacepc.music.163.com/eapi/search/get");
    expect(result.total).toBe(1);
    expect(result.songs?.[0]?.album.coverUrl).toBe(
      "https://p1.music.126.net/a.jpg",
    );
    expect(result.artists).toBeUndefined();
  });

  it("cloudSearch 与 searchMultimatch 复用同一整形逻辑", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        result: { artists: [{ id: 12487174, name: "HOYO-MiX", albumSize: 30 }] },
      }),
    );
    const cloud = await cloudSearch({ keywords: "HoYo-MiX", type: 100 });
    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/cloudsearch/pc",
    );
    expect(cloud.artists).toEqual([
      { id: 12487174, name: "HOYO-MiX", albumCount: 30 },
    ]);

    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        result: {
          artist: [{ id: 12487174, name: "HOYO-MiX" }],
          album: [{ id: 1, name: "原神", picUrl: "https://p.png" }],
        },
      }),
    );
    const multi = await searchMultimatch({ keywords: "HoYo-MiX" });
    expect(urlOf(1)).toBe(
      "https://music.163.com/weapi/search/suggest/multimatch",
    );
    expect(multi.artists).toEqual([{ id: 12487174, name: "HOYO-MiX" }]);
    expect(multi.albums?.[0]?.coverUrl).toBe("https://p.png");
    expect(multi.songs).toBeUndefined();
  });

  it("search 的 type=2000 走语音接口并映射 songs", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, result: { songs: [rawSong] } }),
    );

    const result = await search({ keywords: "雪人", type: 2000 });

    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/search/voice/get",
    );
    expect(result.songs?.[0]?.name).toBe("雪人");
  });

  it("search 的语音接口在无法映射时抛错", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200, result: {} }));

    await expect(
      search({ keywords: "雪人", type: 2000 }),
    ).rejects.toMatchObject({ code: -1 });
  });

  it("getSearchSuggest 取 result.order 作为关键词", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        result: { order: ["HoYo-MiX", "HOYO-MiX 原神"], songs: [rawSong] },
      }),
    );

    const suggest = await getSearchSuggest({ keywords: "HoYo" });

    expect(urlOf(0)).toBe(
      "https://music.163.com/weapi/search/suggest/web",
    );
    expect(suggest.keywords).toEqual(["HoYo-MiX", "HOYO-MiX 原神"]);
    expect(suggest.songs).toHaveLength(1);
    expect(suggest.artists).toEqual([]);
  });

  it("getHotSearches 省略 null 的 second/third", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        result: {
          hots: [
            { first: "刘欢", second: 1, third: null },
            { first: "茶汤", second: "1", third: "汤" },
          ],
        },
      }),
    );

    expect(await getHotSearches()).toEqual([
      { first: "刘欢", second: 1 },
      { first: "茶汤", second: "1", third: "汤" },
    ]);
  });

  it("getHotSearchDetail 用下标补齐 position", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: [
          { searchWord: "刘欢", content: "", iconUrl: null },
          { searchWord: "茶汤", content: "热", iconUrl: "https://a.png" },
        ],
      }),
    );

    expect(await getHotSearchDetail()).toEqual([
      { keyword: "刘欢", position: 1 },
      { keyword: "茶汤", position: 2, content: "热", iconUrl: "https://a.png" },
    ]);
  });

  it("getDefaultSearchKeyword 优先 realkeyword", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, data: { realkeyword: "茶汤", showKeyword: "🔥茶汤" } }),
    );
    expect(await getDefaultSearchKeyword()).toBe("茶汤");

    mockFetch.mockResolvedValueOnce(
      json({ code: 200, data: { showKeyword: "🔥茶汤" } }),
    );
    expect(await getDefaultSearchKeyword()).toBe("🔥茶汤");
  });
});

describe("歌单域", () => {
  it("getPlaylistDetail 走 eapi 并重命名词表", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        playlist: {
          id: 632945855,
          name: "原神",
          userId: 76015002,
          coverImgUrl: "https://p1.music.126.net/p.jpg",
          createTime: 1600000000000,
          trackIds: [{ id: 1, at: 1600000000001 }, { id: 2 }],
        },
      }),
    );

    const playlist = await getPlaylistDetail(632945855);

    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/v6/playlist/detail",
    );
    expect(playlist).toEqual({
      id: 632945855,
      name: "原神",
      creatorId: 76015002,
      coverUrl: "https://p1.music.126.net/p.jpg",
      createTime: 1600000000000,
      songs: [{ id: 1, addTime: 1600000000001 }],
    });
  });

  it("getPlaylistTracks 两段式请求并应用 offset/limit", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        playlist: { id: 1, trackIds: [{ id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }] },
      }),
    );
    mockFetch.mockResolvedValueOnce(json({ code: 200, songs: [rawSong] }));

    const tracks = await getPlaylistTracks({ id: 1, offset: 1, limit: 2 });

    expect(weapiFormOf(1).c).toBe('[{"id":11},{"id":12}]');
    expect(tracks).toHaveLength(1);
  });

  it("getPlaylistDetailDynamic 只保留上游存在的计数", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, commentCount: 11, shareCount: 11, playCount: 94150 }),
    );

    expect(await getPlaylistDetailDynamic(1)).toEqual({
      commentCount: 11,
      shareCount: 11,
      playCount: 94150,
    });
  });

  it("getHighQualityTags 映射 tags", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, tags: [{ name: "流行", hot: true }, { name: "摇滚" }] }),
    );

    expect(await getHighQualityTags()).toEqual([
      { name: "流行", hot: true },
      { name: "摇滚", hot: false },
    ]);
  });

  it("getTopPlaylists / getHighQualityPlaylists 复用 PlaylistPage", async () => {
    const page = {
      code: 200,
      total: 1,
      more: true,
      playlists: [
        {
          id: 1,
          name: "歌单",
          coverImgUrl: "https://p.png",
          trackCount: 10,
          playCount: 20,
          updateTime: 1600000000000,
          description: "desc",
          tags: ["流行"],
          creator: { userId: 2, nickname: "作者" },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(page));
    const top = await getTopPlaylists({ limit: 5 });

    expect(urlOf(0)).toBe("https://music.163.com/weapi/playlist/list");
    expect(top.total).toBe(1);
    expect(top.more).toBe(true);
    expect(top.playlists[0]).toEqual({
      id: 1,
      name: "歌单",
      coverUrl: "https://p.png",
      trackCount: 10,
      playCount: 20,
      updateTime: 1600000000000,
      description: "desc",
      tags: ["流行"],
      creator: { id: 2, name: "作者" },
    });

    mockFetch.mockResolvedValueOnce(json({ code: 200, playlists: [] }));
    const hq = await getHighQualityPlaylists({ limit: 5 });
    expect(urlOf(1)).toBe(
      "https://music.163.com/weapi/playlist/highquality/list",
    );
    expect(weapiFormOf(1).lasttime).toBe(0);
    expect(hq.playlists).toEqual([]);
  });

  it("getPlaylistCategories 按 category 归拢 sub", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        categories: { "1": "风格", "0": "语种" },
        sub: [
          { name: "流行", category: 1 },
          { name: "华语", category: 0 },
          { name: "无分类", category: undefined },
        ],
      }),
    );

    expect(await getPlaylistCategories()).toEqual([
      { name: "语种", subcategories: [{ name: "华语", category: 0 }] },
      { name: "风格", subcategories: [{ name: "流行", category: 1 }] },
    ]);
  });

  it("getRelatedPlaylists 解析 HTML 且剔除 param 后缀", async () => {
    mockFetch.mockResolvedValueOnce(
      text(
        '<div class="cver u-cover u-cover-3"><img src="http://p1.music.126.net/a.jpg?param=50y50"><a class="sname f-fs1 s-fc0" href="/playlist?id=632945855">BanG Dream!</a><a class="nm nm f-thide s-fc3" href="/user/home?id=76015002">近未来积木</a></div>',
      ),
    );

    expect(await getRelatedPlaylists(1)).toEqual([
      {
        id: 632945855,
        name: "BanG Dream!",
        coverUrl: "http://p1.music.126.net/a.jpg",
        creator: { id: 76015002, name: "近未来积木" },
      },
    ]);
  });

  it("getRelatedPlaylists 页面结构变化时抛错", async () => {
    mockFetch.mockResolvedValueOnce(text("<html>空的</html>"));

    await expect(getRelatedPlaylists(1)).rejects.toMatchObject({ code: -1 });
  });
});

describe("歌手域", () => {
  const rawArtist = {
    id: 12487174,
    name: "HOYO-MiX",
    alias: [],
    picUrl: "https://p1.music.126.net/artist.jpg",
    briefDesc: "音乐团队",
    albumSize: 30,
    musicSize: 100,
    mvSize: 5,
    followed: false,
  };

  it("getArtist 合并 artist 与 hotSongs", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, artist: rawArtist, hotSongs: [rawSong] }),
    );

    const artist = await getArtist(12487174);

    expect(urlOf(0)).toBe("https://music.163.com/weapi/v1/artist/12487174");
    expect(artist.id).toBe(12487174);
    expect(artist.avatarUrl).toBe("https://p1.music.126.net/artist.jpg");
    expect(artist.songCount).toBe(100);
    expect(artist.topSongs?.[0]?.name).toBe("雪人");
  });

  it("getArtist 缺少 artist 时抛错", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200 }));

    await expect(getArtist(1)).rejects.toMatchObject({ code: -1 });
  });

  it("getArtistDetail 从 data.artist 取值", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, data: { artist: rawArtist, videoCount: 3 } }),
    );

    const artist = await getArtistDetail(12487174);

    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/artist/head/info/get",
    );
    expect(artist).toEqual({
      id: 12487174,
      name: "HOYO-MiX",
      avatarUrl: "https://p1.music.126.net/artist.jpg",
      briefDesc: "音乐团队",
      albumCount: 30,
      songCount: 100,
      mvCount: 5,
      followed: false,
    });
  });

  it("getArtistSongs / getArtistTopSongs 返回歌曲数组", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200, songs: [rawSong] }));
    const songs = await getArtistSongs({ id: 47992679, limit: 5 });
    expect(urlOf(0)).toBe(
      "https://interfacepc.music.163.com/eapi/v1/artist/songs",
    );
    expect(eapiFormOf(0).work_type).toBe(1);
    expect(songs).toHaveLength(1);

    mockFetch.mockResolvedValueOnce(json({ code: 200, songs: [rawSong] }));
    expect(await getArtistTopSongs(12487174)).toHaveLength(1);
    expect(urlOf(1)).toBe("https://music.163.com/weapi/artist/top/song");
  });

  it("getArtistAlbums 返回 AlbumPage", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        more: false,
        hotAlbums: [
          {
            id: 398969728,
            name: "原神",
            picUrl: "https://p1.music.126.net/al.jpg",
            publishTime: 1600000000000,
            size: 12,
          },
        ],
      }),
    );

    const page = await getArtistAlbums({ id: 12487174, limit: 5 });

    expect(urlOf(0)).toBe(
      "https://music.163.com/weapi/artist/albums/12487174",
    );
    expect(page.more).toBe(false);
    expect(page.albums[0]).toEqual({
      id: 398969728,
      name: "原神",
      coverUrl: "https://p1.music.126.net/al.jpg",
      publishTime: 1600000000000,
      size: 12,
    });
  });

  it("getArtistList 把字母 initial 转成 ASCII 码", async () => {
    mockFetch.mockResolvedValueOnce(
      json({ code: 200, more: true, artists: [rawArtist] }),
    );

    const page = await getArtistList({ initial: "h", limit: 5 });

    expect(weapiFormOf(0).initial).toBe("H".charCodeAt(0));
    expect(page.artists[0]?.id).toBe(12487174);
    expect(page.total).toBeUndefined();
  });

  it("getArtistList 保留数字 initial", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200, artists: [] }));

    await getArtistList({ initial: 0 });

    expect(weapiFormOf(0).initial).toBe(0);
  });

  it("getArtistDesc 映射 briefDesc 与 sections", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        briefDesc: "音乐团队",
        introduction: [{ ti: "简介", tx: "正文" }],
      }),
    );

    expect(await getArtistDesc(12487174)).toEqual({
      briefDesc: "音乐团队",
      sections: [{ title: "简介", text: "正文" }],
    });
  });

  it("getArtistMvs 用 imgurl16v9 兜底封面", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        mvs: [
          {
            id: 1,
            name: "MV",
            imgurl16v9: "https://p1.music.126.net/mv.jpg",
            duration: 200000,
            playCount: 10,
            artistName: "HOYO-MiX",
          },
        ],
      }),
    );

    expect(await getArtistMvs({ id: 12487174, limit: 5 })).toEqual([
      {
        id: 1,
        name: "MV",
        coverUrl: "https://p1.music.126.net/mv.jpg",
        playCount: 10,
        duration: 200000,
        artistName: "HOYO-MiX",
      },
    ]);
  });

  it("getArtistVideos 从 mlog 结构映射并读 page.more", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: {
          page: { size: 5, cursor: "5", more: true },
          records: [
            {
              resource: {
                mlogBaseData: {
                  id: "34754516",
                  text: "昔涟",
                  coverUrl: "https://p1.music.126.net/v.jpg",
                  duration: 253000,
                },
                mlogExtVO: { playCount: 32770 },
              },
            },
            { resource: {} },
          ],
        },
      }),
    );

    expect(await getArtistVideos({ id: 12487174, size: 5 })).toEqual({
      hasMore: true,
      videos: [
        {
          id: 34754516,
          name: "昔涟",
          coverUrl: "https://p1.music.126.net/v.jpg",
          playCount: 32770,
          duration: 253000,
        },
      ],
    });
  });
});

describe("专辑域", () => {
  it("getAlbum 合并 album 与 songs", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        album: {
          id: 398969728,
          name: "原神",
          picUrl: "https://p1.music.126.net/al.jpg",
          artists: [{ id: 12487174, name: "HOYO-MiX" }],
          publishTime: 1600000000000,
          company: "厂牌",
          description: "专辑简介",
          size: 12,
        },
        songs: [rawSong],
      }),
    );

    const album = await getAlbum(398969728);

    expect(urlOf(0)).toBe("https://music.163.com/weapi/v1/album/398969728");
    expect(album.coverUrl).toBe("https://p1.music.126.net/al.jpg");
    expect(album.artists).toEqual([{ id: 12487174, name: "HOYO-MiX" }]);
    expect(album.company).toBe("厂牌");
    expect(album.songs).toHaveLength(1);
  });

  it("getAlbumProduct 从 album + product 组装", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        album: {
          albumId: 394453761,
          albumName: "UNBREAKABLE",
          coverUrl: "https://p3.music.126.net/p.jpg",
          artistName: "ALPHA DRIVE ONE",
        },
        product: { price: 15, pubTime: 1790154000238 },
      }),
    );

    expect(await getAlbumProduct(394453761)).toEqual({
      id: 394453761,
      name: "UNBREAKABLE",
      coverUrl: "https://p3.music.126.net/p.jpg",
      artistName: "ALPHA DRIVE ONE",
      price: 15,
      publishTime: 1790154000238,
    });
  });

  it("getAlbumDynamic 映射计数与 isSub", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        commentCount: 1,
        shareCount: 2,
        subCount: 3,
        likedCount: 4,
        isSub: false,
      }),
    );

    expect(await getAlbumDynamic(1)).toEqual({
      commentCount: 1,
      shareCount: 2,
      subCount: 3,
      likedCount: 4,
      isSub: false,
    });
  });

  it("getAlbumSaleBoard 走 products 并保留 price/pubTime", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        products: [
          {
            albumId: 244922245,
            albumName: "冒险精神",
            artistName: "毛不易",
            coverUrl: "https://p3.music.126.net/s.jpg",
            price: 27,
            pubTime: 1700000000000,
          },
        ],
      }),
    );

    const board = await getAlbumSaleBoard({ albumType: 0, type: "daily" });

    expect(urlOf(0)).toBe(
      "https://music.163.com/weapi/feealbum/songsaleboard/daily/type",
    );
    expect(board.albums).toEqual([
      {
        id: 244922245,
        name: "冒险精神",
        coverUrl: "https://p3.music.126.net/s.jpg",
        publishTime: 1700000000000,
      },
    ]);
    expect(board.updateTime).toBeUndefined();
  });

  it("getAlbumSaleBoard 在 type=year 时带上 year", async () => {
    mockFetch.mockResolvedValueOnce(json({ code: 200, products: [] }));

    await getAlbumSaleBoard({ type: "year", year: 2025 });

    expect(urlOf(0)).toBe(
      "https://music.163.com/weapi/feealbum/songsaleboard/year/type",
    );
    expect(weapiFormOf(0).year).toBe(2025);
    expect(weapiFormOf(0).albumType).toBe(0);
  });

  it("getAlbumPrivileges 走 eapi 并省略缺失字段", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        data: [
          {
            id: 1,
            fee: 0,
            st: 0,
            pl: 320000,
            dl: 320000,
            maxBrLevel: "lossless",
            playMaxBrLevel: "lossless",
            downloadMaxBrLevel: "lossless",
          },
        ],
      }),
    );

    const privileges = await getAlbumPrivileges(1);

    expect(urlOf(0)).toBe("https://interfacepc.music.163.com/eapi/album/privilege");
    expect(privileges).toEqual([
      {
        id: 1,
        fee: 0,
        st: 0,
        pl: 320000,
        dl: 320000,
        maxBrLevel: "lossless",
        playMaxBrLevel: "lossless",
        downloadMaxBrLevel: "lossless",
      },
    ]);
  });

  it("getAlbumList 映射 products 为 AlbumPage", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        total: 1,
        products: [
          {
            albumId: 394453761,
            albumName: "UNBREAKABLE",
            coverUrl: "https://p3.music.126.net/p.jpg",
            price: 15,
            pubTime: 1790154000238,
          },
        ],
      }),
    );

    const page = await getAlbumList({ area: "ALL", limit: 5 });

    expect(urlOf(0)).toBe("https://music.163.com/weapi/vipmall/albumproduct/list");
    expect(page.total).toBe(1);
    expect(page.albums).toEqual([
      {
        id: 394453761,
        name: "UNBREAKABLE",
        coverUrl: "https://p3.music.126.net/p.jpg",
        publishTime: 1790154000238,
      },
    ]);
  });

  it("getAlbumList 在 albums 结构下回退到标准专辑字段", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        albums: [{ id: 1, name: "原神", picUrl: "https://p.png" }],
      }),
    );

    const page = await getAlbumList({});

    expect(page.albums[0]).toEqual({
      id: 1,
      name: "原神",
      coverUrl: "https://p.png",
    });
  });

  it("getNewestAlbums 返回专辑数组", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        code: 200,
        albums: [{ id: 1, name: "原神", picUrl: "https://p.png", size: 12 }],
      }),
    );

    expect(await getNewestAlbums()).toEqual([
      { id: 1, name: "原神", coverUrl: "https://p.png", size: 12 },
    ]);
    expect(urlOf(0)).toBe("https://music.163.com/weapi/discovery/newAlbum");
  });
});
