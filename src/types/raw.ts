/**
 * 上游原始响应结构（内部使用，不从 src/index.ts 导出）。
 * 字段一律可选：只有在探针 dump（docs/probe）中确认存在的字段才会被适配器读取。
 */

export interface RawNamedRef {
  id?: number | string;
  name?: string;
}

export interface RawUser {
  userId?: number | string;
  id?: number | string;
  nickname?: string;
  name?: string;
}

export interface RawAlbumRef extends RawNamedRef {
  picUrl?: string;
  coverImgUrl?: string;
}

export interface RawSong {
  id?: number | string;
  name?: string;
  ar?: RawNamedRef[];
  artists?: RawNamedRef[];
  al?: RawAlbumRef;
  album?: RawAlbumRef;
  dt?: number | string;
  duration?: number | string;
  alia?: string[];
  alias?: string[];
  fee?: number | string;
  st?: number | string;
}

export interface RawArtist {
  id?: number | string;
  name?: string;
  alias?: string[];
  picUrl?: string;
  img1v1Url?: string;
  avatar?: string;
  briefDesc?: string;
  albumSize?: number | string;
  musicSize?: number | string;
  mvSize?: number | string;
  followed?: boolean;
}

export interface RawAlbum {
  id?: number | string;
  name?: string;
  picUrl?: string;
  coverImgUrl?: string;
  artists?: RawNamedRef[];
  ar?: RawNamedRef[];
  publishTime?: number | string;
  company?: string;
  description?: string;
  desc?: string;
  size?: number | string;
}

export interface RawPlaylist {
  id?: number | string;
  name?: string;
  coverImgUrl?: string;
  trackCount?: number | string;
  playCount?: number | string;
  userId?: number | string;
  createTime?: number | string;
  creator?: RawUser;
  description?: string;
  updateTime?: number | string;
  tags?: string[];
}

export interface RawMv {
  id?: number | string;
  name?: string;
  cover?: string;
  picUrl?: string;
  imgurl?: string;
  imgurl16v9?: string;
  playCount?: number | string;
  duration?: number | string;
  artistName?: string;
}

export interface RawVideo {
  vid?: number | string;
  id?: number | string;
  title?: string;
  name?: string;
  coverUrl?: string;
  playCount?: number | string;
  duration?: number | string;
  creator?: RawUser;
}
