import { getLyric, getPlaylistDetail, getSongsDetail } from "./index";

const playlist = await getPlaylistDetail(2956287532);
console.log(playlist);

const lyric = await getLyric(3358806553);
console.log(lyric);

const songDetail = (await getSongsDetail([3358806553]))[0];
console.log(songDetail);
