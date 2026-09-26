import { request, type RequestOptions } from "../client";
import { NeteaseApiError } from "../errors";
import type { Lyric, LyricNew, RawLyric, WordLine } from "../types/Lyric";
import type { CheckMusicParams, SongUrlParams } from "../types/params";
import type {
  MusicAvailability,
  RawSimilarSongs,
  RawSongDetails,
  RawSongUrl,
  RawSongUrlItem,
  SongDetail,
} from "../types/SongDetails";
import type { Song, SongUrl } from "../types/common";
import { mergeLyricTimelines } from "../utils/mergeLyricTimelines";
import { num } from "../utils/num";
import { parseLrc } from "../utils/parseLrc";
import { parseYrc } from "../utils/parseYrc";
import { toSongs } from "./adapters";

const URI_SONG_DETAIL = "/api/v3/song/detail";
const URI_SONG_URL = "/api/song/enhance/player/url";
const URI_LYRIC = "/api/song/lyric";
const URI_LYRIC_NEW = "/api/song/lyric/v1";
const URI_SIMI_SONG = "/api/link/position/show/resource";

const buildSongDetailQuery = (ids: number[]): string =>
  `[${ids.map((id) => `{"id":${id}}`).join(",")}]`;

export const getSongsDetail = async (
  ids: number[],
  options?: RequestOptions,
): Promise<SongDetail[]> => {
  const res = await request(
    URI_SONG_DETAIL,
    { c: buildSongDetailQuery(ids) },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/v3-song-detail.json 为准
  const body = res.body as RawSongDetails;
  return toSongs(body.songs);
};

const readFreeTrialInfo = (
  raw: RawSongUrlItem["freeTrialInfo"],
): { start: number; end: number } | undefined => {
  if (!raw) return undefined;
  const start = num(raw.start);
  const end = num(raw.end);
  if (start === undefined || end === undefined) return undefined;
  return { start, end };
};

export const getSongUrl = async (
  params: SongUrlParams,
  options?: RequestOptions,
): Promise<SongUrl[]> => {
  const ids = String(params.id).split(",");
  const res = await request(
    URI_SONG_URL,
    { ids: JSON.stringify(ids), br: params.br ?? 999000 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/song-enhance-player-url.json 为准
  const body = res.body as RawSongUrl;
  const items = [...(body.data ?? [])].sort(
    (a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)),
  );
  const urls: SongUrl[] = [];
  for (const item of items) {
    const id = num(item.id);
    if (id === undefined) continue;
    const fee = num(item.fee);
    const freeTrialInfo = readFreeTrialInfo(item.freeTrialInfo);
    urls.push({
      id,
      url: item.url ?? null,
      br: num(item.br) ?? 0,
      size: num(item.size) ?? 0,
      ...(item.level ? { level: item.level } : {}),
      ...(fee !== undefined ? { fee } : {}),
      ...(freeTrialInfo !== undefined ? { freeTrialInfo } : {}),
    });
  }
  return urls;
};

export const getLyric = async (
  id: number,
  options?: RequestOptions,
): Promise<Lyric> => {
  const res = await request(
    URI_LYRIC,
    { id, tv: -1, lv: -1, rv: -1, kv: -1, _nmclfl: 1 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/song-lyric.json 为准
  const body = res.body as RawLyric;
  const translationText = body.tlyric?.lyric;
  const translatorId = num(body.transUser?.id);
  return {
    lines: mergeLyricTimelines(
      parseLrc(body.lrc?.lyric ?? ""),
      translationText ? parseLrc(translationText) : [],
    ),
    ...(translatorId !== undefined
      ? {
          translator: {
            id: translatorId,
            nickname: body.transUser?.nickname ?? "",
          },
        }
      : {}),
  };
};

export const getLyricNew = async (
  id: number,
  options?: RequestOptions,
): Promise<LyricNew> => {
  const res = await request(
    URI_LYRIC_NEW,
    { id, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0 },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/song-lyric-v1.json 为准
  const body = res.body as RawLyric;
  const translationText = body.tlyric?.lyric;
  const romaText = body.romalrc?.lyric;
  const yrcText = body.yrc?.lyric;
  const wordLines: WordLine[] | undefined = yrcText
    ? parseYrc(yrcText)
    : undefined;
  return {
    lines: mergeLyricTimelines(
      parseLrc(body.lrc?.lyric ?? ""),
      translationText ? parseLrc(translationText) : [],
    ),
    ...(wordLines ? { wordLines } : {}),
    ...(romaText ? { romaLines: parseLrc(romaText) } : {}),
  };
};

export const checkMusic = async (
  params: CheckMusicParams,
  options?: RequestOptions,
): Promise<MusicAvailability> => {
  const res = await request(
    URI_SONG_URL,
    { ids: `[${params.id}]`, br: params.br ?? 999000 },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/check-music.json 为准
  const body = res.body as RawSongUrl;
  const first = body.data?.[0];
  const available = num(body.code) === 200 && num(first?.code) === 200;
  return {
    available,
    message: available ? "ok" : (first?.message ?? "亲爱的,暂无版权"),
  };
};

export const getSimilarSongs = async (
  id: number,
  options?: RequestOptions,
): Promise<Song[]> => {
  const res = await request(
    URI_SIMI_SONG,
    { positionCode: "toolBarRcmdSong", resourceId: id, resourceType: "song" },
    "eapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/simi-song.json 为准
  const body = res.body as RawSimilarSongs;
  const ids: number[] = [];
  for (const item of body.data?.commonResourceList ?? []) {
    const resourceId = num(item.extraMap?.songId ?? item.resourceId);
    if (resourceId !== undefined) ids.push(resourceId);
  }
  if (ids.length > 0) return getSongsDetail(ids, options);
  const songs = toSongs(body.songs);
  if (songs.length > 0) return songs;
  throw new NeteaseApiError(URI_SIMI_SONG, -1, res.status, {
    code: -1,
    msg: "相似歌曲响应中未找到歌曲 id",
  });
};
