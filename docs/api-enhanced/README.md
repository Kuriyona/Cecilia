# api-enhanced 接口索引

**粗略索引，非完整文档。** 完整参数说明 / 调用例子见上游 `api-enhanced/public/docs/home.md`。

## 数据来源

| 项 | 值 |
| --- | --- |
| 上游仓库 | `git@github.com:NeteaseCloudMusicApiEnhanced/api-enhanced.git` |
| 上游版本 | `@neteasecloudmusicapienhanced/api@4.40.1` |
| 上游提交 | `a8c781f` (2026-09-12T00:46:53+08:00) |
| 本地路径 | `api-enhanced/`（`pnpm clone:api-enhanced`） |
| 生成时间 | 2026-09-26 07:41:45 UTC |
| 生成方式 | `node docs/api-enhanced/generate.mjs`（纯静态解析，不联网） |

## 目录内容

| 文件 | 说明 |
| --- | --- |
| `README.md` | 本文件：字段约定、鉴权模型、统计、按分类索引 |
| `apis.md` | 全部 440 个接口的索引表，按分类分组 |
| `apis.json` | 同上的机器可读版本（含参数名、checkToken 等明细） |
| `generate.mjs` | 生成脚本；上游更新后重跑即可刷新 |

## 字段约定

| 字段 | 含义 |
| --- | --- |
| 路由 | 本地 HTTP 路径，`module/xxx_yyy.js` → `/xxx/yyy`；`daily_signin`/`fm_trash`/`personal_fm` 为 `server.js` 硬编码特例 |
| 模块 | `module/` 下文件名（去掉 `.js`），也是 Node.js 引入时的导出名（`main.js`） |
| 上游 | 转发到的网易云接口路径，取自模块里 `request('/api/...')` 的字面量；可能含模板变量或多条子请求 |
| 加密方式 | 请求体的加密/签名方案，取自 `createOption(query, crypto)`；模块未显式指定时由 `util/config.json` 的 `APP_CONF.encrypt=true` 决定，即默认 `eapi`。`-` 表示该模块压根没走 `createOption`（本地计算、走 axios 抓页或纯工具函数），而不是「未知」 |
| 登录 | 是否必须登录。`是` = 上游文档明确写了「需要登录 / 登录后调用 / 301」；`否` = 文档明确写了「不需要登录」；`?` = 文档未标注，**不做猜测**。`是` 包含上游自己的表述，如 `/album/new` 文档写的就是「登录后调用」 |
| 参数 | `interface.d.ts` 中该导出函数的专属参数名（不含 `RequestBaseConfig` 通用项）；空 = 只有通用参数 |
| 文档 | 上游 `public/docs/home.md` 中对应章节标题；`-` 表示文档未覆盖 |

### 通用参数（`RequestBaseConfig`，所有接口可用）

| 参数 | 说明 |
| --- | --- |
| `cookie` | 凭证字符串或对象，如 `MUSIC_U=xxx`（登录接口返回值里的 `cookie` 字段） |
| `realIP` | 写入 `X-Real-IP` / `X-Forwarded-For`，用于绕过「460 cheating」等地区限制 |
| `randomCNIP` | 随机中国 IP；仅当环境变量 `ENABLE_RANDOM_CN_IP=true` 时才不传即默认开启 |
| `proxy` | 单次请求代理（支持 PAC 与 http 隧道）；环境变量代理无效 |
| 其他 | `crypto`（覆盖加密方式）、`ua`、`domain`、`headers`、`timeout`、`e_r`（返回值加密）、`noCookie`（不向响应写 `Set-Cookie`） |

## 鉴权模型

上游没有「是否需登录」的声明式元数据，实际鉴权分三层：

1. **匿名 token**：服务启动时 `generateConfig()` 在 `os.tmpdir()` 写入 `anonymous_token` 与 `xeapi_public_key`，`util/request.js` 在 require 时同步读取。缺失/过期会报错，重启服务即可刷新。
2. **cookie / `MUSIC_U`**：登录接口返回 `cookie`（含 `MUSIC_U`、`__csrf` 等）。服务端模式下由浏览器 cookie 或 `?cookie=xxx`（需 `encodeURIComponent`）传入；`main.js` 在 Node 调用时把 cookie 字符串转成对象。`__csrf` 会被填进 `csrf_token` 参与 weapi 加密。
3. **游客登录**：`/register/anonimous` 可拿游客 cookie，用于规避未登录时的 400 验证错误。

与加密方式的关系：`weapi` 走 `music.163.com/weapi/*`（带 `Referer` + `csrf_token`）；`eapi`（当前默认）走 `interfacepc.music.163.com/eapi/*`；`xeapi` 走 `interface3.music.163.com`，是「不加密的特殊算法」，主要用于调试加密前的原始参数；`api` 为明文（`interface.music.163.com`）；`linuxapi` 走 `/api/linux/forward`。

另有反作弊 token：`checkToken: 'v2' | 'v3'` 会实时获取易盾 token 并写入 `X-antiCheatToken` 头（`playlist_subscribe` 内部强制开启 v2）。

## 统计

- 接口总数 **440**，一级分类 **100**
- 文档覆盖 **399** / 440（上游文档共 402 个章节）
- `interface.d.ts` 类型覆盖 **433** / 440
- 带 `checkToken` **10**，需上传（`multipart/form-data`）**4**，模块内直接读 `query.cookie` **4**
- 登录需求：是 164，否 8，? 268（`是` / `否` / `?`）
- 加密方式分布：

| 加密方式 | 数量 |
| --- | --- |
| weapi | 216 |
| eapi(默认) | 160 |
| eapi | 36 |
| xeapi | 13 |
| 未使用 createOption | 13 |
| 动态（按 query / 变量） | 1 |
| weapi / eapi | 1 |

## 局限

- **登录需求仅来自上游文档标注**，覆盖 399 个接口，其中被标记的只是文档里写了的那部分；其余标 `?`，不要当作「不需要登录」。
- 上游接口路径来自源码字面量，模板字符串里的变量不会展开；一个模块可能请求多个上游路径。
- 「参数」只列 `interface.d.ts` 里的名字，没有类型与必填信息，以上游文档为准。
- 服务端同时接受 GET / POST；转发给网易云的请求恒为 POST。

## 分类索引

| 分类 | 数量 | 路由 |
| --- | --- | --- |
| [activate](#activate) | 1 | `/activate/init/profile` |
| [ad](#ad) | 3 | `/ad/get` `/ad/listening/rights/gain` `/ad/listening/rights` |
| [aidj](#aidj) | 1 | `/aidj/content/rcmd` |
| [album](#album) | 11 | `/album/detail/dynamic` `/album/detail` `/album/list/style` `/album/list` `/album/new` `/album/newest` `/album/privilege` `/album/songsaleboard` `/album/sub` `/album/sublist` `/album` |
| [api](#api) | 1 | `/api` |
| [artist](#artist) | 17 | `/artist/album` `/artist/desc` `/artist/detail/dynamic` `/artist/detail` `/artist/fans` `/artist/follow/count` `/artist/list` `/artist/mv` `/artist/new/mv` `/artist/new/song/mv/list/v2` `/artist/new/song/playall` `/artist/new/song` `/artist/songs` `/artist/sub` `/artist/sublist` `/artist/top/song` `/artist/video` |
| [artists](#artists) | 1 | `/artists` |
| [audio](#audio) | 1 | `/audio/match` |
| [avatar](#avatar) | 1 | `/avatar/upload` |
| [banner](#banner) | 1 | `/banner` |
| [batch](#batch) | 1 | `/batch` |
| [broadcast](#broadcast) | 5 | `/broadcast/category/region/get` `/broadcast/channel/collect/list` `/broadcast/channel/currentinfo` `/broadcast/channel/list` `/broadcast/sub` |
| [calendar](#calendar) | 1 | `/calendar` |
| [captcha](#captcha) | 4 | `/captcha/safe/sent` `/captcha/sent/v1` `/captcha/sent` `/captcha/verify` |
| [cellphone](#cellphone) | 1 | `/cellphone/existence/check` |
| [chart](#chart) | 2 | `/chart/detail` `/chart/song/detail` |
| [check](#check) | 1 | `/check/music` |
| [cloud](#cloud) | 6 | `/cloud/import` `/cloud/lyric/get` `/cloud/match` `/cloud/upload/complete` `/cloud/upload/token` `/cloud` |
| [cloudsearch](#cloudsearch) | 1 | `/cloudsearch` |
| [comment](#comment) | 18 | `/comment/add` `/comment/album` `/comment/delete` `/comment/dj` `/comment/event` `/comment/floor` `/comment/hot` `/comment/hug/list` `/comment/info/list` `/comment/like` `/comment/music` `/comment/mv` `/comment/new` `/comment/playlist` `/comment/reply` `/comment/report` `/comment/video` `/comment` |
| [countries](#countries) | 1 | `/countries/code/list` |
| [creator](#creator) | 1 | `/creator/authinfo/get` |
| [daily_signin](#daily_signin) | 1 | `/daily_signin` |
| [decrypt](#decrypt) | 1 | `/decrypt` |
| [device](#device) | 2 | `/device/kickoff` `/device/list` |
| [deviceinfo](#deviceinfo) | 1 | `/deviceinfo/center/upload` |
| [digitalAlbum](#digitalalbum) | 4 | `/digitalAlbum/detail` `/digitalAlbum/ordering` `/digitalAlbum/purchased` `/digitalAlbum/sales` |
| [djRadio](#djradio) | 1 | `/djRadio/top` |
| [dj](#dj) | 29 | `/dj/banner` `/dj/category/excludehot` `/dj/category/recommend` `/dj/catelist` `/dj/detail` `/dj/difm/all/style/channel` `/dj/difm/channel/subscribe` `/dj/difm/channel/unsubscribe` `/dj/difm/playing/tracks/list` `/dj/difm/subscribe/channels/get` `/dj/hot` `/dj/paygift` `/dj/personalize/recommend` `/dj/program/detail` `/dj/program/toplist/hours` `/dj/program/toplist` `/dj/program` `/dj/radio/hot` `/dj/recommend/type` `/dj/recommend` `/dj/sub` `/dj/sublist` `/dj/subscriber` `/dj/today/perfered` `/dj/toplist/hours` `/dj/toplist/newcomer` `/dj/toplist/pay` `/dj/toplist/popular` `/dj/toplist` |
| [eapi](#eapi) | 1 | `/eapi/decrypt` |
| [event](#event) | 4 | `/event/del` `/event/forward` `/event/privacy` `/event` |
| [fanscenter](#fanscenter) | 5 | `/fanscenter/basicinfo/age/get` `/fanscenter/basicinfo/gender/get` `/fanscenter/basicinfo/province/get` `/fanscenter/overview/get` `/fanscenter/trend/list` |
| [fm_trash](#fm_trash) | 1 | `/fm_trash` |
| [follow](#follow) | 1 | `/follow` |
| [get](#get) | 1 | `/get/userids` |
| [history](#history) | 2 | `/history/recommend/songs/detail` `/history/recommend/songs` |
| [homepage](#homepage) | 2 | `/homepage/block/page` `/homepage/dragon/ball` |
| [hot](#hot) | 1 | `/hot/topic` |
| [hug](#hug) | 1 | `/hug/comment` |
| [inner](#inner) | 1 | `/inner/version` |
| [lbs](#lbs) | 1 | `/lbs/city/code` |
| [like](#like) | 2 | `/like/v1` `/like` |
| [likelist](#likelist) | 1 | `/likelist` |
| [listen](#listen) | 6 | `/listen/data/realtime/report` `/listen/data/report` `/listen/data/song/play/rank` `/listen/data/today/song` `/listen/data/total` `/listen/data/year/report` |
| [listentogether](#listentogether) | 9 | `/listentogether/accept` `/listentogether/end` `/listentogether/heatbeat` `/listentogether/play/command` `/listentogether/room/check` `/listentogether/room/create` `/listentogether/status` `/listentogether/sync/list/command` `/listentogether/sync/playlist/get` |
| [login](#login) | 7 | `/login/cellphone` `/login/qr/check` `/login/qr/create` `/login/qr/key` `/login/refresh` `/login/status` `/login` |
| [logout](#logout) | 1 | `/logout` |
| [lyric](#lyric) | 2 | `/lyric/new` `/lyric` |
| [middle](#middle) | 2 | `/middle/play/do/lottery` `/middle/play/lottery/remain/chance` |
| [mlog](#mlog) | 3 | `/mlog/music/rcmd` `/mlog/to/video` `/mlog/url` |
| [msg](#msg) | 6 | `/msg/comments` `/msg/forwards` `/msg/notices` `/msg/private/history` `/msg/private` `/msg/recentcontact` |
| [music](#music) | 1 | `/music/first/listen/info` |
| [musician](#musician) | 8 | `/musician/cloudbean/obtain` `/musician/cloudbean` `/musician/data/overview` `/musician/play/trend` `/musician/sign` `/musician/tasks/new` `/musician/tasks` `/musician/vip/tasks` |
| [mv](#mv) | 8 | `/mv/all` `/mv/detail/info` `/mv/detail` `/mv/exclusive/rcmd` `/mv/first` `/mv/sub` `/mv/sublist` `/mv/url` |
| [nickname](#nickname) | 1 | `/nickname/check` |
| [personal_fm](#personal_fm) | 1 | `/personal_fm` |
| [personal](#personal) | 1 | `/personal/fm/mode` |
| [personalized](#personalized) | 6 | `/personalized/djprogram` `/personalized/mv` `/personalized/newsong` `/personalized/privatecontent/list` `/personalized/privatecontent` `/personalized` |
| [pl](#pl) | 1 | `/pl/count` |
| [playlist](#playlist) | 27 | `/playlist/category/list` `/playlist/catlist` `/playlist/cover/update` `/playlist/create` `/playlist/delete` `/playlist/desc/update` `/playlist/detail/dynamic` `/playlist/detail/rcmd/get` `/playlist/detail` `/playlist/highquality/tags` `/playlist/hot` `/playlist/import/name/task/create` `/playlist/import/task/status` `/playlist/mylike` `/playlist/name/update` `/playlist/order/update` `/playlist/privacy` `/playlist/subscribe` `/playlist/subscribers` `/playlist/tags/update` `/playlist/track/add` `/playlist/track/all` `/playlist/track/delete` `/playlist/tracks` `/playlist/update/playcount` `/playlist/update` `/playlist/video/recent` |
| [playmode](#playmode) | 2 | `/playmode/intelligence/list` `/playmode/song/vector` |
| [program](#program) | 1 | `/program/recommend` |
| [radio](#radio) | 1 | `/radio/sport/get` |
| [rebind](#rebind) | 1 | `/rebind` |
| [recent](#recent) | 1 | `/recent/listen/list` |
| [recommend](#recommend) | 3 | `/recommend/resource` `/recommend/songs/dislike` `/recommend/songs` |
| [record](#record) | 6 | `/record/recent/album` `/record/recent/dj` `/record/recent/playlist` `/record/recent/song` `/record/recent/video` `/record/recent/voice` |
| [register](#register) | 5 | `/register/anonimous` `/register/cellphone` `/register/checktoken/v2` `/register/checktoken/v3` `/register/xeapikey` |
| [related](#related) | 2 | `/related/allvideo` `/related/playlist` |
| [relay](#relay) | 1 | `/relay/play/state/submit` |
| [rep](#rep) | 11 | `/rep/ugc/activity/collect` `/rep/ugc/activity/get` `/rep/ugc/exam/info/get` `/rep/ugc/exam/question/single/get` `/rep/ugc/exam/result/get` `/rep/ugc/exam/start` `/rep/ugc/exam/submit` `/rep/ugc/user/collect-vip` `/rep/ugc/user/get` `/rep/ugc/user/sign` `/rep/ugc/user/vip` |
| [resource](#resource) | 1 | `/resource/like` |
| [sati](#sati) | 6 | `/sati/resource/list/more` `/sati/resource/list` `/sati/resource/sub/list` `/sati/resource/sub` `/sati/tag/list` `/sati/timescene/resources/get` |
| [scrobble](#scrobble) | 2 | `/scrobble/v1` `/scrobble` |
| [search](#search) | 8 | `/search/default` `/search/hot/detail` `/search/hot` `/search/match` `/search/multimatch` `/search/suggest/pc` `/search/suggest` `/search` |
| [send](#send) | 4 | `/send/album` `/send/playlist` `/send/song` `/send/text` |
| [setting](#setting) | 1 | `/setting` |
| [share](#share) | 1 | `/share/resource` |
| [sheet](#sheet) | 2 | `/sheet/list` `/sheet/preview` |
| [sign](#sign) | 1 | `/sign/happy/info` |
| [signin](#signin) | 1 | `/signin/progress` |
| [simi](#simi) | 5 | `/simi/artist` `/simi/mv` `/simi/playlist` `/simi/song` `/simi/user` |
| [song](#song) | 29 | `/song/chorus` `/song/cloud/download` `/song/copyright/rcmd` `/song/creators` `/song/detail` `/song/downlist` `/song/download/url/v1` `/song/download/url` `/song/dynamic/cover` `/song/like/check` `/song/like` `/song/lyrics/mark/add` `/song/lyrics/mark/del` `/song/lyrics/mark/user/page` `/song/lyrics/mark` `/song/monthdownlist` `/song/music/detail` `/song/order/update` `/song/purchased` `/song/red/count` `/song/simi/get` `/song/singledownlist` `/song/url/match` `/song/url/ncmget` `/song/url/v1/302` `/song/url/v1` `/song/url` `/song/wiki/info` `/song/wiki/summary` |
| [starpick](#starpick) | 1 | `/starpick/comments/summary` |
| [style](#style) | 7 | `/style/album` `/style/artist` `/style/detail` `/style/list` `/style/playlist` `/style/preference` `/style/song` |
| [summary](#summary) | 1 | `/summary/annual` |
| [thinktank](#thinktank) | 2 | `/thinktank/audit/resource/detail` `/thinktank/audit/resource/update` |
| [threshold](#threshold) | 1 | `/threshold/detail/get` |
| [top](#top) | 7 | `/top/album` `/top/artists` `/top/list` `/top/mv` `/top/playlist/highquality` `/top/playlist` `/top/song` |
| [topic](#topic) | 3 | `/topic/detail/event/hot` `/topic/detail` `/topic/sublist` |
| [toplist](#toplist) | 4 | `/toplist/artist` `/toplist/detail/v2` `/toplist/detail` `/toplist` |
| [ugc](#ugc) | 7 | `/ugc/album/get` `/ugc/artist/get` `/ugc/artist/search` `/ugc/detail` `/ugc/mv/get` `/ugc/song/get` `/ugc/user/devote` |
| [user](#user) | 30 | `/user/account` `/user/audio` `/user/binding` `/user/bindingcellphone` `/user/cloud/del` `/user/cloud/detail` `/user/cloud` `/user/comment/history` `/user/detail/new` `/user/detail` `/user/dj` `/user/event/all` `/user/event` `/user/follow/mixed` `/user/followeds` `/user/follows` `/user/level` `/user/medal` `/user/mutualfollow/get` `/user/playlist/collect` `/user/playlist/create` `/user/playlist` `/user/record` `/user/replacephone` `/user/social/status/edit` `/user/social/status/rcmd` `/user/social/status/support` `/user/social/status` `/user/subcount` `/user/update` |
| [verify](#verify) | 2 | `/verify/getQr` `/verify/qrcodestatus` |
| [video](#video) | 9 | `/video/category/list` `/video/detail/info` `/video/detail` `/video/group/list` `/video/group` `/video/sub` `/video/timeline/all` `/video/timeline/recommend` `/video/url` |
| [vip](#vip) | 13 | `/vip/growthpoint/details` `/vip/growthpoint/get` `/vip/growthpoint/getall` `/vip/growthpoint` `/vip/info/v2` `/vip/info` `/vip/sign/detail` `/vip/sign/history` `/vip/sign/info` `/vip/sign` `/vip/tasks/v1` `/vip/tasks` `/vip/timemachine` |
| [voice](#voice) | 4 | `/voice/delete` `/voice/detail` `/voice/lyric` `/voice/upload` |
| [voicelist](#voicelist) | 6 | `/voicelist/detail` `/voicelist/list/search` `/voicelist/list` `/voicelist/my/created` `/voicelist/search` `/voicelist/trans` |
| [weblog](#weblog) | 1 | `/weblog` |
| [yunbei](#yunbei) | 14 | `/yunbei/expense` `/yunbei/info` `/yunbei/rcmd/song/history` `/yunbei/rcmd/song` `/yunbei/receipt` `/yunbei/sign` `/yunbei/task/finish/v1` `/yunbei/task/finish` `/yunbei/task/list/v1` `/yunbei/task/recommend/song` `/yunbei/tasks/todo` `/yunbei/tasks` `/yunbei/today` `/yunbei` |
