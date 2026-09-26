import { beforeAll, describe, expect, it } from "vitest";
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

const ARTIST_HOYO_MIX = 12487174;
const ARTIST_CHEVY = 47992679;

let playlistId = 0;
let albumId = 0;
let productAlbumId = 0;
let topSongId = 0;

beforeAll(async () => {
  const playlists = await search({ keywords: "HoYo-MiX", type: 1000 });
  playlistId = playlists.playlists?.[0]?.id ?? 0;
  const albums = await getArtistAlbums({ id: ARTIST_HOYO_MIX, limit: 5 });
  albumId = albums.albums[0]?.id ?? 0;
  const topSongs = await getArtistTopSongs(ARTIST_HOYO_MIX);
  topSongId = topSongs[0]?.id ?? 0;
  const products = await getAlbumList({ area: "ALL", limit: 5 });
  productAlbumId = products.albums[0]?.id ?? 0;
  expect(playlistId).toBeGreaterThan(0);
  expect(albumId).toBeGreaterThan(0);
  expect(topSongId).toBeGreaterThan(0);
  expect(productAlbumId).toBeGreaterThan(0);
});

describe("搜索", () => {
  it("search 单曲搜索命中 Chevy", async () => {
    const result = await search({ keywords: "Chevy", type: 1 });

    expect(result.songs?.length ?? 0).toBeGreaterThan(0);
  });

  it("search/cloudSearch 歌手搜索命中 HoYo-MiX", async () => {
    const local = await search({ keywords: "HoYo-MiX", type: 100 });
    const cloud = await cloudSearch({ keywords: "HoYo-MiX", type: 100 });

    expect(local.artists?.some((a) => a.id === ARTIST_HOYO_MIX)).toBe(true);
    expect(cloud.artists?.some((a) => a.id === ARTIST_HOYO_MIX)).toBe(true);
  });

  it("getSearchSuggest 返回关键词", async () => {
    const suggest = await getSearchSuggest({ keywords: "HoYo" });

    expect(suggest.keywords.length).toBeGreaterThan(0);
    expect(suggest.songs.length + suggest.artists.length).toBeGreaterThan(0);
  });

  it("getHotSearches 返回分组条目", async () => {
    const groups = await getHotSearches();

    expect(groups.length).toBeGreaterThan(0);
    expect(typeof groups[0]?.first).toBe("string");
  });

  it("getHotSearchDetail 返回热搜列表", async () => {
    const items = await getHotSearchDetail();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.keyword.length).toBeGreaterThan(0);
    expect(items[0]?.position).toBe(1);
  });

  it("getDefaultSearchKeyword 返回非空字符串", async () => {
    expect((await getDefaultSearchKeyword()).length).toBeGreaterThan(0);
  });

  it("searchMultimatch 至少一个类型非空", async () => {
    const result = await searchMultimatch({ keywords: "HoYo-MiX" });

    const sizes = [
      result.songs?.length,
      result.artists?.length,
      result.albums?.length,
      result.playlists?.length,
    ].map((size) => size ?? 0);
    expect(Math.max(...sizes)).toBeGreaterThan(0);
  });
});

describe("歌曲", () => {
  it("getArtistTopSongs 与 getSongsDetail 结果一致", async () => {
    const topSongs = await getArtistTopSongs(ARTIST_HOYO_MIX);
    const details = await getSongsDetail([topSongs[0]?.id ?? 0]);

    expect(details[0]?.name).toBe(topSongs[0]?.name);
    expect(details[0]?.album.coverUrl.startsWith("http")).toBe(true);
  });

  it("getSongUrl 返回播放链接结构，checkMusic 返回可用性", async () => {
    const urls = await getSongUrl({ id: topSongId });
    const availability = await checkMusic({ id: topSongId });

    expect(urls).toHaveLength(1);
    expect(urls[0]?.id).toBe(topSongId);
    expect(typeof urls[0]?.br).toBe("number");
    expect(urls[0]?.url === null || typeof urls[0]?.url === "string").toBe(true);
    expect(typeof availability.available).toBe("boolean");
    expect(availability.message.length).toBeGreaterThan(0);
  });

  it("前 5 首热门曲中至少 1 首有可播放链接", async () => {
    const topSongs = await getArtistTopSongs(ARTIST_HOYO_MIX);
    const ids = topSongs.slice(0, 5).map((song) => song.id);
    const urls = await getSongUrl({ id: ids });

    expect(urls.some((item) => item.url !== null)).toBe(true);
  });

  it("getLyric / getLyricNew 返回非空歌词", async () => {
    const lyric = await getLyric(topSongId);
    const lyricNew = await getLyricNew(topSongId);

    expect(lyric.lines.length).toBeGreaterThan(0);
    expect(lyric.lines[0]?.time).toBeGreaterThanOrEqual(0);
    expect(lyricNew.lines.length).toBeGreaterThan(0);
  });

  it("getSimilarSongs 返回完整歌曲", async () => {
    const songs = await getSimilarSongs(topSongId);

    expect(songs.length).toBeGreaterThan(0);
    expect(songs[0]?.duration).toBeGreaterThan(0);
  });
});

describe("歌单", () => {
  it("getPlaylistDetail 返回创建者/封面/曲目 id", async () => {
    const playlist = await getPlaylistDetail(playlistId);

    expect(playlist.creatorId).toBeGreaterThan(0);
    expect(playlist.coverUrl.startsWith("http")).toBe(true);
    expect(playlist.songs.length).toBeGreaterThan(0);
  });

  it("getPlaylistTracks 按 limit 返回完整歌曲", async () => {
    const tracks = await getPlaylistTracks({ id: playlistId, limit: 10 });

    expect(tracks).toHaveLength(10);
    for (const track of tracks) {
      expect(track.duration).toBeGreaterThan(0);
      expect(track.artists.length).toBeGreaterThan(0);
    }
  });

  it("getPlaylistDetailDynamic 返回数字播放量", async () => {
    const stats = await getPlaylistDetailDynamic(playlistId);

    expect(typeof stats.playCount).toBe("number");
  });

  it("getHighQualityTags / getPlaylistCategories 非空", async () => {
    const tags = await getHighQualityTags();
    const categories = await getPlaylistCategories();

    expect(tags.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]?.subcategories.length).toBeGreaterThan(0);
  });

  it("getTopPlaylists / getHighQualityPlaylists 返回歌单", async () => {
    const top = await getTopPlaylists({ limit: 5 });
    const highQuality = await getHighQualityPlaylists({ limit: 5 });

    expect(top.playlists.length).toBeGreaterThan(0);
    expect(top.playlists[0]?.coverUrl.startsWith("http")).toBe(true);
    expect(highQuality.playlists.length).toBeGreaterThan(0);
  });

  it("getRelatedPlaylists 返回数组", async () => {
    const playlists = await getRelatedPlaylists(playlistId);

    expect(Array.isArray(playlists)).toBe(true);
  });
});

describe("歌手", () => {
  it("getArtist 返回 HoYo-MiX 与热门歌曲", async () => {
    const artist = await getArtist(ARTIST_HOYO_MIX);

    expect(artist.id).toBe(ARTIST_HOYO_MIX);
    expect(artist.name.toLowerCase()).toContain("hoyo");
    expect(artist.topSongs?.length ?? 0).toBeGreaterThanOrEqual(5);
  });

  it("getArtist 返回 Chevy", async () => {
    const artist = await getArtist(ARTIST_CHEVY);

    expect(artist.id).toBe(ARTIST_CHEVY);
    expect(artist.name.toLowerCase()).toContain("chevy");
  });

  it("getArtistDetail 返回同一歌手", async () => {
    const artist = await getArtistDetail(ARTIST_HOYO_MIX);

    expect(artist.id).toBe(ARTIST_HOYO_MIX);
    expect(artist.name.toLowerCase()).toContain("hoyo");
  });

  it("getArtistSongs 返回指定数量的完整歌曲", async () => {
    const songs = await getArtistSongs({ id: ARTIST_HOYO_MIX, limit: 5 });

    expect(songs).toHaveLength(5);
    for (const song of songs) {
      expect(song.artists.length).toBeGreaterThan(0);
      expect(song.duration).toBeGreaterThan(0);
    }
  });

  it("getArtistAlbums 返回带封面的专辑", async () => {
    const page = await getArtistAlbums({ id: ARTIST_HOYO_MIX, limit: 5 });

    expect(page.albums.length).toBeGreaterThan(0);
    for (const album of page.albums) {
      expect(album.coverUrl.startsWith("http")).toBe(true);
    }
  });

  it("getArtistList 返回指定数量的歌手", async () => {
    const page = await getArtistList({ area: -1, type: 1, limit: 5 });

    expect(page.artists).toHaveLength(5);
  });

  it("getArtistTopSongs 返回 Chevy 热门歌曲", async () => {
    expect((await getArtistTopSongs(ARTIST_CHEVY)).length).toBeGreaterThan(0);
  });

  it("getArtistDesc 返回字符简介", async () => {
    const desc = await getArtistDesc(ARTIST_HOYO_MIX);

    expect(typeof desc.briefDesc).toBe("string");
    expect(Array.isArray(desc.sections)).toBe(true);
  });

  it("getArtistMvs 返回带封面的 MV", async () => {
    const mvs = await getArtistMvs({ id: ARTIST_HOYO_MIX, limit: 5 });

    expect(mvs.length).toBeGreaterThan(0);
    expect(mvs[0]?.coverUrl.startsWith("http")).toBe(true);
  });

  it("getArtistVideos 返回视频数组", async () => {
    const page = await getArtistVideos({ id: ARTIST_HOYO_MIX, size: 5 });

    expect(Array.isArray(page.videos)).toBe(true);
    expect(page.videos.length).toBeGreaterThan(0);
  });
});

describe("专辑", () => {
  it("getAlbum 返回专辑与曲目", async () => {
    const album = await getAlbum(albumId);

    expect(album.id).toBe(albumId);
    expect(album.songs?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(album.songs?.[0]?.album.id).toBe(albumId);
  });

  it("getAlbumProduct 返回数字专辑商品", async () => {
    const product = await getAlbumProduct(productAlbumId);

    expect(product.id).toBe(productAlbumId);
    expect(product.coverUrl.startsWith("http")).toBe(true);
    expect(typeof product.price).toBe("number");
  });

  it("getAlbumDynamic 返回计数", async () => {
    const stats = await getAlbumDynamic(albumId);

    expect(typeof stats.commentCount).toBe("number");
    expect(
      stats.isSub === undefined || typeof stats.isSub === "boolean",
    ).toBe(true);
  });

  it("getAlbumSaleBoard 返回销售榜专辑", async () => {
    const board = await getAlbumSaleBoard({ albumType: 0, type: "daily" });

    expect(board.albums.length).toBeGreaterThan(0);
    expect(board.albums[0]?.coverUrl.startsWith("http")).toBe(true);
  });

  it("getAlbumPrivileges 返回音质信息", async () => {
    const privileges = await getAlbumPrivileges(albumId);

    expect(privileges.length).toBeGreaterThanOrEqual(1);
    for (const privilege of privileges) {
      expect(typeof privilege.id).toBe("number");
    }
  });

  it("getAlbumList 返回数字专辑列表", async () => {
    const page = await getAlbumList({ area: "ALL", limit: 5 });

    expect(page.albums.length).toBeGreaterThan(0);
  });

  it("getNewestAlbums 返回新碟", async () => {
    const albums = await getNewestAlbums();

    expect(albums.length).toBeGreaterThan(0);
    expect(albums[0]?.coverUrl.startsWith("http")).toBe(true);
  });
});
