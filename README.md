# Cecilia

网易云音乐 API 的非官方 TypeScript 封装。自行实现 weapi / eapi 加密与传输层（`node:crypto` + 全局 `fetch`），**不支持浏览器、Edge 等运行时，需要 Node ≥ 18**。

可选地，通过 `@kuriyona/cecilia/elysia` 子路径可以把这 37 个函数起成一个 HTTP 服务（各一条 `GET` 路由）；该子路径需要额外安装 `elysia` + `@elysiajs/cors`，并**只能在 Bun 下监听**。

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

## 起一个 HTTP 服务器（可选，Bun）

`@kuriyona/cecilia/elysia` 把 37 个函数各暴露成一条 `GET` 路由：既可以直接拿它返回的 Elysia 实例挂进自己的应用，也可以一键起服务。

```bash
pnpm add elysia @elysiajs/cors
```

```ts
import { createApp, startServer } from '@kuriyona/cecilia/elysia'

// 1) 只要现成的 Elysia 实例，自己 .use() / .listen() / 挂到别的实例上
const app = createApp({ cors: { origin: ['http://localhost:5173'] } })

// 2) 或者直接起服务：host/port 默认取 HOST / PORT 环境变量（缺省 127.0.0.1:3000）
const { app, url } = startServer({
  port: 3000,
  cors: { origin: true },
  auth: { token: process.env.TOKEN! }, // 要求 Authorization: Bearer <token>
})
console.log(`listening on ${url}`)
// 关闭：app.stop()
```

仓库内自带可运行示例：

```bash
PORT=3000 TOKEN=demo bun run examples/elysia-server.ts
```

> `startServer` 依赖 Bun 的 `serve`，在 Node 下会**立即抛错**；`createApp()` 与 `app.handle()` 与运行时无关，也可以在 Node 里自备适配器使用。

### 服务器选项

| 字段 | 说明 |
| --- | --- |
| `host` | 监听地址，默认 `process.env.HOST ?? '127.0.0.1'` |
| `port` | 监听端口，默认 `process.env.PORT ?? 3000`；`PORT` 非法直接抛错；`port: 0` 取随机端口（返回的 `url` 是实际地址） |
| `cors` | 原样透传给 `@elysiajs/cors` 的 `CORSConfig`；不传则完全不启用 CORS |
| `auth` | `{ token }`：所有路由都要求 `Authorization: Bearer <token>`（scheme 大小写不敏感、常量时间比较），失败返回 `401 { code: 401, message: 'Unauthorized' }` |

- 入站 `Cookie` 头会**原样转发**给上游，客户端因此可以自带登录态（含 `MUSIC_U`）；服务端不保存任何 token。
- 参数错误：id 列表不合法 → `422`；`type` / `order` / `albumType` 等枚举越界 → `400`；未知路径 → `404`。
- 上游报错（`NeteaseApiError`）不拦截，走 Elysia 默认错误处理（`500`）。

### 路由表

| `GET` 路径 | query 参数 | 对应函数 |
| --- | --- | --- |
| `/search` | `keywords`（必填）、`type`、`limit`、`offset` | `search` |
| `/cloudsearch` | 同上 | `cloudSearch` |
| `/search/suggest` | `keywords`、`mobile` | `getSearchSuggest` |
| `/search/hot` | — | `getHotSearches` |
| `/search/hot/detail` | — | `getHotSearchDetail` |
| `/search/default-keyword` | — | `getDefaultSearchKeyword` |
| `/search/multimatch` | `keywords`、`type` | `searchMultimatch` |
| `/song/detail` | `ids`（`1,2,3`） | `getSongsDetail` |
| `/song/url` | `id`（`1,2`）、`br` | `getSongUrl` |
| `/lyric` | `id` | `getLyric` |
| `/lyric/new` | `id` | `getLyricNew` |
| `/check/music` | `id`、`br` | `checkMusic` |
| `/simi/song` | `id` | `getSimilarSongs` |
| `/playlist/detail` | `id` | `getPlaylistDetail` |
| `/playlist/track/all` | `id`、`limit`、`offset` | `getPlaylistTracks` |
| `/playlist/detail/dynamic` | `id` | `getPlaylistDetailDynamic` |
| `/playlist/highquality/tags` | — | `getHighQualityTags` |
| `/playlist/top` | `cat`、`order`（`hot`/`new`）、`limit`、`offset` | `getTopPlaylists` |
| `/playlist/highquality/list` | `cat`、`limit`、`before` | `getHighQualityPlaylists` |
| `/playlist/catalogue` | — | `getPlaylistCategories` |
| `/playlist/related` | `id` | `getRelatedPlaylists` |
| `/artist` | `id` | `getArtist` |
| `/artist/detail` | `id` | `getArtistDetail` |
| `/artist/songs` | `id`、`order`（`hot`/`time`）、`limit`、`offset` | `getArtistSongs` |
| `/artist/top/song` | `id` | `getArtistTopSongs` |
| `/artist/album` | `id`、`limit`、`offset` | `getArtistAlbums` |
| `/artist/list` | `area`、`type`、`initial`、`limit`、`offset` | `getArtistList` |
| `/artist/desc` | `id` | `getArtistDesc` |
| `/artist/mv` | `id`、`limit`、`offset` | `getArtistMvs` |
| `/artist/video` | `id`、`size`、`cursor`、`order` | `getArtistVideos` |
| `/album` | `id` | `getAlbum` |
| `/album/product` | `id` | `getAlbumProduct` |
| `/album/dynamic` | `id` | `getAlbumDynamic` |
| `/album/sale/board` | `albumType`（`0`/`1`）、`type`（`daily`/`week`/`year`/`total`）、`year` | `getAlbumSaleBoard` |
| `/album/privilege` | `id` | `getAlbumPrivileges` |
| `/album/list` | `area`、`type`、`limit`、`offset` | `getAlbumList` |
| `/album/new` | — | `getNewestAlbums` |

```ts
// 例：带上自己的登录 cookie 走一遍服务端
const res = await fetch('http://127.0.0.1:3000/search?keywords=HoYo-MiX&type=100', {
  headers: { cookie: 'MUSIC_U=...' },
})
const { artists } = (await res.json()) as SearchResult
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
- `@kuriyona/cecilia/elysia` 的 `startServer` 只在 **Bun** 下可用（Node 下抛错）；它不缓存响应、不存 token，也不会注入匿名 token，会员态仍需客户端自带 cookie。

## 开发

```bash
pnpm test         # 离线测试（mock fetch + 加密自洽 + 响应整形）
pnpm test:live    # 真实网络测试（含 test/probe.live.test.ts 探针，dump 到 docs/probe/）
pnpm test:watch   # 监听模式
pnpm build        # 构建（dist/{index,elysia}.{mjs,cjs,d.mts,d.cts}）
pnpm clone:api-enhanced # 拉取 api-enhanced 参考实现（仅供比对，运行时不依赖）
bun run examples/elysia-server.ts # 起 Elysia 示例服务器（需 Bun；PORT / TOKEN 可选）
```

离线测试直接断言各接口的请求 URL、加密方式与整形结果，不需要网络；`pnpm test:live -t probe` 会把上游原始响应写入 `docs/probe/<api>.json`（已 gitignore），用于核对字段路径。
