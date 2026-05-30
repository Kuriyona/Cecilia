import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPlaylistDetail, getLyric, getSongsDetail } from "./index";
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

describe("getLyric", () => {
  it("should parse lyric lines correctly", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n[00:05.00]World\n[00:10.25] Foo Bar",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual([
      { time: 1.5, text: "Hello" },
      { time: 5, text: "World" },
      { time: 10.25, text: "Foo Bar" },
    ]);
  });

  it("should filter out non-lyric lines", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "[00:01.50]Hello\n\n[00:05.00]World",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual([
      { time: 1.5, text: "Hello" },
      { time: 5, text: "World" },
    ]);
  });

  it("should handle empty lyric string", async () => {
    const raw: RawLyric = {
      lrc: {
        v: 1,
        lyric: "",
      },
    };

    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(raw) });

    const result = await getLyric(1);
    expect(result).toEqual([]);
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
