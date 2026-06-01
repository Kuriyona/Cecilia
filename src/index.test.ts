import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPlaylistDetail, getLyric, getSongsDetail } from "./index";
import { mergeLyricTimelines } from "./utils/mergeLyricTimelines";
import type { RawPlaylistDetails } from "./types/PlaylistDetail";
import type { RawLyric } from "./types/Lyric";
import type { RawSongDetails } from "./types/SongDetails";

const mockFetch = vi.fn();
const originalFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.fetch = mockFetch;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  mockFetch.mockReset();
});

describe("getPlaylistDetail", () => {
  it("should transform RawPlaylistDetails to PlaylistDetails", async () => {
    const raw: RawPlaylistDetails = {
      playlist: {
        id: 123,
        name: "test playlist",
        coverImgId: 456,
        coverImgUrl: "https://example.com/cover.jpg",
        userId: 789,
        createTime: 1000000,
        trackIds: [
          { id: 1, at: 2000000 },
          { id: 2, at: 3000000 },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getPlaylistDetail(123);
    expect(result).toEqual({
      id: 123,
      name: "test playlist",
      coverImgId: 456,
      coverImgUrl: "https://example.com/cover.jpg",
      userId: 789,
      createTime: 1000000,
      songs: [
        { id: 1, addTime: 2000000 },
        { id: 2, addTime: 3000000 },
      ],
    });
  });
});

describe("mergeLyricTimelines", () => {
  it("should merge with different timestamps, carrying forward values", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 2, text: "World" },
      ],
      [
        { time: 1, text: "你好" },
        { time: 2, text: "世界" },
        { time: 3, text: "!" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello" },
      { time: 1, text: "Hello", translation: "你好" },
      { time: 2, text: "World", translation: "世界" },
      { time: 3, text: "World", translation: "!" },
    ]);
  });

  it("should carry forward translation when only original changes", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 2, text: "World" },
      ],
      [
        { time: 0, text: "你好" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 2, text: "World", translation: "你好" },
    ]);
  });

  it("should carry forward original when only translation changes", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
      ],
      [
        { time: 0, text: "你好" },
        { time: 2, text: "世界" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 2, text: "Hello", translation: "世界" },
    ]);
  });

  it("should handle same timestamps correctly", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 1, text: "World" },
      ],
      [
        { time: 0, text: "你好" },
        { time: 1, text: "世界" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 1, text: "World", translation: "世界" },
    ]);
  });

  it("should return empty array for empty inputs", () => {
    expect(mergeLyricTimelines([], [])).toEqual([]);
  });

  it("should use empty string for original text when translation precedes first original line", () => {
    const result = mergeLyricTimelines(
      [{ time: 2, text: "World" }],
      [{ time: 0, text: "你好" }],
    );

    expect(result).toEqual([
      { time: 0, text: "", translation: "你好" },
      { time: 2, text: "World", translation: "你好" },
    ]);
  });

  it("should omit translation key when no translation exists", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 1, text: "World" },
      ],
      [],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello" },
      { time: 1, text: "World" },
    ]);
  });
});

describe("getLyric", () => {
  it("should parse lyric lines correctly without translation", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n[00:05.00]World\n[00:10.25] Foo Bar",
      },
      tlyric: {
        v: 1,
        lyric: "",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({
      lines: [
        { time: 1.5, text: "Hello" },
        { time: 5, text: "World" },
        { time: 10.25, text: "Foo Bar" },
      ],
    });
    expect(result.translator).toBeUndefined();
  });

  it("should parse both lrc and tlyric and merge them", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n[00:05.00]World",
      },
      tlyric: {
        v: 1,
        lyric: "[00:01.50]你好\n[00:05.00]世界",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({
      lines: [
        { time: 1.5, text: "Hello", translation: "你好" },
        { time: 5, text: "World", translation: "世界" },
      ],
    });
    expect(result.translator).toBeUndefined();
  });

  it("should carry forward translation when timelines don't align", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n[00:03.00]World\n[00:05.00]Foo",
      },
      tlyric: {
        v: 1,
        lyric: "[00:02.00]你好\n[00:05.00]世界",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({
      lines: [
        { time: 1.5, text: "Hello" },
        { time: 2, text: "Hello", translation: "你好" },
        { time: 3, text: "World", translation: "你好" },
        { time: 5, text: "Foo", translation: "世界" },
      ],
    });
    expect(result.translator).toBeUndefined();
  });

  it("should use transUser from API response as translator", async () => {
    const raw: RawLyric = {
      transUser: { id: 100, nickname: "Translater" },
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n[00:05.00]World",
      },
      tlyric: {
        v: 1,
        lyric: "[00:01.50]你好\n[00:05.00]世界",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({
      lines: [
        { time: 1.5, text: "Hello", translation: "你好" },
        { time: 5, text: "World", translation: "世界" },
      ],
      translator: { id: 100, nickname: "Translater" },
    });
  });

  it("should filter out [by:...] metadata lines from line parsing", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n\n[00:05.00]World",
      },
      tlyric: {
        v: 1,
        lyric: "[by:Someone]\n[00:05.00]世界",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({
      lines: [
        { time: 1.5, text: "Hello" },
        { time: 5, text: "World", translation: "世界" },
      ],
    });
    expect(result.translator).toBeUndefined();
  });

  it("should handle empty lyric string", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "",
      },
      tlyric: {
        v: 1,
        lyric: "",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual({ lines: [] });
    expect(result.translator).toBeUndefined();
  });
});

describe("getSongsDetail", () => {
  it("should transform RawSongDetails to SongDetail[]", async () => {
    const raw: RawSongDetails = {
      songs: [
        {
          id: 1,
          name: "Song A",
          ar: [{ id: 10, name: "Artist 1" }],
          al: { id: 100, name: "Album A", picUrl: "https://example.com/a.jpg" },
          dt: 200000,
        },
        {
          id: 2,
          name: "Song B",
          ar: [
            { id: 20, name: "Artist 2" },
            { id: 21, name: "Artist 3" },
          ],
          al: { id: 200, name: "Album B", picUrl: "https://example.com/b.jpg" },
          dt: 300000,
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getSongsDetail([1, 2]);
    expect(result).toEqual([
      {
        id: 1,
        name: "Song A",
        artists: [{ id: 10, name: "Artist 1" }],
        album: { id: 100, name: "Album A", picUrl: "https://example.com/a.jpg" },
        duration: 200000,
      },
      {
        id: 2,
        name: "Song B",
        artists: [
          { id: 20, name: "Artist 2" },
          { id: 21, name: "Artist 3" },
        ],
        album: { id: 200, name: "Album B", picUrl: "https://example.com/b.jpg" },
        duration: 300000,
      },
    ]);
  });
});
