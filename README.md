# Cecilia

网易云音乐 API 的非官方 TypeScript 封装。自行实现 weapi / eapi 加密与传输层（`node:crypto` + 全局 `fetch`），**不支持浏览器、Edge 等运行时，需要 Node ≥ 18**。

## 安装

```bash
pnpm add @kuriyona/cecilia
```

## 使用

```ts
import {
  getArtist,
  getPlaylistTracks,
  getSongUrl,
  search,
} from '@kuriyona/cecilia'
```

所有函数返回**精简后的领域模型**（统一语义词表：`coverUrl`、`avatarUrl`、`creator`、`duration`（毫秒）等），可选项在原始响应缺失时不会出现。每个函数都接受末位可选的 `options`：

```ts
interface RequestOptions {
  cookie?: string | Record<string, string> // 登录态，如浏览器复制的含 MUSIC_U 的 cookie
  realIP?: string
  timeout?: number // 默认 10000
  ua?: string
}
```

```ts
const artists = await search({ keywords: 'HoYo-MiX', type: 100 })
const playlistId = artists.artists![0].id
const tracks = await getPlaylistTracks({ id: playlistId, limit: 10 })
const urls = await getSongUrl({ id: tracks.map((t) => t.id) })
```

### 搜索

```ts
search(params) // keywords, type?, limit?, offset?
cloudSearch(params)
getSearchSuggest(params) // keywords?, mobile?
getHotSearches()
getHotSearchDetail()
getDefaultSearchKeyword()
searchMultimatch(params)
```

### 歌曲与歌词

```ts
getSongsDetail(ids: number[])
getSongUrl(params) // id, br?
checkMusic(params) // id, br?
getLyric(id)
getLyricNew(id) // 含 wordLines 逐字歌词与 romaLines 罗马音
getSimilarSongs(id)
```

### 歌单

```ts
getPlaylistDetail(id)
getPlaylistTracks(params) // id, limit?, offset?
getPlaylistDetailDynamic(id)
getHighQualityTags()
getTopPlaylists(params)
getHighQualityPlaylists(params)
getPlaylistCategories()
getRelatedPlaylists(id)
```

### 歌手

```ts
getArtist(id)
getArtistDetail(id)
getArtistSongs(params)
getArtistTopSongs(id)
getArtistAlbums(params)
getArtistList(params)
getArtistDesc(id)
getArtistMvs(params)
getArtistVideos(params)
```

### 专辑

```ts
getAlbum(id)
getAlbumProduct(id)
getAlbumDynamic(id)
getAlbumSaleBoard(params)
getAlbumPrivileges(id)
getAlbumList(params)
getNewestAlbums()
```

### 示例

```ts
const detail = await getPlaylistDetail(123)
// {
//   id: 123,
//   name: '歌单名',
//   creatorId: 789,
//   coverUrl: 'https://example.com/cover.jpg',
//   createTime: 1000000,
//   songs: [{ id: 1, addTime: 2000000 }, ...] // 仅曲目 id，全量歌曲用 getPlaylistTracks
// }

const songs = await getSongsDetail([1, 2])
// [
//   {
//     id: 1,
//     name: 'Song A',
//     artists: [{ id: 10, name: 'Artist 1' }],
//     album: { id: 100, name: 'Album A', coverUrl: '...' },
//     duration: 200000,
//   },
// ]
```

## 从 0.2 升级

`getPlaylistDetail` / `getLyric` / `getSongsDetail` 已改为走加密接口并对齐新词表（破坏性变更）：

- `PlaylistDetails` → `PlaylistDetail`；`coverImgUrl` → `coverUrl`；`userId` → `creatorId`；删除 `coverImgId`
- `getSongsDetail` 的 `album.picUrl` → `album.coverUrl`；`SongDetail` 现为 `Song` 的别名
- `getLyric` 返回值不变

## 已知限制

- `/song/url`（eapi）免登录可用，但普通 cookie 只返回试听片段（`freeTrialInfo` 会给出截取起止时间），完整/高码率需要会员 cookie；`/song/url/v1`（xeapi）本期未实现。
- **未实现匿名 token 与易盾反作弊 token（`checkToken` v2/v3）**，也不实现 xeapi。部分接口因此需要自行传入登录 cookie 才能调用。
- `/simi/artist`（相似歌手）上游返回 `code 301 未登录`（weapi 与明文 api 均如此），本期未纳入导出。
- `search({ type: 2000 })` 的语音搜索分支依赖上游当前响应结构（`songs` 或 `resources`），结构变化时会抛 `NeteaseApiError` 而不是返回空结果。
- `getRelatedPlaylists` 抓取 `music.163.com/playlist?id=` 的 HTML；页面结构变化时会抛 `NeteaseApiError`。
- 上游非 200 的成功码（如 `201`）默认视为失败；`request()` 的 `acceptCodes` 内部参数可按接口放行。

## 开发

```bash
pnpm test         # 离线测试（mock fetch + 加密自洽 + 响应整形）
pnpm test:live    # 真实网络测试（含 test/probe.live.test.ts 探针，dump 到 docs/probe/）
pnpm test:watch   # 监听模式
pnpm build        # 构建
pnpm clone:api-enhanced # 拉取 api-enhanced 参考实现（仅供比对，运行时不依赖）
```

离线测试直接断言各接口的请求 URL、加密方式与整形结果，不需要网络；`pnpm test:live -t probe` 会把上游原始响应写入 `docs/probe/<api>.json`（已 gitignore），用于核对字段路径。
