import type { Album } from "./common";
import type { RawAlbum, RawSong } from "./raw";

export interface AlbumPage {
  total?: number;
  more?: boolean;
  albums: Album[];
}

export interface AlbumProduct {
  id: number;
  name: string;
  coverUrl: string;
  artistName?: string;
  price?: number;
  publishTime?: number;
  description?: string;
}

export interface AlbumStats {
  commentCount?: number;
  shareCount?: number;
  subCount?: number;
  likedCount?: number;
  isSub?: boolean;
}

export interface AlbumSaleBoard {
  albums: Album[];
  updateTime?: number;
}

export interface AlbumPrivilege {
  id: number;
  maxBrLevel?: string;
  playMaxBrLevel?: string;
  downloadMaxBrLevel?: string;
  pl?: number;
  dl?: number;
  fl?: number;
  st?: number;
  fee?: number;
}

export interface RawAlbumDetail {
  album?: RawAlbum;
  songs?: RawSong[];
}

export interface RawAlbumProduct {
  id?: number | string;
  albumId?: number | string;
  name?: string;
  albumName?: string;
  picUrl?: string;
  coverUrl?: string;
  artistName?: string;
  price?: number | string;
  publishTime?: number | string;
  pubTime?: number | string;
  description?: string;
  desc?: string;
}

export interface RawAlbumProductAlbum {
  albumId?: number | string;
  albumName?: string;
  coverUrl?: string;
  artistName?: string;
  artistNames?: string;
}

export interface RawAlbumProductInfo {
  price?: number | string;
  pubTime?: number | string;
  saleNum?: number | string;
}

export interface RawAlbumProductDetail {
  album?: RawAlbumProductAlbum;
  product?: RawAlbumProductInfo;
}

export interface RawAlbumStats {
  commentCount?: number | string;
  shareCount?: number | string;
  subCount?: number | string;
  likedCount?: number | string;
  isSub?: boolean;
}

export interface RawAlbumSaleBoardEntry extends RawAlbumProduct {
  salesCount?: number | string;
  saleNum?: number | string;
}

export interface RawAlbumSaleBoard {
  products?: RawAlbumSaleBoardEntry[];
}

export interface RawAlbumPrivilegeItem {
  id?: number | string;
  maxBrLevel?: string;
  playMaxBrLevel?: string;
  downloadMaxBrLevel?: string;
  pl?: number | string;
  dl?: number | string;
  fl?: number | string;
  st?: number | string;
  fee?: number | string;
}

export interface RawAlbumPrivileges {
  data?: RawAlbumPrivilegeItem[];
}

export interface RawAlbumList {
  total?: number | string;
  more?: boolean;
  products?: RawAlbumProduct[];
  albums?: RawAlbum[];
}

export interface RawNewestAlbums {
  albums?: RawAlbum[];
}
