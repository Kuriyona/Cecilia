import { LyricLine, RawLyric } from "./types/Lyric";
import { PlaylistDetails, RawPlaylistDetails } from "./types/PlaylistDetail";
import { RawSongDetails, SongDetail } from "./types/SongDetails";

const BASE_URL = "https://music.163.com/api/";

export const getPlaylistDetail = async (id: number): Promise<PlaylistDetails> => {
  const res = await fetch(`${BASE_URL}/v6/playlist/detail?id=${id}`);
  const data = (await res.json()) as RawPlaylistDetails;
  return {
    id: data.playlist.id,
    name: data.playlist.name,
    coverImgId: data.playlist.coverImgId,
    coverImgUrl: data.playlist.coverImgUrl,
    userId: data.playlist.userId,
    createTime: data.playlist.createTime,
    songs: data.playlist.trackIds.map((t) => ({ id: t.id, addTime: t.at })),
  };
};

export const getLyric = async (id: number): Promise<LyricLine[]> => {
  const res = await fetch(`${BASE_URL}/song/lyric?id=${id}&lv=-1`);
  const data = (await res.json()) as RawLyric;
  return data.lrc.lyric
    .split("\n")
    .filter((l) => l.startsWith("["))
    .map((l) => {
      const match = l.match(/^\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      return { time: minutes * 60 + seconds, text: match[3].trim() };
    })
    .filter((l): l is LyricLine => l !== null);
};

export const getSongsDetail = async (ids: number[]): Promise<SongDetail[]> => {
  const query = JSON.stringify(
    ids.map((id) => ({
      id,
    })),
  );
  const res = await fetch(`${BASE_URL}/v3/song/detail?c=${query}`);
  const data = (await res.json()) as RawSongDetails;
  return data.songs.map((s) => ({
    id: s.id,
    name: s.name,
    artists: s.ar.map((a) => ({ id: a.id, name: a.name })),
    album: { id: s.al.id, name: s.al.name, picUrl: s.al.picUrl },
    duration: s.dt,
  }));
};
