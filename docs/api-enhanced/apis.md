# api-enhanced 接口索引表

字段含义见 [README.md](./README.md)。登录列 `?` = 上游文档未标注，不代表不需要登录。

共 440 个接口，按一级分类分组。

## 目录

- [activate](#activate) (1)
- [ad](#ad) (3)
- [aidj](#aidj) (1)
- [album](#album) (11)
- [api](#api) (1)
- [artist](#artist) (17)
- [artists](#artists) (1)
- [audio](#audio) (1)
- [avatar](#avatar) (1)
- [banner](#banner) (1)
- [batch](#batch) (1)
- [broadcast](#broadcast) (5)
- [calendar](#calendar) (1)
- [captcha](#captcha) (4)
- [cellphone](#cellphone) (1)
- [chart](#chart) (2)
- [check](#check) (1)
- [cloud](#cloud) (6)
- [cloudsearch](#cloudsearch) (1)
- [comment](#comment) (18)
- [countries](#countries) (1)
- [creator](#creator) (1)
- [daily_signin](#daily_signin) (1)
- [decrypt](#decrypt) (1)
- [device](#device) (2)
- [deviceinfo](#deviceinfo) (1)
- [digitalAlbum](#digitalalbum) (4)
- [djRadio](#djradio) (1)
- [dj](#dj) (29)
- [eapi](#eapi) (1)
- [event](#event) (4)
- [fanscenter](#fanscenter) (5)
- [fm_trash](#fm_trash) (1)
- [follow](#follow) (1)
- [get](#get) (1)
- [history](#history) (2)
- [homepage](#homepage) (2)
- [hot](#hot) (1)
- [hug](#hug) (1)
- [inner](#inner) (1)
- [lbs](#lbs) (1)
- [like](#like) (2)
- [likelist](#likelist) (1)
- [listen](#listen) (6)
- [listentogether](#listentogether) (9)
- [login](#login) (7)
- [logout](#logout) (1)
- [lyric](#lyric) (2)
- [middle](#middle) (2)
- [mlog](#mlog) (3)
- [msg](#msg) (6)
- [music](#music) (1)
- [musician](#musician) (8)
- [mv](#mv) (8)
- [nickname](#nickname) (1)
- [personal_fm](#personal_fm) (1)
- [personal](#personal) (1)
- [personalized](#personalized) (6)
- [pl](#pl) (1)
- [playlist](#playlist) (27)
- [playmode](#playmode) (2)
- [program](#program) (1)
- [radio](#radio) (1)
- [rebind](#rebind) (1)
- [recent](#recent) (1)
- [recommend](#recommend) (3)
- [record](#record) (6)
- [register](#register) (5)
- [related](#related) (2)
- [relay](#relay) (1)
- [rep](#rep) (11)
- [resource](#resource) (1)
- [sati](#sati) (6)
- [scrobble](#scrobble) (2)
- [search](#search) (8)
- [send](#send) (4)
- [setting](#setting) (1)
- [share](#share) (1)
- [sheet](#sheet) (2)
- [sign](#sign) (1)
- [signin](#signin) (1)
- [simi](#simi) (5)
- [song](#song) (29)
- [starpick](#starpick) (1)
- [style](#style) (7)
- [summary](#summary) (1)
- [thinktank](#thinktank) (2)
- [threshold](#threshold) (1)
- [top](#top) (7)
- [topic](#topic) (3)
- [toplist](#toplist) (4)
- [ugc](#ugc) (7)
- [user](#user) (30)
- [verify](#verify) (2)
- [video](#video) (9)
- [vip](#vip) (13)
- [voice](#voice) (4)
- [voicelist](#voicelist) (6)
- [weblog](#weblog) (1)
- [yunbei](#yunbei) (14)

## activate

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/activate/init/profile` | `activate_init_profile` | `/api/activate/initProfile` | eapi(默认) | ? | `nickname` | 初始化昵称 | 初始化名字 |

## ad

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/ad/get` | `ad_get` | `/api/ad/get` | xeapi | ? | `type_ids` | 获取广告 | 获取广告 |
| `/ad/listening/rights` | `ad_listening_rights` | `/api/ad/homepage/free/tab/extend/v2` | xeapi | 是 | - | 获取免费听时长状态 | 获取免费听时长状态 |
| `/ad/listening/rights/gain` | `ad_listening_rights_gain` | `/api/ad/listening/rights/gain` | xeapi | 是 | `reqUid` `uid` `exposureTime` `clickTime` `extraRightsType` `playContinuously` `source` `creativeType` `rightsGainMethod` `extraRightsGainMethod` `extraRightsGainDuration` `nextRightsGainDuration` `rightsGainType` `rightsGainDuration` `gainMethodStep` `generalRightsInfo` `rightsExtJson` `appInfo` `contextInfo` `installed` `sniffTime` `type_ids` | 看广告领取权益（免费听歌时长 / 云贝等） | 看广告免费听歌 - 领取免费听权益 请求流程（基于逆向网易云音乐 v9.5.61 原生 Kotlin 源码，classes5/18/19.dex）： 1. 从广告平台拉广告 → 用户看完/点击广告 → 获取 ad 对象的 extJson.c |

## aidj

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/aidj/content/rcmd` | `aidj_content_rcmd` | `/api/aidj/content/rcmd/info` | eapi(默认) | ? | `latitude` `longitude` | 私人 DJ | 私人 DJ |

## album

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/album` | `album` | `/api/v1/album/${query.id}` | weapi | ? | `id` | 获取专辑内容 | 专辑内容 |
| `/album/detail` | `album_detail` | `/api/vipmall/albumproduct/detail` | weapi | ? | `id` | 数字专辑详情 | 数字专辑详情 |
| `/album/detail/dynamic` | `album_detail_dynamic` | `/api/album/detail/dynamic` | weapi | ? | `id` | 专辑动态信息 | 专辑动态信息 |
| `/album/list` | `album_list` | `/api/vipmall/albumproduct/list` | weapi | ? | `area` `type` | 数字专辑-新碟上架 | 数字专辑-新碟上架 |
| `/album/list/style` | `album_list_style` | `/api/vipmall/appalbum/album/style` | weapi | ? | `area` | 数字专辑-语种风格馆 | 数字专辑-语种风格馆 |
| `/album/new` | `album_new` | `/api/album/new` | weapi | 是 | `area` | 全部新碟 | 全部新碟 |
| `/album/newest` | `album_newest` | `/api/discovery/newAlbum` | weapi | ? | - | 最新专辑 | 最新专辑 |
| `/album/privilege` | `album_privilege` | `/api/album/privilege` | eapi(默认) | ? | `id` | 获取专辑歌曲的音质 | 获取专辑歌曲的音质 |
| `/album/songsaleboard` | `album_songsaleboard` | `/api/feealbum/songsaleboard/${type}/type` | weapi | ? | `albumType` `type` `year` | - | 数字专辑&数字单曲-榜单 |
| `/album/sub` | `album_sub` | `/api/album/${query.t}` | weapi | ? | `id` `t` | 收藏/取消收藏专辑 | 收藏/取消收藏专辑 |
| `/album/sublist` | `album_sublist` | `/api/album/sublist` | weapi | ? | - | 获取已收藏专辑列表 | 已收藏专辑列表 |

## api

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/api` | `api` | - | 动态（按 query / 变量） | ? | `uri` `data` `crypto` | - | - |

## artist

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/artist/album` | `artist_album` | `/api/artist/albums/${query.id}` | weapi | ? | `id` | 获取歌手专辑 | 歌手专辑列表 |
| `/artist/desc` | `artist_desc` | `/api/artist/introduction` | weapi | ? | `id` | 获取歌手描述 | 歌手介绍 |
| `/artist/detail` | `artist_detail` | `/api/artist/head/info/get` | eapi(默认) | ? | `id` | 获取歌手详情 | - |
| `/artist/detail/dynamic` | `artist_detail_dynamic` | `/api/artist/detail/dynamic` | eapi(默认) | ? | `id` | 歌手详情动态 | 歌手动态信息 |
| `/artist/fans` | `artist_fans` | `/api/artist/fans/get` | weapi | ? | `id` | 歌手粉丝 | 歌手粉丝 |
| `/artist/follow/count` | `artist_follow_count` | `/api/artist/follow/count/get` | weapi | ? | `id` | 歌手粉丝数量 | 歌手粉丝数量 |
| `/artist/list` | `artist_list` | `/api/v1/artist/list` | weapi | ? | `area` `initial` `type` | 歌手分类列表 | 歌手分类 |
| `/artist/mv` | `artist_mv` | `/api/artist/mvs` | weapi | ? | `id` | 获取歌手 mv | 歌手相关MV |
| `/artist/new/mv` | `artist_new_mv` | `/api/sub/artist/new/works/mv/list` | weapi | 是 | `limit` `startTimestamp` | 关注歌手新 MV | - |
| `/artist/new/song` | `artist_new_song` | `/api/sub/artist/new/works/song/list` | weapi | 是 | `limit` `startTimestamp` | 关注歌手新歌 | - |
| `/artist/new/song/mv/list/v2` | `artist_new_song_mv_list_v2` | `/api/sub/artist/new/works/song-mv/list/v2` | eapi | 是 | `startTimestamp` `before` `sourceType` `limit` `firstRequest` | 关注歌手新作品（歌曲/MV） | 获取关注歌手的新歌曲和 MV |
| `/artist/new/song/playall` | `artist_new_song_playall` | `/api/sub/artist/new/works/song/playall` | eapi | 是 | - | 关注歌手最近新歌 - 播放全部 | 获取所有关注歌手最近的 50 首新歌 |
| `/artist/songs` | `artist_songs` | `/api/v1/artist/songs` | eapi(默认) | ? | `id` `order` | 歌手全部歌曲 | - |
| `/artist/sub` | `artist_sub` | `/api/artist/${query.t}` | weapi | ? | `id` `t` | 收藏/取消收藏歌手 | 收藏与取消收藏歌手 |
| `/artist/sublist` | `artist_sublist` | `/api/artist/sublist` | weapi | ? | - | 收藏的歌手列表 | 关注歌手列表 |
| `/artist/top/song` | `artist_top_song` | `/api/artist/top/song` | weapi | ? | `id` | 歌手热门 50 首歌曲 | 歌手热门 50 首歌曲 |
| `/artist/video` | `artist_video` | `/api/mlog/artist/video` | weapi | ? | `id` `size` `cursor` `order` | 获取歌手视频 | 歌手相关视频 |

## artists

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/artists` | `artists` | `/api/v1/artist/${query.id}` | weapi | ? | `id` | 获取歌手单曲 | 歌手单曲 |

## audio

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/audio/match` | `audio_match` | - | - | ? | `duration` `audioFP` | 听歌识曲 | - |

## avatar

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/avatar/upload` | `avatar_upload` | `/api/user/avatar/upload/v1` | eapi(默认) | 是 | - | 更新头像 | - |

## banner

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/banner` | `banner` | `/api/v2/banner/get` | eapi(默认) | ? | `type` | banner | 首页轮播图 |

## batch

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/batch` | `batch` | `/api/batch` | eapi(默认) | 是 | `index` | batch 批量请求接口 | 批量请求接口 |

## broadcast

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/broadcast/category/region/get` | `broadcast_category_region_get` | `/api/voice/broadcast/category/region/get` | eapi(默认) | ? | - | 广播电台 - 分类/地区信息 | 广播电台 - 分类/地区信息 |
| `/broadcast/channel/collect/list` | `broadcast_channel_collect_list` | `/api/content/channel/collect/list` | eapi(默认) | ? | - | 广播电台 - 我的收藏 | 广播电台 - 我的收藏 |
| `/broadcast/channel/currentinfo` | `broadcast_channel_currentinfo` | `/api/voice/broadcast/channel/currentinfo` | eapi(默认) | ? | `id` | 广播电台 - 电台信息 | 广播电台 - 电台信息 |
| `/broadcast/channel/list` | `broadcast_channel_list` | `/api/voice/broadcast/channel/list` | eapi(默认) | ? | `categoryId` `regionId` `lastId` `score` | 广播电台 - 全部电台 | 广播电台 - 全部电台 |
| `/broadcast/sub` | `broadcast_sub` | `/api/content/interact/collect` | eapi(默认) | 是 | `t` `id` | 广播电台 - 收藏/取消收藏电台 | 广播电台 - 收藏/取消收藏电台 |

## calendar

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/calendar` | `calendar` | `/api/mcalendar/detail` | weapi | 是 | `startTime` `endTime` | 音乐日历 | - |

## captcha

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/captcha/safe/sent` | `captcha_safe_sent` | `/api/sms/captcha/safe/sent` | eapi | 是 | `ctcode` | 发送安全验证码 | 发送安全验证码 |
| `/captcha/sent` | `captcha_sent` | `/api/sms/captcha/sent` | weapi | ? | `phone` `ctcode` | 发送验证码 | 发送验证码 |
| `/captcha/sent/v1` | `captcha_sent_v1` | `/api/middle/captcha/sent/v1` | eapi | ? | `phone` `ctcode` | 新版发送验证码 | 发送验证码 |
| `/captcha/verify` | `captcha_verify` | `/api/sms/captcha/verify` | weapi | ? | `ctcode` `phone` `captcha` | 验证验证码 | 校验验证码 |

## cellphone

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/cellphone/existence/check` | `cellphone_existence_check` | `/api/cellphone/existence/check` | eapi | ? | `phone` `countrycode` | 检测手机号码是否已注册 | 检测手机号码是否已注册 |

## chart

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/chart/detail` | `chart_detail` | `/api/chart/detail` | eapi(默认) | ? | `chartCode` `targetId` `targetType` | 指定维度音乐排行榜详情 | 获取指定维度音乐排行榜详情 |
| `/chart/song/detail` | `chart_song_detail` | `/api/chart/song/detail` | eapi(默认) | ? | `chartCode` `targetId` `targetType` | 指定维度音乐排行榜列表 | 获取指定维度音乐排行榜列表 |

## check

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/check/music` | `check_music` | `/api/song/enhance/player/url` | weapi | ? | `id` `br` | 音乐是否可用 | 歌曲可用性 |

## cloud

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/cloud` | `cloud` | `/api/cloud/upload/check`<br>`/api/nos/token/alloc`<br>`/api/upload/cloud/info/v2`<br>`/api/cloud/pub/v2` | eapi(默认) | 是 | `songFile` | 云盘上传 | - |
| `/cloud/import` | `cloud_import` | `/api/cloud/upload/check/v2`<br>`/api/cloud/user/song/import` | eapi(默认) | 是 | `md5` `id` `bitrate` `fileSize` `artist` `album` `song` | 云盘导入歌曲 | 云盘导入歌曲 |
| `/cloud/lyric/get` | `cloud_lyric_get` | `/api/cloud/lyric/get` | eapi | ? | `uid` `sid` | 获取云盘歌词 | 获取云盘歌词 |
| `/cloud/match` | `cloud_match` | `/api/cloud/user/song/match` | weapi | 是 | `uid` `sid` `asid` | 云盘歌曲信息匹配纠正 | - |
| `/cloud/upload/complete` | `cloud_upload_complete` | `/api/upload/cloud/info/v2`<br>`/api/cloud/pub/v2` | eapi(默认) | 是 | `songId` `resourceId` `md5` `filename` `song` `artist` `album` `bitrate` | 云盘上传 | - |
| `/cloud/upload/token` | `cloud_upload_token` | `/api/cloud/upload/check`<br>`/api/nos/token/alloc` | weapi | 是 | `md5` `fileSize` `filename` `bitrate` | 云盘上传 | - |

## cloudsearch

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/cloudsearch` | `cloudsearch` | `/api/cloudsearch/pc` | eapi(默认) | 否 | `keywords` `type` | 搜索 | 搜索 |

## comment

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/comment` | `comment` | `/api/resource/comments/${query.t}` | eapi | 是 | `type` `t` `threadId` `content` `commentId` | 发送/删除评论 | - |
| `/comment/add` | `comment_add` | `/api/resource/comments/add` | xeapi | ? | `id` `type` `content` | - | - |
| `/comment/album` | `comment_album` | `/api/v1/resource/comments/R_AL_3_${query.id}` | weapi | ? | `id` `before` | 专辑评论 | 专辑评论 |
| `/comment/delete` | `comment_delete` | `/api/resource/comments/delete` | xeapi | ? | `id` `type` `cid` | - | - |
| `/comment/dj` | `comment_dj` | `/api/v1/resource/comments/A_DJ_1_${query.id}` | weapi | 否 | `id` `before` | 电台节目评论 | 电台评论 |
| `/comment/event` | `comment_event` | `/api/v1/resource/comments/${query.threadId}` | weapi | 是 | `threadId` `before` | 获取动态评论 | 获取动态评论 |
| `/comment/floor` | `comment_floor` | `/api/resource/comment/floor/get` | weapi | ? | `id` `parentCommentId` `type` `limit` `time` | 楼层评论 | - |
| `/comment/hot` | `comment_hot` | `/api/v1/resource/hotcomments/${query.type}${query.id}` | weapi | 否 | `id` `type` `before` | 热门评论 | - |
| `/comment/hug/list` | `comment_hug_list` | `/api/v2/resource/comments/hug/list` | eapi(默认) | ? | `page` `cursor` `idCursor` `pageSize` | 评论抱一抱列表 | - |
| `/comment/info/list` | `comment_info_list` | `/api/resource/commentInfo/list` | weapi | 否 | `ids` `type` | 评论统计数据 | 评论统计数据 type: 0=歌曲 1=MV 2=歌单 3=专辑 4=电台节目 5=视频 6=动态 7=电台 ids: 资源 ID 列表，多个用逗号分隔，如 "123,456" |
| `/comment/like` | `comment_like` | `/api/v1/comment/${query.t}` | weapi | 是 | `id` `type` `t` `cid` `threadId` | 给评论点赞 | - |
| `/comment/music` | `comment_music` | `/api/v1/resource/comments/R_SO_4_${query.id}` | weapi | 否 | `id` `before` | 歌曲评论 | 歌曲评论 |
| `/comment/mv` | `comment_mv` | `/api/v1/resource/comments/R_MV_5_${query.id}` | weapi | ? | `id` `before` | mv 评论 | MV评论 |
| `/comment/new` | `comment_new` | `/api/v2/resource/comments` | eapi(默认) | ? | `type` `id` `pageNo` `pageSize` `sortType` | 新版评论接口 | - |
| `/comment/playlist` | `comment_playlist` | `/api/v1/resource/comments/A_PL_0_${query.id}` | weapi | ? | `id` `before` | 歌单评论 | 歌单评论 |
| `/comment/reply` | `comment_reply` | `/api/v1/resource/comments/reply` | xeapi | ? | `id` `type` `cid` `content` | - | - |
| `/comment/report` | `comment_report` | `/api/report/reportcomment` | eapi(默认) | 是 | `id` `cid` `reason` | 举报评论 | 举报评论 |
| `/comment/video` | `comment_video` | `/api/v1/resource/comments/R_VI_62_${query.id}` | weapi | 否 | `id` `before` | 视频评论 | 视频评论 |

## countries

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/countries/code/list` | `countries_code_list` | `/api/lbs/countries/v1` | eapi(默认) | ? | - | 国家编码列表 | 国家编码列表 |

## creator

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/creator/authinfo/get` | `creator_authinfo_get` | `/api/user/creator/authinfo/get` | eapi(默认) | ? | - | - | 获取达人用户信息 |

## daily_signin

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/daily_signin` | `daily_signin` | `/api/point/dailyTask` | eapi(默认) | 是 | `type` | 签到 | 签到 |

## decrypt

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/decrypt` | `decrypt` | - | - | ? | `crypto` `data` `hexString` `isReq` | - | - |

## device

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/device/kickoff` | `device_kickoff` | `/api/middle/user/security/device/kickoff` | eapi | 是 | `deviceKey` `captcha` | 强制下线设备 | 强制下线设备 |
| `/device/list` | `device_list` | `/api/middle/user/device/list` | eapi | 是 | - | 获取在线设备列表 | 登录设备列表 |

## deviceinfo

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/deviceinfo/center/upload` | `deviceinfo_center_upload` | `/api/deviceinfo/center/upload` | eapi | 是 | `deviceName` `name` | 上报设备中心设备名称 | 上报设备中心设备名称 官方 PC 端在登录成功后调用此接口，将当前登录设备在“登录设备管理”中的名称设置为自定义名称 |

## digitalAlbum

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/digitalAlbum/detail` | `digitalAlbum_detail` | `/api/vipmall/albumproduct/detail` | weapi | ? | `id` | 数字专辑详情 | 数字专辑详情 |
| `/digitalAlbum/ordering` | `digitalAlbum_ordering` | `/api/ordering/web/digital` | weapi | 是 | `payment` `id` `quantity` | 购买数字专辑 | 购买数字专辑 |
| `/digitalAlbum/purchased` | `digitalAlbum_purchased` | `/api/digitalAlbum/purchased` | weapi | 是 | - | 我的数字专辑 | 我的数字专辑 |
| `/digitalAlbum/sales` | `digitalAlbum_sales` | `/api/vipmall/albumproduct/album/query/sales` | weapi | ? | `ids` | 数字专辑销量 | 数字专辑销量 |

## djRadio

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/djRadio/top` | `djRadio_top` | `/api/expert/worksdata/works/top/get` | eapi(默认) | ? | `djRadioId` `sortIndex` `dataGapDays` `dataType` | 电台排行榜获取 | 电台排行榜获取 |

## dj

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/dj/banner` | `dj_banner` | `/api/djradio/banner/get` | weapi | ? | - | 电台 banner | 电台banner |
| `/dj/category/excludehot` | `dj_category_excludehot` | `/api/djradio/category/excludehot` | weapi | 是 | - | 电台 - 非热门类型 | 电台非热门类型 |
| `/dj/category/recommend` | `dj_category_recommend` | `/api/djradio/home/category/recommend` | weapi | 是 | - | 电台 - 推荐类型 | 电台推荐类型 |
| `/dj/catelist` | `dj_catelist` | `/api/djradio/category/get` | weapi | 是 | - | 电台 - 分类 | 电台分类列表 |
| `/dj/detail` | `dj_detail` | `/api/djradio/v2/get` | weapi | 是 | `rid` | 电台 - 详情 | 电台详情 |
| `/dj/difm/all/style/channel` | `dj_difm_all_style_channel` | `/api/dj/difm/all/style/channel/v2` | eapi(默认) | ? | `sources` | DIFM电台 - 分类 | DIFM电台 - 分类 |
| `/dj/difm/channel/subscribe` | `dj_difm_channel_subscribe` | `/api/dj/difm/channel/subscribe` | eapi(默认) | ? | `id` | DIFM电台 - 收藏频道 | DIFM电台 - 收藏频道 |
| `/dj/difm/channel/unsubscribe` | `dj_difm_channel_unsubscribe` | `/api/dj/difm/channel/unsubscribe` | eapi(默认) | ? | `id` | DIFM电台 - 取消收藏频道 | DIFM电台 - 取消收藏频道 |
| `/dj/difm/playing/tracks/list` | `dj_difm_playing_tracks_list` | `/api/dj/difm/playing/tracks/list` | eapi(默认) | ? | `channelId` `limit` `source` | DIFM电台 - 播放列表 | DIFM电台 - 播放列表 |
| `/dj/difm/subscribe/channels/get` | `dj_difm_subscribe_channels_get` | `/api/dj/difm/subscribe/channels/get/v2` | eapi(默认) | ? | `sources` | DIFM电台 - 收藏列表 | DIFM电台 - 收藏列表 |
| `/dj/hot` | `dj_hot` | `/api/djradio/hot/v1` | weapi | ? | - | 热门电台 | 热门电台 |
| `/dj/paygift` | `dj_paygift` | `/api/djradio/home/paygift/list` | weapi | ? | - | 电台 - 付费精选 | 付费电台 |
| `/dj/personalize/recommend` | `dj_personalize_recommend` | `/api/djradio/personalize/rcmd` | weapi | ? | `limit` | 电台个性推荐 | 电台个性推荐 |
| `/dj/program` | `dj_program` | `/api/dj/program/byradio` | weapi | 是 | `rid` `asc` | 电台 - 节目 | 电台节目列表 |
| `/dj/program/detail` | `dj_program_detail` | `/api/dj/program/detail` | weapi | ? | `id` | 电台 - 节目详情 | 电台节目详情 |
| `/dj/program/toplist` | `dj_program_toplist` | `/api/program/toplist/v1` | weapi | 是 | - | 电台 - 节目榜 | 电台节目榜 |
| `/dj/program/toplist/hours` | `dj_program_toplist_hours` | `/api/djprogram/toplist/hours` | weapi | ? | `limit` | 电台 - 24 小时节目榜 | 电台24小时节目榜 |
| `/dj/radio/hot` | `dj_radio_hot` | `/api/djradio/hot` | weapi | ? | `cateId` | 电台 - 类别热门电台 | 类别热门电台 |
| `/dj/recommend` | `dj_recommend` | `/api/djradio/recommend/v1` | weapi | 是 | - | 电台 - 推荐 | 精选电台 |
| `/dj/recommend/type` | `dj_recommend_type` | `/api/djradio/recommend` | weapi | 是 | `type` | 电台 - 分类推荐 | 精选电台分类 |
| `/dj/sub` | `dj_sub` | `/api/djradio/${query.t}` | weapi | 是 | `t` `rid` | 电台 - 订阅 | 订阅与取消电台 |
| `/dj/sublist` | `dj_sublist` | `/api/djradio/get/subed` | weapi | 是 | - | 电台的订阅列表 | 订阅电台列表 |
| `/dj/subscriber` | `dj_subscriber` | `/api/djradio/subscriber` | weapi | ? | `id` `limit` `time` | 电台订阅者列表 | 电台详情 |
| `/dj/today/perfered` | `dj_today_perfered` | `/api/djradio/home/today/perfered` | weapi | 是 | `page` | 电台 - 今日优选 | 电台今日优选 |
| `/dj/toplist` | `dj_toplist` | `/api/djradio/toplist` | weapi | 是 | `type` | 电台 - 新晋电台榜/热门电台榜 | 新晋电台榜/热门电台榜 |
| `/dj/toplist/hours` | `dj_toplist_hours` | `/api/dj/toplist/hours` | weapi | ? | `limit` | 电台 - 24 小时主播榜 | 电台24小时主播榜 |
| `/dj/toplist/newcomer` | `dj_toplist_newcomer` | `/api/dj/toplist/newcomer` | weapi | ? | - | 电台 - 主播新人榜 | 电台新人榜 |
| `/dj/toplist/pay` | `dj_toplist_pay` | `/api/djradio/toplist/pay` | weapi | ? | `limit` | 电台 - 付费精品 | 付费精品 |
| `/dj/toplist/popular` | `dj_toplist_popular` | `/api/dj/toplist/popular` | weapi | ? | `limit` | 电台 - 最热主播榜 | 电台最热主播榜 |

## eapi

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/eapi/decrypt` | `eapi_decrypt` | - | - | ? | `hexString` `isReq` | - | - |

## event

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/event` | `event` | `/api/v1/event/get` | weapi | ? | `pagesize` `lasttime` | 获取动态列表 | 获取动态列表 |
| `/event/del` | `event_del` | `/api/event/delete` | weapi | 是 | `evId` | 删除用户动态 | 删除动态 |
| `/event/forward` | `event_forward` | `/api/event/forward` | eapi(默认) | 是 | `forwords` `evId` `uid` | 转发用户动态 | 转发动态 |
| `/event/privacy` | `event_privacy` | `/api/event/privacy/op` | eapi(默认) | 是 | `evId` `privacy` | 修改动态可见权限 | 修改本人动态的可见权限 |

## fanscenter

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/fanscenter/basicinfo/age/get` | `fanscenter_basicinfo_age_get` | `/api/fanscenter/basicinfo/age/get` | eapi(默认) | ? | - | - | 粉丝年龄比例 |
| `/fanscenter/basicinfo/gender/get` | `fanscenter_basicinfo_gender_get` | `/api/fanscenter/basicinfo/gender/get` | eapi(默认) | ? | - | - | 粉丝性别比例 |
| `/fanscenter/basicinfo/province/get` | `fanscenter_basicinfo_province_get` | `/api/fanscenter/basicinfo/province/get` | eapi(默认) | ? | - | - | 粉丝省份比例 |
| `/fanscenter/overview/get` | `fanscenter_overview_get` | `/api/fanscenter/overview/get` | eapi(默认) | ? | - | - | 粉丝数量 |
| `/fanscenter/trend/list` | `fanscenter_trend_list` | `/api/fanscenter/trend/list` | eapi(默认) | ? | `startTime` `endTime` `type` | - | 粉丝来源 |

## fm_trash

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/fm_trash` | `fm_trash` | `/api/radio/trash/add` | weapi | ? | `id` `time` | 垃圾桶 | 垃圾桶 |

## follow

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/follow` | `follow` | `/api/user/${query.t}/${query.id}` | weapi | 是 | `t` `id` | 关注/取消关注用户 | 关注与取消关注用户 |

## get

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/get/userids` | `get_userids` | `/api/user/getUserIds` | weapi | ? | `nicknames` | 根据 nickname 获取 userid | - |

## history

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/history/recommend/songs` | `history_recommend_songs` | `/api/discovery/recommend/songs/history/recent` | weapi | ? | - | 获取历史日推可用日期列表 | 历史每日推荐歌曲 |
| `/history/recommend/songs/detail` | `history_recommend_songs_detail` | `/api/discovery/recommend/songs/history/detail` | weapi | ? | `date` | 获取历史日推详情数据 | 历史每日推荐歌曲详情 |

## homepage

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage/block/page` | `homepage_block_page` | `/api/homepage/block/page` | weapi | ? | `refresh` `cursor` | 首页-发现 | 首页-发现 block page 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/ |
| `/homepage/dragon/ball` | `homepage_dragon_ball` | `/api/homepage/dragon/ball/static` | eapi(默认) | ? | - | 首页-发现-圆形图标入口列表 | 首页-发现 dragon ball 这个接口为移动端接口，首页-发现页（每日推荐、歌单、排行榜 那些入口） 数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/ |

## hot

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/hot/topic` | `hot_topic` | `/api/act/hot` | weapi | ? | - | 获取热门话题 | 热门话题 |

## hug

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/hug/comment` | `hug_comment` | `/api/v2/resource/comments/hug/listener` | eapi(默认) | ? | `uid` `cid` `sid` | 抱一抱评论 | - |

## inner

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/inner/version` | `inner_version` | - | - | ? | - | 内部版本接口 | - |

## lbs

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/lbs/city/code` | `lbs_city_code` | `/api/lbs/city/code` | eapi(默认) | ? | `bizCode` | 多级行政区划数据 | 多级行政区划数据获取接口 |

## like

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/like` | `like` | `/api/radio/like` | weapi | ? | `like` `id` `alg` `time` | 喜欢音乐 | 红心与取消红心歌曲 |
| `/like/v1` | `like_v1` | `/api/v1/radio/like` | xeapi | ? | - | 喜欢音乐 - 新版 | 红心与取消红心歌曲- v1 |

## likelist

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/likelist` | `likelist` | `/api/song/like/get` | eapi(默认) | 是 | `uid` | 喜欢音乐列表 | 喜欢的歌曲(无序) |

## listen

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/listen/data/realtime/report` | `listen_data_realtime_report` | `/api/content/activity/listen/data/realtime/report` | eapi(默认) | 是 | `type` | 听歌足迹 - 本周/本月收听时长 | 听歌足迹 - 本周/本月收听时长 |
| `/listen/data/report` | `listen_data_report` | `/api/content/activity/listen/data/report` | eapi(默认) | 是 | `type` `endTime` | 听歌足迹 - 周/月/年收听报告 | 听歌足迹 - 周/月/年收听报告 |
| `/listen/data/song/play/rank` | `listen_data_song_play_rank` | `/api/content/activity/listen/data/song/play/rank` | eapi(默认) | 是 | `type` `endTime` | 听歌足迹 - 歌曲播放排行 | 听歌足迹 - 歌曲播放排行 (Top20) |
| `/listen/data/today/song` | `listen_data_today_song` | `/api/content/activity/listen/data/today/song/play/rank` | eapi(默认) | 是 | - | 听歌足迹 - 今日收听 | 听歌足迹 - 今日收听 |
| `/listen/data/total` | `listen_data_total` | `/api/content/activity/listen/data/total` | eapi(默认) | 是 | - | 听歌足迹 - 总收听时长 | 听歌足迹 - 总收听时长 |
| `/listen/data/year/report` | `listen_data_year_report` | `/api/content/activity/listen/data/year/report` | eapi(默认) | 是 | - | 听歌足迹 - 年度听歌足迹 | 听歌足迹 - 年度听歌足迹 |

## listentogether

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/listentogether/accept` | `listentogether_accept` | `/api/listen/together/play/invitation/accept` | eapi(默认) | ? | `roomId` `inviterId` | - | - |
| `/listentogether/end` | `listentogether_end` | `/api/listen/together/end/v2` | eapi(默认) | ? | `roomId` | - | 一起听 结束房间 |
| `/listentogether/heatbeat` | `listentogether_heatbeat` | `/api/listen/together/heartbeat` | eapi(默认) | ? | `roomId` `songId` `playStatus` `progress` | - | 一起听 发送心跳 |
| `/listentogether/play/command` | `listentogether_play_command` | `/api/listen/together/play/command/report` | eapi(默认) | ? | `roomId` `commandType` `progress` `playStatus` `formerSongId` `targetSongId` `clientSeq` | - | 一起听 发送播放状态 |
| `/listentogether/room/check` | `listentogether_room_check` | `/api/listen/together/room/check` | eapi(默认) | ? | `roomId` | - | 一起听 房间情况 |
| `/listentogether/room/create` | `listentogether_room_create` | `/api/listen/together/room/create` | eapi(默认) | ? | - | - | 一起听创建房间 |
| `/listentogether/status` | `listentogether_status` | `/api/listen/together/status/get` | weapi | ? | - | - | 一起听状态 |
| `/listentogether/sync/list/command` | `listentogether_sync_list_command` | `/api/listen/together/sync/list/command/report` | eapi(默认) | ? | `roomId` `commandType` `userId` `version` `randomList` `displayList` | - | 一起听 更新播放列表 |
| `/listentogether/sync/playlist/get` | `listentogether_sync_playlist_get` | `/api/listen/together/sync/playlist/get` | eapi(默认) | ? | `roomId` | - | 一起听 当前列表获取 |

## login

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/login` | `login` | `/api/w/login` | eapi(默认) | ? | `email` `md5_password` | 登录 | 邮箱登录 |
| `/login/cellphone` | `login_cellphone` | `/api/w/login/cellphone` | weapi | ? | `phone` `countrycode` `captcha` | 登录 | 手机登录 |
| `/login/qr/check` | `login_qr_check` | `/api/login/qrcode/client/login` | eapi(默认) | ? | `key` | 登录 | - |
| `/login/qr/create` | `login_qr_create` | - | - | ? | `key` `qrimg` | 登录 | - |
| `/login/qr/key` | `login_qr_key` | `/api/login/qrcode/unikey` | eapi(默认) | ? | - | 登录 | - |
| `/login/refresh` | `login_refresh` | `/api/login/token/refresh` | eapi(默认) | ? | - | 刷新登录 | 登录刷新 |
| `/login/status` | `login_status` | `/api/w/nuser/account/get` | weapi | ? | - | 登录状态 | - |

## logout

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/logout` | `logout` | `/api/logout` | eapi(默认) | ? | - | 退出登录 | 退出登录 |

## lyric

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/lyric` | `lyric` | `/api/song/lyric` | eapi(默认) | 否 | `id` | 获取歌词 | 歌词 |
| `/lyric/new` | `lyric_new` | `/api/song/lyric/v1` | eapi(默认) | ? | `id` | 获取逐字歌词 | 新版歌词 - 包含逐字歌词 |

## middle

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/middle/play/do/lottery` | `middle_play_do_lottery` | `/api/middle/play/do/lottery` | eapi | 是 | `activityId` `drawCount` | 云小编 - 每日抽奖 | 云小编每日抽奖 activityId: 默认 6501202 drawCount: 默认 1 checkToken: 易盾反作弊 Token |
| `/middle/play/lottery/remain/chance` | `middle_play_lottery_remain_chance` | `/api/middle/play/lottery/remain/chance` | eapi | 是 | `activityId` | 云小编 - 剩余抽奖次数 | 云小编抽奖剩余次数查询 activityId: 默认 6501202 |

## mlog

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/mlog/music/rcmd` | `mlog_music_rcmd` | `/api/mlog/rcmd/feed/list` | eapi(默认) | ? | `mvid` `songid` `limit` | 歌曲相关视频 | 歌曲相关视频 |
| `/mlog/to/video` | `mlog_to_video` | `/api/mlog/video/convert/id` | weapi | ? | `id` | 将 mlog id 转为视频 id | 将mlog id转为video id |
| `/mlog/url` | `mlog_url` | `/api/mlog/detail/v1` | weapi | ? | `id` `res` | 获取 mlog 播放地址 | mlog链接 |

## msg

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/msg/comments` | `msg_comments` | `/api/v1/user/comments/${query.uid}` | weapi | 是 | `uid` `before` `limit` | 通知 - 评论 | 评论 |
| `/msg/forwards` | `msg_forwards` | `/api/forwards/get` | weapi | 是 | - | 通知 - @我 | @我 |
| `/msg/notices` | `msg_notices` | `/api/msg/notices` | weapi | 是 | `limit` `lasttime` | 通知 - 通知 | 通知 |
| `/msg/private` | `msg_private` | `/api/msg/private/users` | weapi | 是 | - | 通知 - 私信 | 私信 |
| `/msg/private/history` | `msg_private_history` | `/api/msg/private/history` | weapi | 是 | `before` `limit` `uid` | 私信内容 | 私信内容 |
| `/msg/recentcontact` | `msg_recentcontact` | `/api/msg/recentcontact/get` | weapi | 是 | - | 最近联系人 | 最近联系 |

## music

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/music/first/listen/info` | `music_first_listen_info` | `/api/content/activity/music/first/listen/info` | eapi(默认) | ? | `id` | 回忆坐标 | 回忆坐标 |

## musician

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/musician/cloudbean` | `musician_cloudbean` | `/api/cloudbean/get` | weapi | 是 | - | 账号云豆数 | 账号云豆数 |
| `/musician/cloudbean/obtain` | `musician_cloudbean_obtain` | `/api/nmusician/workbench/mission/reward/obtain/new` | weapi | 是 | `id` `period` | 领取云豆 | 领取云豆 |
| `/musician/data/overview` | `musician_data_overview` | `/api/creator/musician/statistic/data/overview/get` | weapi | 是 | - | 音乐人数据概况 | 音乐人数据概况 |
| `/musician/play/trend` | `musician_play_trend` | `/api/creator/musician/play/count/statistic/data/trend/get` | weapi | 是 | `startTime` `endTime` | 音乐人播放趋势 | 音乐人歌曲播放趋势 |
| `/musician/sign` | `musician_sign` | `/api/creator/user/access` | weapi | 是 | - | 音乐人签到 | 音乐人签到 |
| `/musician/tasks` | `musician_tasks` | `/api/nmusician/workbench/mission/cycle/list` | weapi | 是 | - | 音乐人任务 | 获取音乐人任务 |
| `/musician/tasks/new` | `musician_tasks_new` | `/api/nmusician/workbench/mission/stage/list ` | weapi | 是 | - | 音乐人任务(新) | 获取音乐人任务 |
| `/musician/vip/tasks` | `musician_vip_tasks` | `/api/nmusician/workbench/special/right/vip/info` | eapi | 是 | - | 音乐人黑胶会员任务 | 获取音乐人任务 |

## mv

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/mv/all` | `mv_all` | `/api/mv/all` | eapi(默认) | ? | `area` `type` `order` | 全部 mv | 全部MV |
| `/mv/detail` | `mv_detail` | `/api/v1/mv/detail` | weapi | ? | `mvid` | 获取 mv 数据 | MV详情 |
| `/mv/detail/info` | `mv_detail_info` | `/api/comment/commentthread/info` | weapi | ? | `mvid` | 获取 mv 点赞转发评论数数据 | MV 点赞转发评论数数据 |
| `/mv/exclusive/rcmd` | `mv_exclusive_rcmd` | `/api/mv/exclusive/rcmd` | eapi(默认) | ? | - | 网易出品 mv | 网易出品 |
| `/mv/first` | `mv_first` | `/api/mv/first` | eapi(默认) | ? | `area` `limit` | 最新 mv | 最新MV |
| `/mv/sub` | `mv_sub` | `/api/mv/${query.t}` | weapi | ? | `t` `mvid` | 收藏/取消收藏 MV | 收藏与取消收藏MV |
| `/mv/sublist` | `mv_sublist` | `/api/cloudvideo/allvideo/sublist` | weapi | ? | - | 收藏的 MV 列表 | 已收藏MV列表 |
| `/mv/url` | `mv_url` | `/api/song/enhance/play/mv/url` | weapi | ? | `id` `r` | mv 地址 | MV链接 |

## nickname

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/nickname/check` | `nickname_check` | `/api/nickname/duplicated` | weapi | ? | `nickname` | 重复昵称检测 | - |

## personal_fm

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/personal_fm` | `personal_fm` | `/api/v1/radio/get` | weapi | 是 | - | 私人 FM | 私人FM |

## personal

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/personal/fm/mode` | `personal_fm_mode` | `/api/v1/radio/get` | eapi(默认) | ? | `mode` `submode` `limit` | 私人 FM 模式选择 | 私人FM - 模式选择 |

## personalized

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/personalized` | `personalized` | `/api/personalized/playlist` | weapi | ? | `limit` | 推荐歌单 | 推荐歌单 |
| `/personalized/djprogram` | `personalized_djprogram` | `/api/personalized/djprogram` | weapi | ? | - | 推荐电台 | 推荐电台 |
| `/personalized/mv` | `personalized_mv` | `/api/personalized/mv` | weapi | ? | - | 推荐 mv | 推荐MV |
| `/personalized/newsong` | `personalized_newsong` | `/api/personalized/newsong` | weapi | ? | `area` `limit` | 推荐新音乐 | 推荐新歌 |
| `/personalized/privatecontent` | `personalized_privatecontent` | `/api/personalized/privatecontent` | weapi | ? | - | 独家放送(入口列表) | 独家放送 |
| `/personalized/privatecontent/list` | `personalized_privatecontent_list` | `/api/v2/privatecontent/list` | weapi | ? | - | 独家放送列表 | 独家放送列表 |

## pl

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/pl/count` | `pl_count` | `/api/pl/count` | weapi | 是 | - | 私信和通知接口 | 私信和通知接口 |

## playlist

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/playlist/category/list` | `playlist_category_list` | `/api/playlist/category/list` | eapi(默认) | ? | `cat` `limit` | - | 歌单分类列表 |
| `/playlist/catlist` | `playlist_catlist` | `/api/playlist/catalogue` | eapi | ? | - | 歌单分类 | 全部歌单分类 |
| `/playlist/cover/update` | `playlist_cover_update` | `/api/playlist/cover/update` | weapi | 是 | `id` | 歌单封面上传 | - |
| `/playlist/create` | `playlist_create` | `/api/playlist/create` | weapi | ? | `name` `privacy` `type` | 新建歌单 | 创建歌单 |
| `/playlist/delete` | `playlist_delete` | `/api/playlist/remove` | weapi | ? | `id` | 删除歌单 | 删除歌单 |
| `/playlist/desc/update` | `playlist_desc_update` | `/api/playlist/desc/update` | eapi(默认) | 是 | `id` `desc` | 更新歌单描述 | 更新歌单描述 |
| `/playlist/detail` | `playlist_detail` | `/api/v6/playlist/detail` | eapi(默认) | ? | `id` `s` | 获取歌单详情 | 歌单详情 |
| `/playlist/detail/dynamic` | `playlist_detail_dynamic` | `/api/playlist/detail/dynamic` | eapi(默认) | ? | `id` | 歌单详情动态 | 歌单动态信息 |
| `/playlist/detail/rcmd/get` | `playlist_detail_rcmd_get` | `/api/playlist/detail/rcmd/get` | eapi(默认) | ? | `id` | 相关歌单推荐 | 相关歌单推荐 |
| `/playlist/highquality/tags` | `playlist_highquality_tags` | `/api/playlist/highquality/tags` | weapi | ? | - | 精品歌单标签列表 | 精品歌单 tags |
| `/playlist/hot` | `playlist_hot` | `/api/playlist/hottags` | weapi | ? | - | 热门歌单分类 | 热门歌单分类 |
| `/playlist/import/name/task/create` | `playlist_import_name_task_create` | `/api/playlist/import/name/task/create` | eapi(默认) | 是 | `local` `importStarPlaylist` | 歌单导入 - 元数据/文字/链接导入 | 歌单导入 - 元数据/文字/链接导入 |
| `/playlist/import/task/status` | `playlist_import_task_status` | `/api/playlist/import/task/status/v2` | eapi(默认) | ? | `id` | 歌单导入 - 任务状态 | 歌单导入 - 任务状态 |
| `/playlist/mylike` | `playlist_mylike` | `/api/mlog/playlist/mylike/bytime/get` | weapi | ? | `time` `limit` | 获取点赞过的视频 | - |
| `/playlist/name/update` | `playlist_name_update` | `/api/playlist/update/name` | eapi(默认) | 是 | `id` `name` | 更新歌单名 | 更新歌单名 |
| `/playlist/order/update` | `playlist_order_update` | `/api/playlist/order/update` | weapi | 是 | `ids` | 调整歌单顺序 | 编辑歌单顺序 |
| `/playlist/privacy` | `playlist_privacy` | `/api/playlist/update/privacy` | eapi(默认) | ? | `id` | 公开隐私歌单 | 公开隐私歌单 |
| `/playlist/subscribe` | `playlist_subscribe` | `/api/playlist/${path}` | eapi | ? | `t` `id` | 收藏/取消收藏歌单 | 收藏与取消收藏歌单 |
| `/playlist/subscribers` | `playlist_subscribers` | `/api/playlist/subscribers` | eapi(默认) | ? | `id` | 歌单收藏者 | 歌单收藏者 |
| `/playlist/tags/update` | `playlist_tags_update` | `/api/playlist/tags/update` | eapi(默认) | 是 | `id` `tags` | 更新歌单标签 | 更新歌单标签 |
| `/playlist/track/add` | `playlist_track_add` | `/api/playlist/track/add` | weapi | 是 | `pid` `ids` | 收藏视频到视频歌单 | - |
| `/playlist/track/all` | `playlist_track_all` | `/api/v6/playlist/detail`<br>`/api/v3/song/detail` | eapi(默认) | ? | `id` `s` | 获取歌单所有歌曲 | 通过传过来的歌单id拿到所有歌曲数据 支持传递参数limit来限制获取歌曲的数据数量 例如: /playlist/track/all?id=7044354223&limit=10 |
| `/playlist/track/delete` | `playlist_track_delete` | `/api/playlist/track/delete` | weapi | 是 | `pid` `ids` | 删除视频歌单里的视频 | 收藏单曲到歌单 从歌单删除歌曲 |
| `/playlist/tracks` | `playlist_tracks` | `/api/playlist/manipulate/tracks` | eapi(默认) | 是 | `op` `pid` `tracks` | 对歌单添加或删除歌曲 | 收藏单曲到歌单 从歌单删除歌曲 |
| `/playlist/update` | `playlist_update` | `/api/batch` | eapi(默认) | 是 | `id` `name` `desc` `tags` | 更新歌单 | 编辑歌单 |
| `/playlist/update/playcount` | `playlist_update_playcount` | `/api/playlist/update/playcount` | eapi(默认) | ? | `id` | 歌单更新播放量 | 歌单打卡 |
| `/playlist/video/recent` | `playlist_video_recent` | `/api/playlist/video/recent` | weapi | 是 | - | 最近播放的视频 | - |

## playmode

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/playmode/intelligence/list` | `playmode_intelligence_list` | `/api/playmode/intelligence/list` | eapi(默认) | 是 | `id` `pid` `sid` `count` | 心动模式/智能播放 | 智能播放 |
| `/playmode/song/vector` | `playmode_song_vector` | `/api/playmode/song/vector/get` | eapi(默认) | ? | `ids` | - | 云随机播放 |

## program

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/program/recommend` | `program_recommend` | `/api/program/recommend/v1` | weapi | ? | `type` | 推荐节目 | 推荐节目 |

## radio

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/radio/sport/get` | `radio_sport_get` | `/api/radio/sport/get` | eapi(默认) | ? | `bpm` | 跑步漫游 | 跑步漫游 |

## rebind

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/rebind` | `rebind` | `/api/user/replaceCellphone` | weapi | ? | `captcha` `phone` `oldcaptcha` `ctcode` | 更换绑定手机 | 更换手机 |

## recent

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/recent/listen/list` | `recent_listen_list` | `/api/pc/recent/listen/list` | eapi(默认) | ? | - | 最近听歌列表 | 最近听歌列表 |

## recommend

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/recommend/resource` | `recommend_resource` | `/api/v1/discovery/recommend/resource` | weapi | 是 | - | 获取每日推荐歌单 | 每日推荐歌单 |
| `/recommend/songs` | `recommend_songs` | `/api/v3/discovery/recommend/songs` | weapi | 是 | - | 获取每日推荐歌曲 | 每日推荐歌曲 |
| `/recommend/songs/dislike` | `recommend_songs_dislike` | `/api/v2/discovery/recommend/dislike` | weapi | 是 | `id` | 每日推荐歌曲-不感兴趣 | 每日推荐歌曲-不感兴趣 |

## record

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/record/recent/album` | `record_recent_album` | `/api/play-record/album/list` | weapi | ? | `limit` | 最近播放-专辑 | - |
| `/record/recent/dj` | `record_recent_dj` | `/api/play-record/djradio/list` | weapi | ? | `limit` | 最近播放-播客 | - |
| `/record/recent/playlist` | `record_recent_playlist` | `/api/play-record/playlist/list` | weapi | ? | `limit` | 最近播放-歌单 | - |
| `/record/recent/song` | `record_recent_song` | `/api/play-record/song/list` | weapi | ? | `limit` | 最近播放-歌曲 | - |
| `/record/recent/video` | `record_recent_video` | `/api/play-record/newvideo/list` | weapi | ? | `limit` | 最近播放-视频 | - |
| `/record/recent/voice` | `record_recent_voice` | `/api/play-record/voice/list` | weapi | ? | `limit` | 最近播放-声音 | - |

## register

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/register/anonimous` | `register_anonimous` | `/api/register/anonimous` | xeapi | ? | - | 登录 | 获取游客cookie |
| `/register/cellphone` | `register_cellphone` | `/api/w/register/cellphone` | eapi(默认) | ? | `captcha` `phone` `password` `nickname` | 注册(修改密码) | 注册账号 |
| `/register/checktoken/v2` | `register_checktoken_v2` | - | - | ? | `refresh` | - | 易盾反作弊 Token 注册端点 通过易盾官方 Watchman SDK（Web 版，跑在 jsdom 模拟的浏览器环境里） 实时调用 getToken(businessId) 获取反作弊 token，供后续带 checkToken 的请求 |
| `/register/checktoken/v3` | `register_checktoken_v3` | - | - | ? | `refresh` | - | 易盾反作弊 Token 注册端点 调用后获取实时 token 并存入共享存储，供后续带 checkToken 的请求使用 GET  /register/checktoken/v3        → 实时获取新 token（不缓存） POST |
| `/register/xeapikey` | `register_xeapikey` | - | - | ? | `deviceId` `currentKeyVersion` | - | - |

## related

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/related/allvideo` | `related_allvideo` | `/api/cloudvideo/v1/allvideo/rcmd` | weapi | ? | `id` | 相关视频 | 相关视频 |
| `/related/playlist` | `related_playlist` | - | - | ? | `id` | 相关歌单 | 相关歌单 |

## relay

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/relay/play/state/submit` | `relay_play_state_submit` | `/api/relay/play/state/submit` | weapi | ? | `id` `sessionId` `progress` `playMode` `type` | 提交歌曲播放状态 | 提交歌曲播放状态 |

## rep

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/rep/ugc/activity/collect` | `rep_ugc_activity_collect` | `/api/rep/ugc/activity/collect` | eapi | ? | `activityId` | 云小编 - 领取任务积分 | 云小编领取任务积分 activityId: 调用 rep/ugc/activity/get 获取 |
| `/rep/ugc/activity/get` | `rep_ugc_activity_get` | `/api/rep/ugc/activity/get` | eapi | 是 | - | 云小编 - 活动信息 | 云小编活动信息 |
| `/rep/ugc/exam/info/get` | `rep_ugc_exam_info_get` | `/api/rep/ugc/exam/info/get` | eapi | ? | `examType` | - | 云小编考试状态 examType: 1. 歌曲曲风审核: musicalStyleEnter 2. 歌曲语种审核: languageEnter 3. 歌曲原唱审核: oriSingerEnter 4. 情绪标签审核: emotionEnte |
| `/rep/ugc/exam/question/single/get` | `rep_ugc_exam_question_single_get` | `/api/rep/ugc/exam/question/single/get` | eapi | ? | `examType` `taskId` | - | 云小编考试取题 examType: 1. 歌曲曲风审核: musicalStyleEnter 2. 歌曲语种审核: languageEnter 3. 歌曲原唱审核: oriSingerEnter 4. 情绪标签审核: emotionEnte |
| `/rep/ugc/exam/result/get` | `rep_ugc_exam_result_get` | `/api/rep/ugc/exam/result/get` | eapi | ? | `examType` `taskId` | - | 云小编考试结果 examType: 1. 歌曲曲风审核: musicalStyleEnter 2. 歌曲语种审核: languageEnter 3. 歌曲原唱审核: oriSingerEnter 4. 情绪标签审核: emotionEnte |
| `/rep/ugc/exam/start` | `rep_ugc_exam_start` | `/api/rep/ugc/exam/start` | eapi | ? | `examType` | - | 云小编考试开始 examType: 1. 歌曲曲风审核: musicalStyleEnter 2. 歌曲语种审核: languageEnter 3. 歌曲原唱审核: oriSingerEnter 4. 情绪标签审核: emotionEnte |
| `/rep/ugc/exam/submit` | `rep_ugc_exam_submit` | `/api/rep/ugc/exam/submit` | eapi | ? | `examType` `taskId` `questionId` `answer` | - | 云小编考试提交 examType: 1. 歌曲曲风审核: musicalStyleEnter 2. 歌曲语种审核: languageEnter 3. 歌曲原唱审核: oriSingerEnter 4. 情绪标签审核: emotionEnte |
| `/rep/ugc/user/collect-vip` | `rep_ugc_user_collect-vip` | `/api/rep/ugc/user/collect-vip` | eapi | ? | - | 云小编 - 领取一日会员 | 云小编领取一日会员 注：前提条件见 rep/ugc/user/vip |
| `/rep/ugc/user/get` | `rep_ugc_user_get` | `/api/rep/ugc/user/get` | eapi | 是 | - | 云小编 - 获取用户详情 | 云小编获取用户详情 |
| `/rep/ugc/user/sign` | `rep_ugc_user_sign` | `/api/rep/ugc/user/sign` | eapi | 是 | - | 云小编 - 每日签到 | 云小编每日签到 |
| `/rep/ugc/user/vip` | `rep_ugc_user_vip` | `/api/rep/ugc/user/vip` | eapi | 是 | - | 云小编 - 查询会员任务状态 | 云小编查询会员任务状态 状态 (data.status) 10: 用户积分达50，可免费领取1日黑胶会员 20: 用户积分已达50，可免费领取1日黑胶会员 30: 已领取1日黑胶会员，明天再来吧~ |

## resource

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/resource/like` | `resource_like` | `/api/resource/${query.t}` | weapi | 是 | `t` `type` `id` `threadId` | 资源点赞( MV,电台,视频) | 点赞与取消点赞资源 |

## sati

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/sati/resource/list` | `sati_resource_list` | `/api/voice/sati/resource/list` | eapi(默认) | ? | `tag` | 助眠解压 - 获取标签下资源列表 | 助眠解压 - 获取标签下资源列表 |
| `/sati/resource/list/more` | `sati_resource_list_more` | `/api/voice/sati/resource/list/more/v1` | eapi(默认) | ? | `id` | 助眠解压 - 查看同类推荐 | 助眠解压 - 查看同类推荐 |
| `/sati/resource/sub` | `sati_resource_sub` | `/api/voice/sati/resource/sub` | eapi(默认) | ? | `id` `cancel` | 助眠解压 - 收藏 | 助眠解压 - 收藏 |
| `/sati/resource/sub/list` | `sati_resource_sub_list` | `/api/voice/sati/resource/sub/list` | eapi(默认) | ? | - | 助眠解压 - 收藏列表 | 助眠解压 - 收藏列表 |
| `/sati/tag/list` | `sati_tag_list` | `/api/voice/sati/tag/list` | eapi(默认) | ? | - | 助眠解压 - 标签列表 | 助眠解压 - 标签列表 |
| `/sati/timescene/resources/get` | `sati_timescene_resources_get` | `/api/voice/sati/timescene/resources/get` | eapi(默认) | ? | - | 助眠解压 - 特定时间场景下的推荐资源 | 助眠解压 - 特定时间场景下的推荐资源 |

## scrobble

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/scrobble` | `scrobble` | `/api/feedback/weblog` | eapi | ? | `id` `sourceid` `time` | 听歌打卡 | 听歌打卡 |
| `/scrobble/v1` | `scrobble_v1` | - | - | ? | `id` `time` `total` `sourceid` `sourceId` `source` `name` `artist` `bitrate` `level` `vip` | 听歌打卡 | 听歌打卡 - NCBL 加密版 (仿桌面客户端 PLV/PLD 上报) 复制自 https://github.com/folltoshe/netease-report-listen-song 的 PC 端日志上报方式 PLV 和 PLD 分 |

## search

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/search` | `search` | `/api/search/voice/get`<br>`/api/search/get` | eapi(默认) | 否 | `keywords` `type` | 搜索 | 搜索 |
| `/search/default` | `search_default` | `/api/search/defaultkeyword/get` | eapi(默认) | ? | - | 默认搜索关键词 | 默认搜索关键词 |
| `/search/hot` | `search_hot` | `/api/search/hot` | eapi(默认) | ? | - | 热搜列表(简略) | 热门搜索 |
| `/search/hot/detail` | `search_hot_detail` | `/api/hotsearchlist/get` | weapi | ? | - | 热搜列表(详细) | 热搜列表 |
| `/search/match` | `search_match` | `/api/search/match/new` | eapi(默认) | ? | `title` `album` `artist` `duration` `md5` | 本地歌曲文件匹配网易云歌曲信息 | 本地歌曲匹配音乐信息 |
| `/search/multimatch` | `search_multimatch` | `/api/search/suggest/multimatch` | weapi | ? | `type` `keywords` | 搜索多重匹配 | 多类型搜索 |
| `/search/suggest` | `search_suggest` | `/api/search/suggest/` | weapi | ? | `keywords` `type` | 搜索建议 | 搜索建议 |
| `/search/suggest/pc` | `search_suggest_pc` | `/api/search/pc/suggest/keyword/get` | eapi(默认) | ? | `keyword` | 搜索建议 - PC端 | 搜索建议pc端 |

## send

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/send/album` | `send_album` | `/api/msg/private/send` | eapi(默认) | 是 | `id` `msg` `user_ids` | 发送私信(带专辑) | 私信专辑 |
| `/send/playlist` | `send_playlist` | `/api/msg/private/send` | eapi(默认) | 是 | `playlist` `msg` `user_ids` | 发送私信(带歌单) | 私信歌单 |
| `/send/song` | `send_song` | `/api/msg/private/send` | eapi(默认) | 是 | `id` `msg` `user_ids` | 发送私信(带歌曲) | 私信歌曲 |
| `/send/text` | `send_text` | `/api/msg/private/send` | eapi(默认) | 是 | `msg` `user_ids` | 发送私信 | 私信 |

## setting

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/setting` | `setting` | `/api/user/setting` | weapi | 是 | - | 设置 | 设置 |

## share

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/share/resource` | `share_resource` | `/api/share/friends/resource` | xeapi | 是 | `type` `msg` `id` | 分享文本、歌曲、歌单、mv、电台、电台节目到动态 | 分享歌曲到动态 |

## sheet

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/sheet/list` | `sheet_list` | `/api/music/sheet/list/v1` | eapi(默认) | ? | `id` `abTest` | 乐谱列表 | 乐谱列表 |
| `/sheet/preview` | `sheet_preview` | `/api/music/sheet/preview/info` | eapi(默认) | 是 | `id` | 乐谱内容 | 乐谱预览 |

## sign

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/sign/happy/info` | `sign_happy_info` | `/api/sign/happy/info` | weapi | ? | - | 乐签信息 | - |

## signin

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/signin/progress` | `signin_progress` | `/api/act/modules/signin/v2/progress` | weapi | ? | `moduleId` | 签到进度 | 签到进度 |

## simi

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/simi/artist` | `simi_artist` | `/api/discovery/simiArtist` | weapi | ? | `id` | 获取相似歌手 | 相似歌手 |
| `/simi/mv` | `simi_mv` | `/api/discovery/simiMV` | weapi | ? | `mvid` | 相似 mv | 相似MV |
| `/simi/playlist` | `simi_playlist` | `/api/discovery/simiPlaylist` | weapi | ? | `id` | 获取相似歌单 | 相似歌单 |
| `/simi/song` | `simi_song` | `/api/v1/discovery/simiSong` | weapi | ? | `id` | 获取相似音乐 | 相似歌曲 |
| `/simi/user` | `simi_user` | `/api/discovery/simiUser` | weapi | ? | `id` | 获取最近 5 个听了这首歌的用户 | 相似用户 |

## song

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/song/chorus` | `song_chorus` | `/api/song/chorus` | eapi(默认) | ? | `id` | 副歌时间 | 副歌时间 |
| `/song/cloud/download` | `song_cloud_download` | `/api/cloud/dowonload` | eapi | ? | `id` | 直接获取云盘歌曲下载链接 | 从云盘获取歌曲下载链接 |
| `/song/copyright/rcmd` | `song_copyright_rcmd` | `/api/song/copyright/rcmd` | eapi | ? | `songid` `id` | 灰色歌曲的其他版本推荐 | 灰色歌曲的其他版本推荐 |
| `/song/creators` | `song_creators` | `/api/song/creators` | eapi(默认) | ? | `id` | 歌曲创作者信息 | 歌曲创作者信息 |
| `/song/detail` | `song_detail` | `/api/v3/song/detail` | weapi | ? | `ids` | 获取歌曲详情 | 歌曲详情 |
| `/song/downlist` | `song_downlist` | `/api/member/song/downlist` | eapi(默认) | ? | - | 会员下载歌曲记录 | 会员下载歌曲记录 |
| `/song/download/url` | `song_download_url` | `/api/song/enhance/download/url` | eapi(默认) | ? | `id` `br` | 获取客户端歌曲下载 url | 获取客户端歌曲下载链接 |
| `/song/download/url/v1` | `song_download_url_v1` | `/api/song/enhance/download/url/v1` | eapi(默认) | ? | `id` `level` | 获取客户端歌曲下载链接 - 新版 | 获取客户端歌曲下载链接 - v1 此版本不再采用 br 作为音质区分的标准 而是采用 standard, exhigh, lossless, hires, jyeffect(高清臻音), vivid(臻音全景声), jymaster(超清母 |
| `/song/dynamic/cover` | `song_dynamic_cover` | `/api/songplay/dynamic-cover` | eapi(默认) | 是 | `id` | 歌曲动态封面 | 歌曲动态封面 |
| `/song/like` | `song_like` | `/api/song/like` | eapi(默认) | 是 | `id` `like` `uid` | 喜欢歌曲 - 新版 | 喜欢歌曲 |
| `/song/like/check` | `song_like_check` | `/api/song/like/check` | eapi(默认) | 是 | `ids` | 歌曲是否喜爱 | 歌曲是否喜爱 |
| `/song/lyrics/mark` | `song_lyrics_mark` | `/api/song/play/lyrics/mark/song` | eapi(默认) | 是 | `id` | 歌词摘录 - 歌词摘录信息 | 歌词摘录 - 歌词摘录信息 |
| `/song/lyrics/mark/add` | `song_lyrics_mark_add` | `/api/song/play/lyrics/mark/add` | eapi(默认) | 是 | `id` `markId` `data` | 歌词摘录 - 添加/修改摘录歌词 | 歌词摘录 - 添加/修改摘录歌词 |
| `/song/lyrics/mark/del` | `song_lyrics_mark_del` | `/api/song/play/lyrics/mark/del` | eapi(默认) | 是 | `id` | 歌词摘录 - 删除摘录歌词 | 歌词摘录 - 删除摘录歌词 |
| `/song/lyrics/mark/user/page` | `song_lyrics_mark_user_page` | `/api/song/play/lyrics/mark/user/page` | eapi(默认) | 是 | - | 歌词摘录 - 我的歌词本 | 歌词摘录 - 我的歌词本 |
| `/song/monthdownlist` | `song_monthdownlist` | `/api/member/song/monthdownlist` | eapi(默认) | ? | - | 会员本月下载歌曲记录 | 会员本月下载歌曲记录 |
| `/song/music/detail` | `song_music_detail` | `/api/song/music/detail/get` | eapi(默认) | ? | `id` | 歌曲音质详情 | 歌曲音质详情 |
| `/song/order/update` | `song_order_update` | `/api/playlist/manipulate/tracks` | eapi(默认) | 是 | `pid` `ids` | 调整歌曲顺序 | 更新歌曲顺序 |
| `/song/purchased` | `song_purchased` | `/api/single/mybought/song/list` | weapi | 是 | - | 已购单曲 | 已购单曲 |
| `/song/red/count` | `song_red_count` | `/api/song/red/count` | eapi(默认) | ? | `id` | 歌曲红心数量 | 歌曲红心数量 |
| `/song/simi/get` | `song_simi_get` | `/api/link/position/show/resource` | eapi | ? | - | 插播相似歌曲 | 插播相似歌曲 |
| `/song/singledownlist` | `song_singledownlist` | `/api/member/song/singledownlist` | eapi(默认) | ? | - | 已购买单曲 | 已购买单曲 |
| `/song/url` | `song_url` | `/api/song/enhance/player/url` | eapi(默认) | ? | `id` `br` | 获取音乐 url | 歌曲链接 |
| `/song/url/match` | `song_url_match` | - | - | ? | `id` `source` | 直接获取灰色歌曲链接 | 网易云歌曲解灰(适配SPlayer的UNM-Server) 支持qq音乐、酷狗音乐、酷我音乐、咪咕音乐、第三方网易云API等等(来自GD音乐台) |
| `/song/url/ncmget` | `song_url_ncmget` | - | - | ? | - | - | 夹带私货的东西就不要放在这里了 |
| `/song/url/v1` | `song_url_v1` | `/api/song/enhance/player/url/v1` | xeapi | ? | `id` `level` | 获取音乐 url - 新版 | 歌曲链接 - v1 此版本不再采用 br 作为音质区分的标准 而是采用 standard, exhigh, lossless, hires, jyeffect(高清臻音), vivid(臻音全景声), jymaster(超清母带), sky |
| `/song/url/v1/302` | `song_url_v1_302` | `/api/song/enhance/download/url/v1`<br>`/api/song/enhance/player/url/v1` | eapi(默认) | ? | `id` `level` | 302到音乐 url - 新版 | 获取客户端歌曲下载链接 - v1 此版本不再采用 br 作为音质区分的标准 而是采用 standard, exhigh, lossless, hires, jyeffect(高清臻音), vivid(臻音全景声), jymaster(超清母 |
| `/song/wiki/info` | `song_wiki_info` | `/api/link/page/parent/relation/construct/info` | eapi | ? | - | 音乐百科 | 歌曲百科 |
| `/song/wiki/summary` | `song_wiki_summary` | `/api/song/play/about/block/page` | eapi(默认) | ? | `id` | 音乐百科 - 简要信息 | 音乐百科基础信息 |

## starpick

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/starpick/comments/summary` | `starpick_comments_summary` | `/api/homepage/block/page` | eapi(默认) | ? | - | 云村星评馆 - 简要评论 | 云村星评馆 - 简要评论列表 |

## style

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/style/album` | `style_album` | `/api/style-tag/home/album` | weapi | ? | `tagId` `size` `cursor` `sort` | 曲风-专辑 | 曲风-专辑 |
| `/style/artist` | `style_artist` | `/api/style-tag/home/artist` | weapi | ? | `tagId` `size` `cursor` | 曲风-歌手 | 曲风-歌手 |
| `/style/detail` | `style_detail` | `/api/style-tag/home/head` | weapi | ? | `tagId` | 曲风详情 | 曲风详情 |
| `/style/list` | `style_list` | `/api/tag/list/get` | weapi | ? | - | 曲风列表 | 曲风列表 |
| `/style/playlist` | `style_playlist` | `/api/style-tag/home/playlist` | weapi | ? | `tagId` `size` `cursor` | 曲风-歌单 | 曲风-歌单 |
| `/style/preference` | `style_preference` | `/api/tag/my/preference/get` | weapi | 是 | - | 曲风偏好 | 曲风偏好 |
| `/style/song` | `style_song` | `/api/style-tag/home/song` | weapi | ? | `tagId` `size` `cursor` `sort` | 曲风-歌曲 | 曲风-歌曲 |

## summary

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/summary/annual` | `summary_annual` | `/api/activity/summary/annual/${query.year}/${key}` | eapi(默认) | 是 | `year` | 年度听歌报告 | 年度听歌报告2017-2023 |

## thinktank

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/thinktank/audit/resource/detail` | `thinktank_audit_resource_detail` | `/api/thinktank/audit/resource/detail` | eapi | ? | `type` | 云小编 - 获取任务 | 云小编获取任务 type: 1: 歌曲曲风审核 musicalStyleEnter 2: 歌曲语种审核 languageEnter 3: 歌曲原唱审核 oriSingerEnter 4: 情绪标签审核 emotionEnter |
| `/thinktank/audit/resource/update` | `thinktank_audit_resource_update` | `/api/thinktank/audit/resource/update` | eapi | ? | `type` `taskId` `judgement` | 云小编 - 提交任务 | 云小编提交任务 type: 1: 歌曲曲风审核 musicalStyleEnter 2: 歌曲语种审核 languageEnter 3: 歌曲原唱审核 oriSingerEnter 4: 情绪标签审核 emotionEnter taskId |

## threshold

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/threshold/detail/get` | `threshold_detail_get` | `/api/influencer/web/apply/threshold/detail/get` | eapi(默认) | ? | - | - | 获取达人达标信息 |

## top

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/top/album` | `top_album` | `/api/discovery/new/albums/area` | weapi | ? | `area` `type` `year` `mouth` | 新碟上架 | 新碟上架 |
| `/top/artists` | `top_artists` | `/api/artist/top` | weapi | ? | - | 热门歌手 | 热门歌手 |
| `/top/list` | `top_list` | `/api/playlist/v4/detail` | eapi(默认) | ? | `id` | 排行榜详情 | 排行榜 |
| `/top/mv` | `top_mv` | `/api/mv/toplist` | weapi | ? | `area` | mv 排行 | MV排行榜 |
| `/top/playlist` | `top_playlist` | `/api/playlist/list` | weapi | ? | `cat` `order` | 歌单 ( 网友精选碟 ) | 分类歌单 |
| `/top/playlist/highquality` | `top_playlist_highquality` | `/api/playlist/highquality/list` | weapi | ? | `cat` `before` `limit` | 获取精品歌单 | 精品歌单 |
| `/top/song` | `top_song` | `/api/v1/discovery/new/songs` | weapi | ? | `type` | 新歌速递 | 新歌速递 |

## topic

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/topic/detail` | `topic_detail` | `/api/act/detail` | weapi | ? | `actid` | 获取话题详情 | - |
| `/topic/detail/event/hot` | `topic_detail_event_hot` | `/api/act/event/hot` | weapi | ? | `actid` | 获取话题详情热门动态 | - |
| `/topic/sublist` | `topic_sublist` | `/api/topic/sublist` | weapi | ? | - | 收藏的专栏 | 收藏的专栏 |

## toplist

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/toplist` | `toplist` | `/api/toplist` | eapi(默认) | ? | - | 所有榜单 | 所有榜单介绍 |
| `/toplist/artist` | `toplist_artist` | `/api/toplist/artist` | weapi | ? | `type` | 歌手榜 | 歌手榜 |
| `/toplist/detail` | `toplist_detail` | `/api/toplist/detail` | weapi | ? | - | 所有榜单内容摘要 | 所有榜单内容摘要 |
| `/toplist/detail/v2` | `toplist_detail_v2` | `/api/toplist/detail/v2` | weapi | ? | - | - | 所有榜单内容摘要v2 |

## ugc

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/ugc/album/get` | `ugc_album_get` | `/api/rep/ugc/album/get` | eapi(默认) | 是 | `id` | 专辑简要百科信息 | 专辑简要百科信息 |
| `/ugc/artist/get` | `ugc_artist_get` | `/api/rep/ugc/artist/get` | eapi(默认) | 是 | `id` | 歌手简要百科信息 | 歌手简要百科信息 |
| `/ugc/artist/search` | `ugc_artist_search` | `/api/rep/ugc/artist/search` | eapi(默认) | 是 | `keyword` `limit` | 搜索歌手 | 搜索歌手 可传关键字或者歌手id |
| `/ugc/detail` | `ugc_detail` | `/api/rep/ugc/detail` | weapi | 是 | `auditStatus` `type` `sortBy` `order` | 用户贡献内容 | 用户贡献内容 |
| `/ugc/mv/get` | `ugc_mv_get` | `/api/rep/ugc/mv/get` | eapi(默认) | 是 | `id` | mv 简要百科信息 | mv简要百科信息 |
| `/ugc/song/get` | `ugc_song_get` | `/api/rep/ugc/song/get` | eapi(默认) | 是 | `id` | 歌曲简要百科信息 | 歌曲简要百科信息 |
| `/ugc/user/devote` | `ugc_user_devote` | `/api/rep/ugc/user/devote` | eapi(默认) | 是 | - | 用户贡献条目、积分、云贝数量 | 用户贡献条目、积分、云贝数量 |

## user

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/user/account` | `user_account` | `/api/nuser/account/get` | weapi | 是 | - | 获取账号信息 | - |
| `/user/audio` | `user_audio` | `/api/djradio/get/byuser` | weapi | 是 | `uid` | 用户电台 | 用户创建的电台 |
| `/user/binding` | `user_binding` | `/api/v1/user/bindings/${query.uid}` | weapi | 是 | `uid` | 获取用户绑定信息 | - |
| `/user/bindingcellphone` | `user_bindingcellphone` | `/api/user/bindingCellphone` | weapi | ? | `phone` `captcha` `countrycode` `password` | - | - |
| `/user/cloud` | `user_cloud` | `/api/v1/cloud/get` | weapi | 是 | - | 云盘 | 云盘数据 |
| `/user/cloud/del` | `user_cloud_del` | `/api/cloud/del` | weapi | 是 | `id` | 云盘歌曲删除 | 云盘歌曲删除 |
| `/user/cloud/detail` | `user_cloud_detail` | `/api/v1/cloud/get/byids` | weapi | 是 | `id` | 云盘数据详情 | 云盘数据详情 |
| `/user/comment/history` | `user_comment_history` | `/api/comment/user/comment/history` | weapi | 是 | `limit` `uid` `time` | 获取用户历史评论 | - |
| `/user/detail` | `user_detail` | `/api/v1/user/detail/${query.uid}` | weapi | 是 | `uid` | 获取用户详情 | 用户详情 |
| `/user/detail/new` | `user_detail_new` | `/api/w/v1/user/detail/${query.uid}` | eapi | ? | `uid` | - | 用户详情 |
| `/user/dj` | `user_dj` | `/api/dj/program/${query.uid}` | weapi | 是 | `uid` | 获取用户电台 | 用户电台节目 |
| `/user/event` | `user_event` | `/api/event/get/${query.uid}` | eapi(默认) | 是 | `lasttime` `limit` `uid` | 获取用户动态 | 用户动态 |
| `/user/event/all` | `user_event_all` | - | - | 是 | - | 获取当前登录用户的全部可枚举动态 | 获取当前登录用户可被上游枚举的全部动态 |
| `/user/follow/mixed` | `user_follow_mixed` | `/api/user/follow/users/mixed/get/v2` | eapi(默认) | ? | `size` `cursor` `scene` | 当前账号关注的用户/歌手 | 当前账号关注的用户/歌手 |
| `/user/followeds` | `user_followeds` | `/api/user/getfolloweds/${query.uid}` | eapi(默认) | 是 | `uid` `lasttime` `limit` | 获取用户粉丝列表 | 关注TA的人(粉丝) |
| `/user/follows` | `user_follows` | `/api/user/getfollows/${query.uid}` | weapi | 是 | `uid` | 获取用户关注列表 | TA关注的人(关注) |
| `/user/level` | `user_level` | `/api/user/level` | weapi | 是 | - | 获取用户等级信息 | 类别热门电台 |
| `/user/medal` | `user_medal` | `/api/medal/user/page` | eapi(默认) | 是 | `uid` | 用户徽章 | 用户徽章 |
| `/user/mutualfollow/get` | `user_mutualfollow_get` | `/api/user/mutualfollow/get` | eapi(默认) | 是 | `uid` | 用户是否互相关注 | 用户是否互相关注 |
| `/user/playlist` | `user_playlist` | `/api/user/playlist` | weapi | 是 | `uid` | 获取用户歌单 | 用户歌单 |
| `/user/playlist/collect` | `user_playlist_collect` | `/api/user/playlist/collect` | eapi(默认) | 是 | `uid` | 用户的收藏歌单列表 | 获取用户的收藏歌单列表 |
| `/user/playlist/create` | `user_playlist_create` | `/api/user/playlist/create` | eapi(默认) | 是 | `uid` | 用户的创建歌单列表 | 获取用户的创建歌单列表 |
| `/user/record` | `user_record` | `/api/v1/play/record` | weapi | 是 | `uid` `type` | 获取用户播放记录 | 听歌排行 |
| `/user/replacephone` | `user_replacephone` | `/api/user/replaceCellphone` | weapi | 是 | `phone` `captcha` `oldcaptcha` `countrycode` | 用户绑定手机 | - |
| `/user/social/status` | `user_social_status` | `/api/social/user/status` | eapi(默认) | 是 | `uid` | 用户状态 | 用户状态 |
| `/user/social/status/edit` | `user_social_status_edit` | `/api/social/user/status/edit` | eapi(默认) | 是 | `type` `iconUrl` `content` `actionUrl` | 用户状态 - 编辑 | 用户状态 - 编辑 |
| `/user/social/status/rcmd` | `user_social_status_rcmd` | `/api/social/user/status/rcmd` | eapi(默认) | 是 | - | 用户状态 - 相同状态的用户 | 用户状态 - 相同状态的用户 |
| `/user/social/status/support` | `user_social_status_support` | `/api/social/user/status/support` | eapi(默认) | 是 | - | 用户状态 - 支持设置的状态 | 用户状态 - 支持设置的状态 |
| `/user/subcount` | `user_subcount` | `/api/subcount` | weapi | 是 | - | 获取用户信息 , 歌单，收藏，mv, dj 数量 | 收藏计数 |
| `/user/update` | `user_update` | `/api/user/profile/update` | eapi(默认) | 是 | `birthday` `city` `gender` `nickname` `province` `signature` | 更新用户信息 | 编辑用户信息 |

## verify

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/verify/getQr` | `verify_getQr` | `/api/frontrisk/verify/getqrcode` | weapi | ? | `vid` `type` `token` `evid` `sign` | 验证接口-二维码生成 | - |
| `/verify/qrcodestatus` | `verify_qrcodestatus` | `/api/frontrisk/verify/qrcodestatus` | weapi | ? | `qr` | 验证接口-二维码检测 | - |

## video

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/video/category/list` | `video_category_list` | `/api/cloudvideo/category/list` | weapi | ? | - | 获取视频分类列表 | 视频分类列表 |
| `/video/detail` | `video_detail` | `/api/cloudvideo/v1/video/detail` | weapi | ? | `id` | 视频详情 | 视频详情 |
| `/video/detail/info` | `video_detail_info` | `/api/comment/commentthread/info` | weapi | ? | `vid` | 获取视频点赞转发评论数数据 | 视频点赞转发评论数数据 |
| `/video/group` | `video_group` | `/api/videotimeline/videogroup/otherclient/get` | weapi | ? | `id` `offset` | 获取视频标签/分类下的视频 | 视频标签/分类下的视频 |
| `/video/group/list` | `video_group_list` | `/api/cloudvideo/group/list` | weapi | ? | - | 获取视频标签列表 | 视频标签列表 |
| `/video/sub` | `video_sub` | `/api/cloudvideo/video/${query.t}` | weapi | ? | `t` `id` | 收藏视频 | 收藏与取消收藏视频 |
| `/video/timeline/all` | `video_timeline_all` | `/api/videotimeline/otherclient/get` | weapi | ? | `offset` | 获取全部视频列表 | 全部视频列表 |
| `/video/timeline/recommend` | `video_timeline_recommend` | `/api/videotimeline/get` | weapi | ? | `offset` | 获取推荐视频 | 推荐视频 |
| `/video/url` | `video_url` | `/api/cloudvideo/playurl` | weapi | ? | `id` `res` | 获取视频播放地址 | 视频链接 |

## vip

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/vip/growthpoint` | `vip_growthpoint` | `/api/vipnewcenter/app/level/growhpoint/basic` | weapi | 是 | - | vip 成长值 | 会员成长值 |
| `/vip/growthpoint/details` | `vip_growthpoint_details` | `/api/vipnewcenter/app/level/growth/details` | weapi | 是 | - | vip 成长值获取记录 | 会员成长值领取记录 |
| `/vip/growthpoint/get` | `vip_growthpoint_get` | `/api/vipnewcenter/app/level/task/reward/get` | weapi | 是 | `ids` | 领取 vip 成长值 | 领取会员成长值 |
| `/vip/growthpoint/getall` | `vip_growthpoint_getall` | `/api/vipnewcenter/app/level/task/reward/getall` | xeapi | 是 | - | 一键领取所有 vip 成长值 | 一键领取所有会员成长值 |
| `/vip/info` | `vip_info` | `/api/music-vip-membership/front/vip/info` | weapi | 是 | `uid` | 获取 VIP 信息 | 获取 VIP 信息 |
| `/vip/info/v2` | `vip_info_v2` | `/api/music-vip-membership/client/vip/info` | weapi | 是 | `uid` | 获取 VIP 信息(app 端) | 获取 VIP 信息 |
| `/vip/sign` | `vip_sign` | `/api/vip-center-bff/task/sign`<br>`/api/vipnewcenter/app/level/user/checkin/history/detail` | weapi / eapi | 是 | - | 黑胶乐签打卡 | 黑胶乐签打卡 |
| `/vip/sign/detail` | `vip_sign_detail` | `/api/vipnewcenter/app/level/user/checkin/history/detail` | eapi | 是 | `timestamp` | 黑胶乐签详情 | 黑胶乐签打卡详情 |
| `/vip/sign/history` | `vip_sign_history` | `/api/vipnewcenter/app/minidesk/music/sign/pc` | eapi | 是 | `type` | 黑胶乐签历史 | 黑胶乐签打卡历史 / 状态查询 支持传入 type=0（用户信息栏）或 type=1（黑胶乐签） |
| `/vip/sign/info` | `vip_sign_info` | `/api/vipnewcenter/app/user/sign/info` | weapi | 是 | - | 黑胶乐签未来打卡信息 | 黑胶乐签未来签到信息 |
| `/vip/tasks` | `vip_tasks` | `/api/vipnewcenter/app/level/task/list` | weapi | 是 | - | vip 任务 | 会员任务 |
| `/vip/tasks/v1` | `vip_tasks_v1` | `/api/middle/vip/mission/user/progress/list` | xeapi | ? | `id` | - | 会员任务 - 新版 |
| `/vip/timemachine` | `vip_timemachine` | `/api/vipmusic/newrecord/weekflow` | weapi | ? | `startTime` `endTime` `limit` | 黑胶时光机 | 黑胶时光机 |

## voice

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/voice/delete` | `voice_delete` | `/api/content/voice/delete` | eapi(默认) | ? | `ids` | 播客删除 | - |
| `/voice/detail` | `voice_detail` | `/api/voice/workbench/voice/detail` | eapi(默认) | ? | `id` | 播客声音详情 | - |
| `/voice/lyric` | `voice_lyric` | `/api/voice/lyric/get` | eapi(默认) | ? | `id` | 获取声音歌词 | - |
| `/voice/upload` | `voice_upload` | `/api/nos/token/alloc`<br>`/api/voice/workbench/voice/batch/upload/preCheck`<br>`/api/voice/workbench/voice/batch/upload/v2` | weapi | 是 | `songFile` `imgFile` `voiceListId` `coverImgId` `categoryId` `secondCategoryId` `description` `songName` `privacy` `publishTime` `autoPublish` `autoPublishText` `orderNo` `composedSongs` | 播客上传声音 | - |

## voicelist

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/voicelist/detail` | `voicelist_detail` | `/api/voice/workbench/voicelist/detail` | eapi(默认) | ? | `id` | 播客列表详情 | - |
| `/voicelist/list` | `voicelist_list` | `/api/voice/workbench/voices/by/voicelist` | eapi(默认) | ? | `voiceListId` | 播客声音列表 | - |
| `/voicelist/list/search` | `voicelist_list_search` | `/api/voice/workbench/voice/list` | eapi(默认) | ? | `limit` `offset` `name` `displayStatus` `type` `voiceFeeType` `radioId` | 播客声音搜索 | 声音搜索 |
| `/voicelist/my/created` | `voicelist_my_created` | `/api/social/my/created/voicelist/v1` | weapi | 是 | `limit` | 我创建的播客声音 | 我创建的播客声音 |
| `/voicelist/search` | `voicelist_search` | `/api/search/voicelist/get` | eapi(默认) | ? | `keyword` `limit` `offset` | 播客列表 | - |
| `/voicelist/trans` | `voicelist_trans` | `/api/voice/workbench/radio/program/trans` | eapi(默认) | ? | `radioId` `programId` `position` | 播客声音排序 | - |

## weblog

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/weblog` | `weblog` | `/api/feedback/weblog` | weapi | ? | `data` | - | 操作记录 |

## yunbei

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/yunbei` | `yunbei` | `/api/point/signed/get` | weapi | 是 | - | 云贝 | - |
| `/yunbei/expense` | `yunbei_expense` | `/api/point/expense` | eapi(默认) | ? | - | - | - |
| `/yunbei/info` | `yunbei_info` | `/api/v1/user/info` | weapi | 是 | - | 云贝账户信息 | - |
| `/yunbei/rcmd/song` | `yunbei_rcmd_song` | `/api/yunbei/rcmd/song/submit` | weapi | 是 | `id` `reason` | 云贝推歌 | 云贝推歌 |
| `/yunbei/rcmd/song/history` | `yunbei_rcmd_song_history` | `/api/yunbei/rcmd/song/history/list` | weapi | 是 | `size` `cursor` | 云贝推歌历史记录 | 云贝推歌历史记录 |
| `/yunbei/receipt` | `yunbei_receipt` | `/api/point/receipt` | eapi(默认) | ? | - | - | - |
| `/yunbei/sign` | `yunbei_sign` | `/api/pointmall/user/sign` | xeapi | 是 | - | 云贝签到 | - |
| `/yunbei/task/finish` | `yunbei_task_finish` | `/api/usertool/task/point/receive` | weapi | ? | `userTaskId` `depositCode` | 云贝完成任务 | - |
| `/yunbei/task/finish/v1` | `yunbei_task_finish_v1` | `/api/ad/power/yunbei/distribution/create` | weapi | 是 | - | 云贝广告任务 - 完成任务领取云贝 | 云贝广告任务 - 完成任务领取云贝 逆向来源: 云贝任务中心 H5 (st.music.163.com/yunbei-listen) main.js POST /api/ad/power/yunbei/distribution/create |
| `/yunbei/task/list/v1` | `yunbei_task_list_v1` | `/api/ad/power/yunbei/distribution/list` | weapi | 是 | - | 云贝广告任务 - 今日任务状态 | 云贝广告任务 - 查询今日任务状态 逆向来源: 云贝任务中心 H5 (st.music.163.com/yunbei-listen) main.js GET /api/ad/power/yunbei/distribution/list 返回 |
| `/yunbei/task/recommend/song` | `yunbei_task_recommend_song` | `/api/ad/power/yunbei/distribution/recommend/song` | weapi | 是 | - | 云贝广告任务 - 获取推荐歌曲 | 云贝广告任务 - 获取推荐歌曲 逆向来源: 云贝任务中心 H5 (st.music.163.com/yunbei-listen) main.js POST /api/ad/power/yunbei/distribution/recommen |
| `/yunbei/tasks` | `yunbei_tasks` | `/api/usertool/task/list/all` | weapi | 是 | - | 云贝所有任务 | - |
| `/yunbei/tasks/todo` | `yunbei_tasks_todo` | `/api/usertool/task/todo/query` | weapi | 是 | - | 云贝 todo 任务 | - |
| `/yunbei/today` | `yunbei_today` | `/api/point/today/get` | weapi | 是 | - | 云贝今日签到信息 | - |
