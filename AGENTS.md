# Repository Guidelines

本文件面向在此仓库工作的 AI 助手。凡是「怎么改」「改哪里」「改完怎么验」的问题，先读这里。

## Project Overview

`@kuriyona/cecilia`（当前 `2.0.0-beta.1`）是网易云音乐 API 的非官方 TypeScript 封装。

- **自实现加密与传输**：`node:crypto` + 全局 `fetch`，自带 weapi / eapi / 明文 api 三种模式，**运行时不依赖** `NeteaseCloudMusicApi` 或 `api-enhanced`。
- **Node-only**：`engines.node >= 18`，明确不支持浏览器 / Edge（依赖 `Buffer`、`node:crypto`、`AbortSignal.timeout`）。
- **返回精简领域模型**：37 个导出函数，统一语义词表（`coverUrl` / `avatarUrl` / `creator` / `duration` 毫秒），不把上游原始 JSON 直接抛给调用方。
- 本仓库主入口**不含服务端逻辑**；每个函数对应一次（少数两次）上游 HTTP 调用。可选子路径 `@kuriyona/cecilia/elysia` 提供 Elysia 服务器（37 条 GET 路由），只有该子路径的监听需要 **Bun**。

## Architecture & Data Flow

严格三层，加一层纯再导出：

```
src/index.ts            # 零逻辑：再导出 37 个函数 + 公共类型 + NeteaseApiError/request + default 对象
  └─ src/apis/<domain>.ts   # 参数组装 → request() → 断言 Raw* → 映射成词表对象
       └─ src/client.ts     # 唯一处理 cookie/header/URL 加密/状态码的地方
            ├─ src/cookies.ts  # cookie 合成与序列化
            ├─ src/crypto/{eapi,weapi}.ts + constants.ts
            └─ src/http.ts     # fetch 封装（postForm / getText）

src/elysia/index.ts     # 可选子路径（第二个 tsdown entry；Bun-only 监听）：createApp / startServer
  ├─ src/elysia/routes.ts   # 37 条 GET 路由：query 校验 → 调 src/index.ts 的库函数 → 原样返回
  ├─ src/elysia/app.ts      # createApp：可选 cors / auth 中间件 + registerRoutes
  └─ src/elysia/server.ts   # startServer：Bun 守卫 + app.listen + 实际监听地址
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
| `src/elysia/` | 可选子路径 `@kuriyona/cecilia/elysia`：把 37 个函数包成 Elysia 路由 + `startServer`；`elysia` / `@elysiajs/cors` 为可选 peer |
| `examples/` | `elysia-server.ts`（`bun run examples/elysia-server.ts` 可直接起服务；已纳入 `tsconfig.include`） |
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
pnpm build                                       # tsdown → dist/{index,elysia}.{mjs,cjs,d.mts,d.cts}（共享 chunk 另计）
pnpm clone:api-enhanced                          # 先 rm -rf api-enhanced 再浅克隆（破坏性，需 SSH 网络）
node docs/api-enhanced/generate.mjs              # 重新生成上游接口索引
bun run examples/elysia-server.ts                # 起 Elysia 示例服务器（需 Bun；PORT / HOST / TOKEN 环境变量可选）
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

### `src/elysia/` 子路径约定

- **只做 HTTP 适配，不复制业务逻辑**：handler 一律 `({ query, request, set }) => <src/index.ts 的库函数>(…, optionsOf(request))`，返回值直接交给 Elysia 序列化/整形，不二次包装；新函数登记到 `src/elysia/routes.ts` 里对应域的 `*Routes`，并保持与 `src/index.ts` 相同的域顺序与登记粒度（37 个函数 = 37 条路由）。
- **id 一律走 query，不用 path param**：单个 id 用 `t.Numeric()`，列表用 `t.String({ pattern: "^[0-9]+(,[0-9]+)*$" })` 再 `split(",").map(Number)`。
- **枚举型 query 不用 `t.Union`**：用 `t.Optional(t.String())` + 白名单常量（`as const satisfies readonly NonNullable<XxxParams["order"]>[]`，与 `src/types/params.ts` 绑定）经 `pickEnum()` 窄化，越界回 `400`；`type` 参数同理（数字 + `SEARCH_TYPES.find`）。不要复制第二份字面量列表。
- **Cookie 转发**：`optionsOf(request)` 把入站 `Cookie` 头原样交给 `RequestOptions.cookie`；服务端不存 token、不注入匿名 token。
- **只有 `startServer` 需要 Bun**：守卫是 `"Bun" in globalThis`（不要写 `typeof Bun`，会引入 Bun 全局类型）。`createApp()` / `app.handle()` 与运行时无关——离线测试正是这么测的。
- **`elysia` / `@elysiajs/cors` 是 optional peer**：只能在 `src/elysia/*` 里 import，主入口不得引入；两者都写在 `peerDependencies`（tsdown 默认不打包 peer），并同时装进 `devDependencies` 供类型与测试使用。
- **公开返回类型用 `AnyElysia`**（`elysia` 导出），不要写裸 `Elysia`：链式 `.get()` 推出来的具体路由类型赋值给裸 `Elysia` 会因不变型泛型失败，且会往 dts 塞进巨大推断结构。

### 新增一个端点的最小步骤

1. `src/types/raw.ts` 或 `src/types/<domain>.ts` 增加响应结构（只写探针里确认存在的字段）。
2. 需要多参数时在 `src/types/params.ts` 加 `<Name>Params`；返回类型优先复用 `src/types/common.ts` 的词表类型。
3. 在 `src/apis/<domain>.ts` 里加 `const URI_X = "/api/..."` 与 `export const fn = async (…, options?: RequestOptions): Promise<T>`，组 payload → `request(uri, payload, "eapi" | "weapi", options)` → 断言 `RawX` → 映射。
4. `src/index.ts` **三处同步登记且保持同一顺序**：域 import 块、`export { … }` 名单、`export default { … }` 对象；新公共类型加进对应的 `export type { … } from "./types/<file>"`，`Raw*` 不加。
5. 测试与文档：`test/api.test.ts` 增一例（URL + 解密后的 payload + 整形结果），`test/live.test.ts` 增一例真实调用，探针表加一条 dump，README 函数清单加一行；同时在 `src/elysia/routes.ts` 对应域的 `*Routes` 里补一条 GET 路由，并给 README 路由表补一行（37 函数 = 37 路由，两边保持同步）。
6. 用探针 dump 校正字段路径——**不要照抄类型猜字段**。

## Important Files

| 文件 | 说明 |
| --- | --- |
| `src/index.ts` | 唯一入口。零逻辑；37 函数 ×3 处登记 + 类型再导出 + `default` 对象。**不要在此写实现** |
| `src/elysia/index.ts` | 可选子路径 `@kuriyona/cecilia/elysia` 的 barrel：`createApp` / `startServer` + 选项类型 + 再导出 `CORSConfig`；**无 default 导出** |
| `src/client.ts` | `request(uri, data, crypto, options?, acceptCodes = [200])`；eapi/weapi/api 三支分支、header 与 cookie 策略、`code` 判定 |
| `src/crypto/weapi.ts` | 双层 AES-CBC + RSA。`RSA_NO_PADDING` **必须是定长输入**，故左侧补零到模长（`asymmetricKeyDetails.modulusLength`），不要改成裸 `publicEncrypt` |
| `src/crypto/eapi.ts` | `eapiEncrypt` / `eapiDecrypt`（后者仅供测试与调试，从 `src/crypto` barrel 导出，**不在** `src/index.ts`） |
| `src/cookies.ts` | `buildCookieObject`（`_ntes_nuid`/`WNMCID`/`deviceId` 等默认值，入参同名键优先）；**不设置 `MUSIC_A`**（匿名 token 需 xeapi） |
| `src/apis/adapters.ts` | 上游字段 → 词表的唯一实现处（`al.picUrl → album.coverUrl`、`dt → duration`、`userId → creatorId`、`imgurl16v9 → coverUrl` 等） |
| `tsconfig.json` | `strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` + `types: ["node"]` + `lib: ["ESNext"]` + `include: ["src","test","docs","examples"]`。`@types/bun` 只是 devDependency，靠 `elysia` 的 d.ts 引用 `'bun'` 传递性加载，**不要**加进 `types` 数组 |
| `vitest.config.ts` / `vitest.live.config.ts` | 离线/真实网络的切分（见下节陷阱） |
| `tsdown.config.ts` | 双入口 `{ index: 'src/index.ts', elysia: 'src/elysia/index.ts' }`、`format: ['esm','cjs']`、`dts: true`；peer 依赖自动 external，两个入口共享 chunk |
| `docs/api-enhanced/apis.json` | 440 接口：`route` / 模块 `identifier` / `upstream[]` / `crypto[]` / `params[]` / `checkToken[]` / `login`。查上游 uri、加密方式、参数名先看这里 |
| `docs/api-enhanced/generate.mjs` | 纯静态解析本地 `api-enhanced/`（`API_ENHANCED_DIR` 可覆写），零网络；改了索引就重跑，不要手改生成物 |
| `package.json` | 双导出映射 `.` 与 `./elysia`（都带 types/import/require 嵌套条件）、`peerDependencies`（`elysia` / `@elysiajs/cors`，`peerDependenciesMeta` 标 optional） |
| `README.md` | 对外契约：37 函数清单、`RequestOptions`、`## 起一个 HTTP 服务器（可选，Bun）`（选项 + 路由表）、`## 从 0.2 升级`、`## 已知限制` |

## Runtime/Tooling Preferences

- **运行时**：Node ≥ 18（实测开发机 Node 24）。用全局 `fetch`/`Response`/`AbortSignal`，不引入 axios/undici 依赖；`@types/node` 是 Node 类型来源，`@types/bun` 只是为了解析 `./elysia` 依赖链里的 `'bun'` 模块（dev-only，别加进 `tsconfig.types`）。
- **包管理**：pnpm（`devEngines.packageManager: pnpm ^11.4.0`），lockfile 已提交；无 `pnpm-workspace.yaml`、无 `.npmrc`。
- **构建**：tsdown（rolldown 内核），`target` 由 tsconfig 推导为 `node18`。`clean: true` 会先清空 `dist/`。构建会有 `MIXED_EXPORTS` 警告（`src/index.ts` 同时存在具名导出与 `default` 导出）——**这是警告不是错误**，`dist` 仍同时产出 ESM/CJS；`src/elysia` 没有 default 导出，不触发该警告。
- **打包契约**：`type: "module"`、`main: ./dist/index.cjs`、`files: ["dist"]`，`exports` 用嵌套条件分别指向 `./dist/index.d.mts`（import）与 `./dist/index.d.cts`（require）——tsdown **不会**产出 `index.d.ts`，改导出映射时别退回单文件路径。`./elysia` 子路径同理指向 `dist/elysia.{d.mts,mjs,d.cts,cjs}`；两个入口共享 `dist/src-*.mjs` / `dist/src-*.cjs` chunk（`files: ["dist"]` 已覆盖）。
- **仓库本地注意**：`core.autocrlf=true` 且无 `.gitattributes`，提交时会看到 `LF will be replaced by CRLF` 警告，属正常；`.gitignore` 只有 4 行（`/node_modules`、`/dist`、`/api-enhanced`、`/docs/probe`），`dist/` 可安全删除（构建产物）。
- **不支持**：浏览器、Edge、Deno；主入口只用 Node 通用 API（不依赖 Bun 专属 API），不实现 xeapi，也不实现易盾 `checkToken` v2/v3（需要登录态的接口靠调用方传 `options.cookie`）。唯一要求 Bun 的是 `./elysia` 子路径的 `startServer`（`app.listen` 走 Elysia 的 Bun 适配器，非 Bun 环境立即抛错）。

## Testing & QA

框架 vitest 4，无覆盖率门槛、无 CI 配置。两套刻意分离的套件：

| 命令 | 包含 | 性质 |
| --- | --- | --- |
| `pnpm test` | `test/{api,client,cookies,crypto,mergeLyricTimelines,elysia}.test.ts`（6 文件 / 77 例） | 离线：stub `globalThis.fetch`，1 秒级，可进 CI |
| `pnpm test:live` | `test/live.test.ts`（36 例）+ `test/probe.live.test.ts`（37 例） | 真实网络，`testTimeout: 60_000`，会写 `docs/probe/`，**不可进 CI** |

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
- **`test/elysia.test.ts`**：不监听端口，全部走 `createApp().handle(new Request("http://localhost/search?keywords=…"))`（harness 与上同）；覆盖路由转发（上游 URL + eapi payload + 结果与直接调用库函数一致）、未知路径 `404`、id 列表不合法 `422`、枚举越界 `400`、`Bearer` 鉴权 `401` / scheme 大小写、CORS 预检 `204` + `access-control-allow-origin`、入站 Cookie 转发（断言 eapi `payload.header.MUSIC_U`）。`startServer` 只在 `!("Bun" in globalThis)` 时断言抛错，因此在 Bun 下跑 vitest 也不会误报。
- **每例应覆盖**：精确上游 URL（含 host，即加密方式）、解密后的 payload、整形结果（`toEqual`）、省略规则、错误路径（`rejects.toMatchObject({ code: … })`）。**不要**断言接线、mock 回显、纯量长、同路径重复行，也不要重新钉死上游措辞。
- **live 探针**（`test/probe.live.test.ts`）：`describe("probe")` 便于 `pnpm test:live -t probe`；数据驱动表 `RAW_PROBES` 逐条 `request()` 原始调用，把 body 写入 `docs/probe/<dump-name>.json` 并断言 `code === 200`（这是「自实现加密真的被上游接受」的唯一硬证据）；失败写 `<dump-name>.error.txt`（ISO 时间 + 错误 + `error.body`）后 rethrow。`playlist-track-all`（两段式）与 `related-playlist`（HTML）存的是整形结果。dump-name ≈ 上游 uri 去掉 `/api/` 后 `/` → `-`。
- **live 数据**：歌手 HoYo-MiX `12487174`、Chevy `47992679`；`playlistId` / `albumId` / `productAlbumId` / `topSongId` 在 `beforeAll` 派生（派生失败即整组失败，符合预期）。
- **已知陷阱（勿重复踩）**：
  - `**/*.live.test.ts` 这类 glob 要求 `.live.` 前有路径段，**匹配不到** `test/live.test.ts`。故 `vitest.config.ts` 必须同时显式排除 `"test/live.test.ts"`，`vitest.live.config.ts` 必须显式 include 它——改这两处配置后请核对 `pnpm test` 的文件数（应为 6）与 `pnpm test:live`（应为 2）。
  - vitest 默认 `exclude` 只有 `node_modules` 与 `.git`，`dist/`、`docs/` 不在其中；`api-enhanced/**` 靠本仓库配置排除（那份克隆自带测试，一旦被收集就会因缺 axios 而失败）。
  - `docs/probe/` 是 gitignore 的本地证据；不要把它当作可提交产物，也不要手改 dump。

## 当前范围与已知缺口

- 导出 **37** 个函数（搜索 7 / 歌曲 6 / 歌单 8 / 歌手 9 / 专辑 7）。
- 可选子路径 `@kuriyona/cecilia/elysia`：37 个函数各一条 GET 路由 + `createApp` / `startServer`；`elysia` / `@elysiajs/cors` 为 optional peer，**监听只能在 Bun**（Node 下 `startServer` 抛错，`createApp()` 仍可自备适配器使用）。
- `/simi/artist`（相似歌手）**已从范围移除**：weapi 与明文 api 均返回 `code 301 未登录`，记录在 `docs/probe/discovery-simiartist.error.txt`，README 已注明；不要凭 api-enhanced 的索引把它加回来，除非先有可用 cookie 的探针证据。
- `/song/url`（eapi）只给试听片段，完整/高码率需会员 cookie；`/song/url/v1`（xeapi）本期未实现。
- 少数声明了但当前无数据来源的可选字段（如 `AlbumProduct.description`、`AlbumSaleBoard.updateTime`、产品路径上的 `Album.artists`）——类型存在 ≠ 有赋值，别据此假设上游给了字段。
