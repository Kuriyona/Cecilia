import { request, type RequestOptions } from "../client";
import type {
  AlbumListParams,
  AlbumSaleBoardParams,
} from "../types/params";
import type {
  AlbumPage,
  AlbumPrivilege,
  AlbumProduct,
  AlbumSaleBoard,
  AlbumStats,
  RawAlbumDetail,
  RawAlbumList,
  RawAlbumPrivilegeItem,
  RawAlbumPrivileges,
  RawAlbumProduct,
  RawAlbumProductDetail,
  RawAlbumSaleBoard,
  RawAlbumSaleBoardEntry,
  RawAlbumStats,
  RawNewestAlbums,
} from "../types/album";
import type { Album } from "../types/common";
import { num } from "../utils/num";
import { toAlbum, toAlbums, toSongs } from "./adapters";
import { requireField } from "./require";

const URI_ALBUM = "/api/v1/album";
const URI_ALBUM_PRODUCT = "/api/vipmall/albumproduct/detail";
const URI_ALBUM_DYNAMIC = "/api/album/detail/dynamic";
const URI_ALBUM_SALE_BOARD = "/api/feealbum/songsaleboard";
const URI_ALBUM_PRIVILEGE = "/api/album/privilege";
const URI_ALBUM_LIST = "/api/vipmall/albumproduct/list";
const URI_NEW_ALBUM = "/api/discovery/newAlbum";

/** 数字专辑/单曲产品与销售榜条目共用的「产品式」字段命名。 */
const toProductAlbum = (raw: RawAlbumProduct): Album => {
  const publishTime = num(raw.publishTime ?? raw.pubTime);
  return {
    id: num(raw.albumId ?? raw.id) ?? 0,
    name: raw.albumName ?? raw.name ?? "",
    coverUrl: raw.coverUrl ?? raw.picUrl ?? "",
    ...(publishTime !== undefined ? { publishTime } : {}),
  };
};

const toAlbumPrivilege = (raw: RawAlbumPrivilegeItem): AlbumPrivilege => {
  const pl = num(raw.pl);
  const dl = num(raw.dl);
  const fl = num(raw.fl);
  const st = num(raw.st);
  const fee = num(raw.fee);
  return {
    id: num(raw.id) ?? 0,
    ...(raw.maxBrLevel ? { maxBrLevel: raw.maxBrLevel } : {}),
    ...(raw.playMaxBrLevel ? { playMaxBrLevel: raw.playMaxBrLevel } : {}),
    ...(raw.downloadMaxBrLevel
      ? { downloadMaxBrLevel: raw.downloadMaxBrLevel }
      : {}),
    ...(pl !== undefined ? { pl } : {}),
    ...(dl !== undefined ? { dl } : {}),
    ...(fl !== undefined ? { fl } : {}),
    ...(st !== undefined ? { st } : {}),
    ...(fee !== undefined ? { fee } : {}),
  };
};

export const getAlbum = async (
  id: number,
  options?: RequestOptions,
): Promise<Album> => {
  const uri = `${URI_ALBUM}/${id}`;
  const res = await request(uri, {}, "weapi", options);
  // 上游响应结构，字段以 docs/probe/v1-album.json 为准
  const body = res.body as RawAlbumDetail;
  const album = toAlbum(requireField(body.album, uri, res.status, "album"));
  return {
    ...album,
    ...(body.songs ? { songs: toSongs(body.songs) } : {}),
  };
};

export const getAlbumProduct = async (
  id: number,
  options?: RequestOptions,
): Promise<AlbumProduct> => {
  const res = await request(URI_ALBUM_PRODUCT, { id }, "weapi", options);
  // 上游响应结构，字段以 docs/probe/vipmall-albumproduct-detail.json 为准
  const body = res.body as RawAlbumProductDetail;
  const album = requireField(
    body.album,
    URI_ALBUM_PRODUCT,
    res.status,
    "album",
  );
  const price = num(body.product?.price);
  const publishTime = num(body.product?.pubTime);
  return {
    id: num(album.albumId) ?? 0,
    name: album.albumName ?? "",
    coverUrl: album.coverUrl ?? "",
    ...(album.artistName ? { artistName: album.artistName } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(publishTime !== undefined ? { publishTime } : {}),
  };
};

export const getAlbumDynamic = async (
  id: number,
  options?: RequestOptions,
): Promise<AlbumStats> => {
  const res = await request(URI_ALBUM_DYNAMIC, { id }, "weapi", options);
  // 上游响应结构，字段以 docs/probe/album-detail-dynamic.json 为准
  const body = res.body as RawAlbumStats;
  const commentCount = num(body.commentCount);
  const shareCount = num(body.shareCount);
  const subCount = num(body.subCount);
  const likedCount = num(body.likedCount);
  return {
    ...(commentCount !== undefined ? { commentCount } : {}),
    ...(shareCount !== undefined ? { shareCount } : {}),
    ...(subCount !== undefined ? { subCount } : {}),
    ...(likedCount !== undefined ? { likedCount } : {}),
    ...(body.isSub !== undefined ? { isSub: body.isSub } : {}),
  };
};

export const getAlbumSaleBoard = async (
  params: AlbumSaleBoardParams,
  options?: RequestOptions,
): Promise<AlbumSaleBoard> => {
  const type = params.type ?? "daily";
  const uri = `${URI_ALBUM_SALE_BOARD}/${type}/type`;
  const data: Record<string, unknown> = { albumType: params.albumType ?? 0 };
  if (type === "year") data.year = params.year;
  const res = await request(uri, data, "weapi", options);
  // 上游响应结构，字段以 docs/probe/feealbum-songsaleboard-daily-type.json 为准
  const body = res.body as RawAlbumSaleBoard;
  return { albums: (body.products ?? []).map(toProductAlbum) };
};

export const getAlbumPrivileges = async (
  id: number,
  options?: RequestOptions,
): Promise<AlbumPrivilege[]> => {
  const res = await request(URI_ALBUM_PRIVILEGE, { id }, "eapi", options);
  // 上游响应结构，字段以 docs/probe/album-privilege.json 为准
  const body = res.body as RawAlbumPrivileges;
  return (body.data ?? []).map(toAlbumPrivilege);
};

export const getAlbumList = async (
  params: AlbumListParams,
  options?: RequestOptions,
): Promise<AlbumPage> => {
  const res = await request(
    URI_ALBUM_LIST,
    {
      limit: params.limit ?? 30,
      offset: params.offset ?? 0,
      total: true,
      area: params.area ?? "ALL",
      type: params.type,
    },
    "weapi",
    options,
  );
  // 上游响应结构，字段以 docs/probe/vipmall-albumproduct-list.json 为准
  const body = res.body as RawAlbumList;
  const total = num(body.total);
  const products = body.products ?? body.albums;
  return {
    ...(total !== undefined ? { total } : {}),
    ...(body.more !== undefined ? { more: body.more } : {}),
    albums: products?.some(hasProductFields)
      ? products.map(toProductAlbum)
      : toAlbums(body.albums),
  };
};

const PRODUCT_KEYS = ["albumId", "albumName", "artistName"] as const;

const hasProductFields = (raw: object): boolean =>
  PRODUCT_KEYS.some((key) => key in raw);

export const getNewestAlbums = async (
  options?: RequestOptions,
): Promise<Album[]> => {
  const res = await request(URI_NEW_ALBUM, {}, "weapi", options);
  // 上游响应结构，字段以 docs/probe/discovery-newalbum.json 为准
  const body = res.body as RawNewestAlbums;
  return toAlbums(body.albums);
};
