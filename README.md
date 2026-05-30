# Cecilia

网易云音乐 API 的非官方 TypeScript 封装。

## 安装

```bash
pnpm add @kuriyona/cecilia
```

## 使用

```ts
import { getPlaylistDetail, getLyric, getSongsDetail } from '@kuriyona/cecilia'
```

### `getPlaylistDetail(id)`

获取歌单详情。

```ts
const detail = await getPlaylistDetail(123)
// {
//   id: 123,
//   name: '歌单名',
//   coverImgId: 456,
//   coverImgUrl: 'https://example.com/cover.jpg',
//   userId: 789,
//   createTime: 1000000,
//   songs: [{ id: 1, addTime: 2000000 }, ...]
// }
```

### `getLyric(id)`

获取歌词。

```ts
const lyric = await getLyric(1)
// [
//   { time: 1.5, text: 'Hello' },
//   { time: 5, text: 'World' },
// ]
```

### `getSongsDetail(ids)`

批量获取歌曲详情。

```ts
const songs = await getSongsDetail([1, 2])
// [
//   {
//     id: 1,
//     name: 'Song A',
//     artists: [{ id: 10, name: 'Artist 1' }],
//     album: { id: 100, name: 'Album A', picUrl: '...' },
//     duration: 200000,
//   },
// ]
```

## 开发

```bash
pnpm test        # 运行测试
pnpm test:watch  # 监听模式
pnpm build       # 构建
```