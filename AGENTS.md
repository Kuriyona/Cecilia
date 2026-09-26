# Repository Guidelines

本文件面向在此仓库工作的 AI 助手。凡是「怎么改」「改哪里」「改完怎么验」的问题，先读这里。

## Project Overview

`@kuriyona/cecilia`（当前 `1.0.0-beta.1`）是网易云音乐 API 的非官方 TypeScript 封装。

- **自实现加密与传输**：`node:crypto` + 全局 `fetch`，自带 weapi / eapi / 明文 api 三种模式，**运行时不依赖** `NeteaseCloudMusicApi` 或 `api-enhanced`。
- **Node-only**：`engines.node >= 18`，明确不支持浏览器 / Edge（依赖 `Buffer`、`node:crypto`、`AbortSignal.timeout`）。
- **返回精简领域模型**：37 个导出函数，统一语义词表（`coverUrl` / `avatarUrl` / `creator` / `duration` 毫秒），不把上游原始 JSON 直接抛给调用方。
- 本仓库**不含**服务端；每个函数对应一次（少数两次）上游 HTTP 调用。

## Architecture & Data Flow

严格三层，加一层纯再导出：

```
src/index.ts            # 零逻辑：再导出 37 个函数 + 公共类型 + NeteaseApiError/request + default 对象
  └─ src/apis/<domain>.ts   # 参数组装 → request() → 断言 Raw* → 映射成词表对象
       └─ src/client.ts     # 唯一处理 cookie/header/URL 加密/状态码的地方
            ├─ src/cookies.ts  # cookie 合成与序列化
            ├─ src/crypto/{eapi,weapi}.ts + constants.ts
            └─ src/http.ts     # fetch 封装（postForm / getText）
```

单次调用链（以 `getPlaylistDetail(1)` 为例）：

1. `src/apis/playlist.ts` 组 payload `{ id, n: 100000, s: 8 }`，调用 `request(uri, data, "eapi", options)`。
2. `src/client.ts:49` 归一化 cookie → `buildCookieObject()`；eapi 分支把 `osver/deviceId/os/appver/versioncode/buildver/resolution/__csrf/channel/requestId` 与可选 `MUSIC_U` 塞进 `payload.header`。
3. `eapiEncrypt(uri, payload)`（`src/crypto/eapi.ts`）= AES-128-ECB(`uri-36cd479b6b5-{json}-36cd479b6b5-md5`)；URL 由 `EAPI_DOMAIN + uri.replace(/^\/api/, "/eapi")` 拼出。
4. `src/http.ts` 发 `application/x-www-form-urlencoded`，`res.json` 解析失败 → 抛错。
5. `client.ts` 按 `code` 判定：非 `acceptCodes`（默认 `[200]`）抛 `NeteaseApiError`；网络异常/超时 → `code: -1`。
6. 领域函数把 `res.body as RawX` 后映射（共享适配器在 `src/apis/adapters.ts`）。

**关键不变量**：`request()` 的 `uri` 永远是 `/api/...` 完整路径——eapi 摘要用它（`src/client.ts:75`），URL 路径替换是另一步（`src/client.ts:72`）。传 `/eapi/...` 会算出错误摘要。

## Key Directories

| 路径 | 作用 |
| --- | --- |
| `src/crypto/` | weapi/eapi 算法与常量（`constants.ts` 含域名、UA、PEM、`EAPI_KEY`/`EAPI_SEP`/`PRESET_KEY`/`IV`） |
| `src/client.ts` `src/cookies.ts` `src/http.ts` `src/errors.ts` | 传输层与错误类型 |
| `src/apis/` | 每个域一个文件（`search.ts` / `song.ts` / `playlist.ts` / `artist.ts` / `album.ts`）+ `adapters.ts`（共享映射）+ `require.ts`（必填容器断言） |
| `src/types/` | `common.ts` = 唯一公共语义词表；`raw.ts` = 共享上游原始结构（内部，不导出）；`<domain>.ts` = 域类型 + 端点级 `Raw*`；`params.ts` = 入参类型；单数大写旧文件（`Lyric.ts` / `SongDetails.ts` / `PlaylistDetail.ts`）保留 |
| `src/utils/` | `num.ts`（字符串数字归一）、`parseLrc.ts` / `parseYrc.ts`（歌词）、`parseRelatedPlaylists.ts`（HTML 正则）、`mergeLyricTimelines.ts` |
| `test/` | 离线套件 + live 套件 + 探针 |
| `docs/api-enhanced/` | **已提交**的上游接口索引（440 接口），由 `generate.mjs` 静态生成 |
| `docs/probe/` | **gitignore**：探针 dump 的上游原始响应，是字段路径的唯一实证来源 |
| `api-enhanced/` | **gitignore**：上游参考实现的浅克隆，只读参考，运行时不依赖 |

## Development Commands

```bash
pnpm install                                     # pnpm ^11.4，lockfile 已提交
pnpm test                                        # 离线测试（mock fetch + 加密自洽），不联网
pnpm test:live                                   # 真实网络测试（含探针），60s 超时
pnpm test:live -t probe                          # 只跑探针：刷新 docs/probe/*.json
pnpm exec tsc -p tsconfig.json --noEmit          # 唯一的完整类型检查（仓库无 lint/format 脚本）
pnpm build                                       # tsdown → dist/{index.mjs,index.cjs,index.d.mts,index.d.cts}
pnpm clone:api-enhanced                          # 先 rm -rf api-enhanced 再浅克隆（破坏性，需 SSH 网络）
node docs/api-enhanced/generate.mjs              # 重新生成上游接口索引
```

无 `lint` / `format` / `typecheck` / `prepack` 脚本，也无 eslint/prettier/biome 配置——不要假设存在；`pnpm exec tsc` 是唯一的静态检查入口。发布是手动的：`pnpm build` 之后再 `pnpm publish`。

## Code Conventions & Common Patterns

- **命名**：函数 `getXxx` / `search` / `cloudSearch`；URI 常量 `const URI_XXX = "/api/..."` 放文件顶部；payload 字段**逐字照抄上游**（`n`/`s`/`c`/`privkey` 这类缩写不重命名）。
- **`options?: RequestOptions` 永远是最后一个参数**；单 id 端点用位置参数，多参数端点用 `src/types/params.ts` 的 `<Name>Params`。
- **可选字段用条件展开**，缺失即不写 key（不要写 `field: undefined`）：
  ```ts
  return {
    id,
    ...(fee !== undefined ? { fee } : {}),
    ...(raw.name ? { name: raw.name } : {}),
  };
  ```
- **数值一律过 `num()`**（`src/utils/num.ts`）：上游常把 id/时长给成字符串；`num()` 返回 `undefined` 表示缺失，再走上面的条件展开。
- **空值语义**：数组存在但为空 → 保留 `[]`；字段整体缺失 → 省略 key。**不要**用空数组假装成功。
- **`Raw*` 只声明「探针里真的出现过」的字段**（见 `src/types/raw.ts` 顶部注释），全部可选、数值型写 `number | string`；只能用于 `src/apis/*` 的内部断言，**不得从 `src/index.ts` 导出**。
- **每个新映射前写证据注释**：`// 上游响应结构，字段以 docs/probe/<dump-name>.json 为准`。
- **适配器优先复用**：`src/apis/adapters.ts` 的 `toSong` / `toSongs` / `toArtist(s)` / `toAlbum(s)` / `toAlbumRef` / `toArtistRef` / `toUserRef` / `toPlaylistSummary` / `toMvRef` / `toVideoRef` 供四个域共用，**禁止在域文件里复制第二份**；只有上游结构独一份时才在文件内写局部 `to*`（如 `src/apis/album.ts` 的 `toProductAlbum`）。
- **必填容器缺失就报错**：用 `src/apis/require.ts` 的 `requireField(value, uri, status, field)` 抛 `NeteaseApiError`，而不是产出 `{ id: 0 }` 这类半成品；列表项缺少必填字段（如 `Song.id` / `duration`）则**丢弃该项**（`toSong` 返回 `undefined`，`toSongs` 过滤）。
- **错误处理统一用 `NeteaseApiError`**（`code` / `uri` / `status` / `body`）；`code: -1` 表示网络异常、超时、非 JSON 响应或结构性失败。日志式兜底返回不在本仓库出现。
- **异步**：全部 `async/await`，无回调、无事件发射器、无重试/退避逻辑；超时由 `AbortSignal.timeout(options?.timeout ?? 10_000)` 负责。
- **状态**：模块级只放常量（URI、正则、表）；不缓存响应、不做连接池、不存 token（每次请求现算 cookie）。
- **类型**：禁用 `any`；不要写内联对象断言取成员（禁 `(x as {a: string}).a`），要么 `"k" in x` 窄化，要么把上游 body 断言成一个具名 `Raw*`，并附证据注释。
- **依赖方向**：`playlist.ts → song.ts`（`getPlaylistTracks` 复用 `getSongsDetail`）；`song.ts` 不反向依赖 playlist，避免成环。
- **只在必要时绕过 `client.ts`**：目前只有 `src/apis/playlist.ts` 直接 import `WEAPI_DOMAIN` + `getText`（HTML 抓取）。新端点若走 API，必须走 `request()`。

### 新增一个端点的最小步骤

1. `src/types/raw.ts` 或 `src/types/<domain>.ts` 增加响应结构（只写探针里确认存在的字段）。
2. 需要多参数时在 `src/types/params.ts` 加 `<Name>Params`；返回类型优先复用 `src/types/common.ts` 的词表类型。
3. 在 `src/apis/<domain>.ts` 里加 `const URI_X = "/api/..."` 与 `export const fn = async (…, options?: RequestOptions): Promise<T>`，组 payload → `request(uri, payload, "eapi" | "weapi", options)` → 断言 `RawX` → 映射。
4. `src/index.ts` **三处同步登记且保持同一顺序**：域 import 块、`export { … }` 名单、`export default { … }` 对象；新公共类型加进对应的 `export type { … } from "./types/<file>"`，`Raw*` 不加。
5. 测试与文档：`test/api.test.ts` 增一例（URL + 解密后的 payload + 整形结果），`test/live.test.ts` 增一例真实调用，探针表加一条 dump，README 函数清单加一行。
6. 用探针 dump 校正字段路径——**不要照抄类型猜字段**。

## Important Files

| 文件 | 说明 |
| --- | --- |
| `src/index.ts` | 唯一入口。零逻辑；37 函数 ×3 处登记 + 类型再导出 + `default` 对象。**不要在此写实现** |
| `src/client.ts` | `request(uri, data, crypto, options?, acceptCodes = [200])`；eapi/weapi/api 三支分支、header 与 cookie 策略、`code` 判定 |
| `src/crypto/weapi.ts` | 双层 AES-CBC + RSA。`RSA_NO_PADDING` **必须是定长输入**，故左侧补零到模长（`asymmetricKeyDetails.modulusLength`），不要改成裸 `publicEncrypt` |
| `src/crypto/eapi.ts` | `eapiEncrypt` / `eapiDecrypt`（后者仅供测试与调试，从 `src/crypto` barrel 导出，**不在** `src/index.ts`） |
| `src/cookies.ts` | `buildCookieObject`（`_ntes_nuid`/`WNMCID`/`deviceId` 等默认值，入参同名键优先）；**不设置 `MUSIC_A`**（匿名 token 需 xeapi） |
| `src/apis/adapters.ts` | 上游字段 → 词表的唯一实现处（`al.picUrl → album.coverUrl`、`dt → duration`、`userId → creatorId`、`imgurl16v9 → coverUrl` 等） |
| `tsconfig.json` | `strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` + `types: ["node"]` + `lib: ["ESNext"]` |
| `vitest.config.ts` / `vitest.live.config.ts` | 离线/真实网络的切分（见下节陷阱） |
| `tsdown.config.ts` | `entry: src/index.ts`、`format: ['esm','cjs']`、`dts: true` |
| `docs/api-enhanced/apis.json` | 440 接口：`route` / 模块 `identifier` / `upstream[]` / `crypto[]` / `params[]` / `checkToken[]` / `login`。查上游 uri、加密方式、参数名先看这里 |
| `docs/api-enhanced/generate.mjs` | 纯静态解析本地 `api-enhanced/`（`API_ENHANCED_DIR` 可覆写），零网络；改了索引就重跑，不要手改生成物 |
| `README.md` | 对外契约：37 函数清单、`RequestOptions`、`## 从 0.2 升级`、`## 已知限制` |

## Runtime/Tooling Preferences

- **运行时**：Node ≥ 18（实测开发机 Node 24）。用全局 `fetch`/`Response`/`AbortSignal`，不引入 axios/undici 依赖；`@types/node` 是唯一的 Node 类型来源。
- **包管理**：pnpm（`devEngines.packageManager: pnpm ^11.4.0`），lockfile 已提交；无 `pnpm-workspace.yaml`、无 `.npmrc`。
- **构建**：tsdown（rolldown 内核），`target` 由 tsconfig 推导为 `node18`。`clean: true` 会先清空 `dist/`。构建会有 `MIXED_EXPORTS` 警告（同时存在具名导出与 `default` 导出）——**这是警告不是错误**，`dist` 仍同时产出 ESM/CJS。
- **打包契约**：`type: "module"`、`main: ./dist/index.cjs`、`files: ["dist"]`，`exports` 用嵌套条件分别指向 `./dist/index.d.mts`（import）与 `./dist/index.d.cts`（require）——tsdown **不会**产出 `index.d.ts`，改导出映射时别退回单文件路径。
- **仓库本地注意**：`core.autocrlf=true` 且无 `.gitattributes`，提交时会看到 `LF will be replaced by CRLF` 警告，属正常；`.gitignore` 只有 4 行（`/node_modules`、`/dist`、`/api-enhanced`、`/docs/probe`），`dist/` 可安全删除（构建产物）。
- **不支持**：浏览器、Edge、Deno、Bun 专属 API；不实现 xeapi，也不实现易盾 `checkToken` v2/v3（需要登录态的接口靠调用方传 `options.cookie`）。

## Testing & QA

框架 vitest 4，无覆盖率门槛、无 CI 配置。两套刻意分离的套件：

| 命令 | 包含 | 性质 |
| --- | --- | --- |
| `pnpm test` | `test/{api,client,cookies,crypto,mergeLyricTimelines}.test.ts`（5 文件 / 67 例） | 离线：stub `globalThis.fetch`，1 秒级，可进 CI |
| `pnpm test:live` | `test/live.test.ts`（35 例）+ `test/probe.live.test.ts`（37 例） | 真实网络，`testTimeout: 60_000`，会写 `docs/probe/`，**不可进 CI** |

- **离线 harness 契约**（照抄 `test/client.test.ts` / `test/api.test.ts`）：
  ```ts
  const mockFetch = vi.fn<(input: string, init: RequestInit) => Promise<Response>>();
  beforeEach(() => { globalThis.fetch = mockFetch as unknown as typeof fetch; mockFetch.mockReset(); });
  afterEach(() => { globalThis.fetch = originalFetch; });
  // 用 mockResolvedValueOnce 排队；多段式接口（getPlaylistTracks / getSimilarSongs）按顺序排两个响应
  ```
  断言对象是 Node 原生 `Response`，不引入 msw/nock；无 `test/fixtures/` 目录，输入字面量内联在测试文件里（`rawSong` / `rawArtist` / HTML 字符串）。
- **`test/api.test.ts` 的解密断言**：文件顶部 `vi.mock("node:crypto", …)` 把 `randomInt` 固定为 `0`，使 weapi 的随机 `secretKey` 恒为 `FIXED_SECRET_KEY = "aaaaaaaaaaaaaaaa"`。因此：
  - eapi 请求体 → `eapiFormOf(i)`；weapi 请求体 → `weapiFormOf(i)`；
  - **不要**对 weapi 用 `formOf(i).get("字段")`，它只会拿到 `params`/`encSecKey` 而返回 `null`。
  - eapi 的 `requestId` 含时间戳，断言只匹配形状（`/^\d+_\d{4}$/`）。
- **每例应覆盖**：精确上游 URL（含 host，即加密方式）、解密后的 payload、整形结果（`toEqual`）、省略规则、错误路径（`rejects.toMatchObject({ code: … })`）。**不要**断言接线、mock 回显、纯量长、同路径重复行，也不要重新钉死上游措辞。
- **live 探针**（`test/probe.live.test.ts`）：`describe("probe")` 便于 `pnpm test:live -t probe`；数据驱动表 `RAW_PROBES` 逐条 `request()` 原始调用，把 body 写入 `docs/probe/<dump-name>.json` 并断言 `code === 200`（这是「自实现加密真的被上游接受」的唯一硬证据）；失败写 `<dump-name>.error.txt`（ISO 时间 + 错误 + `error.body`）后 rethrow。`playlist-track-all`（两段式）与 `related-playlist`（HTML）存的是整形结果。dump-name ≈ 上游 uri 去掉 `/api/` 后 `/` → `-`。
- **live 数据**：歌手 HoYo-MiX `12487174`、Chevy `47992679`；`playlistId` / `albumId` / `productAlbumId` / `topSongId` 在 `beforeAll` 派生（派生失败即整组失败，符合预期）。
- **已知陷阱（勿重复踩）**：
  - `**/*.live.test.ts` 这类 glob 要求 `.live.` 前有路径段，**匹配不到** `test/live.test.ts`。故 `vitest.config.ts` 必须同时显式排除 `"test/live.test.ts"`，`vitest.live.config.ts` 必须显式 include 它——改这两处配置后请核对 `pnpm test` 的文件数（应为 5）与 `pnpm test:live`（应为 2）。
  - vitest 默认 `exclude` 只有 `node_modules` 与 `.git`，`dist/`、`docs/` 不在其中；`api-enhanced/**` 靠本仓库配置排除（那份克隆自带测试，一旦被收集就会因缺 axios 而失败）。
  - `docs/probe/` 是 gitignore 的本地证据；不要把它当作可提交产物，也不要手改 dump。

## 当前范围与已知缺口

- 导出 **37** 个函数（搜索 7 / 歌曲 6 / 歌单 8 / 歌手 9 / 专辑 7）。
- `/simi/artist`（相似歌手）**已从范围移除**：weapi 与明文 api 均返回 `code 301 未登录`，记录在 `docs/probe/discovery-simiartist.error.txt`，README 已注明；不要凭 api-enhanced 的索引把它加回来，除非先有可用 cookie 的探针证据。
- `/song/url`（eapi）只给试听片段，完整/高码率需会员 cookie；`/song/url/v1`（xeapi）本期未实现。
- 少数声明了但当前无数据来源的可选字段（如 `AlbumProduct.description`、`AlbumSaleBoard.updateTime`、产品路径上的 `Album.artists`）——类型存在 ≠ 有赋值，别据此假设上游给了字段。
