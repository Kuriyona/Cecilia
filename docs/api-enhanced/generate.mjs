#!/usr/bin/env node
/**
 * 从 api-enhanced 克隆生成接口索引。
 *
 * 用法：node docs/api-enhanced/generate.mjs
 * 前置：仓库根目录存在 ./api-enhanced（pnpm clone:api-enhanced）
 *
 * 数据来源（全部为静态读取，不发起任何网络请求）：
 * - api-enhanced/module/*.js        路由、上游接口路径、加密方式、checkToken、上传、说明注释
 * - api-enhanced/server.js          special 路由覆盖
 * - api-enhanced/interface.d.ts     导出函数与参数名
 * - api-enhanced/public/docs/home.md  官方文档章节（标题、登录标注、文档覆盖）
 * - api-enhanced/package.json       版本号
 *
 * 生成：README.md / apis.md / apis.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '..', '..')
const API = process.env.API_ENHANCED_DIR
  ? path.resolve(process.env.API_ENHANCED_DIR)
  : path.join(REPO, 'api-enhanced')
const MODULE_DIR = path.join(API, 'module')
const DOC_MD = path.join(API, 'public', 'docs', 'home.md')

const read = (p) => fs.readFileSync(p, 'utf8')

/* ---------------------------------------------------------------- 加密方式 */

const CRYPTO_LABEL = {
  weapi: 'weapi',
  eapi: 'eapi',
  xeapi: 'xeapi',
  linuxapi: 'linuxapi',
  api: 'api(明文)',
  '': 'eapi(默认)',
}

/* ---------------------------------------------------------------- 工具 */

const uniq = (arr) => [...new Set(arr)]

/** 去掉行首注释标记，取注释里第一行非空、非分隔符的文本作为说明 */
function leadingComment(src) {
  const lines = src.split('\n')
  const out = []
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) {
      const text = t
        .replace(/^\/\*+/, '')
        .replace(/^\*+\/?/, '')
        .replace(/^\/\/+/, '')
        .trim()
      if (text && !/^[-=*]+$/.test(text)) out.push(text)
    } else if (out.length) {
      break
    } else if (t !== '') {
      break
    }
  }
  return out.join(' ').slice(0, 120)
}

/** 匹配括号（用于 interface.d.ts 的 params 类型） */
function matchParen(src, openIdx) {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/* ---------------------------------------------------------------- module 扫描 */

function parseModuleRouteOverrides(serverSrc) {
  const special = {}
  const block = serverSrc.match(/const special = \{([\s\S]*?)\n\s*\}/)
  if (block) {
    for (const m of block[1].matchAll(/'([\w.]+\.js)'\s*:\s*'([^']+)'/g)) {
      special[m[1]] = m[2]
    }
  }
  return special
}

function scanModules() {
  const overrides = parseModuleRouteOverrides(read(path.join(API, 'server.js')))
  const files = fs
    .readdirSync(MODULE_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort()

  return files.map((file) => {
    const src = read(path.join(MODULE_DIR, file))
    const identifier = file.replace(/\.js$/, '')
    const route =
      overrides[file] ?? '/' + identifier.replace(/_/g, '/')

    // 上游接口路径：request(`/api/...` | '/api/...'
    const upstream = uniq(
      [...src.matchAll(/\brequest\(\s*(?:`([^`]*)`|'([^']*)'|"([^"]*)")/g)]
        .map((m) => m[1] ?? m[2] ?? m[3])
        .filter((u) => u.startsWith('/')),
    )

    // createOption(query[, crypto[, checkToken]])
    const cryptos = []
    const checkTokens = []
    for (const call of src.matchAll(/createOption\(([^()]*)\)/g)) {
      const args = call[1].split(',').map((a) => a.trim())
      const cryptoArg = args[1] ?? ''
      const tokenArg = args[2] ?? ''
      cryptos.push(
        /^['"]/.test(cryptoArg)
          ? cryptoArg.replace(/['"]/g, '')
          : cryptoArg === ''
            ? ''
            : 'dynamic',
      )
      if (tokenArg) checkTokens.push(tokenArg.replace(/['"]/g, ''))
    }
    for (const m of src.matchAll(/checkToken\s*[:=]\s*['"]?(v2|v3|true)['"]?/g)) {
      checkTokens.push(m[1])
    }

    const crypto = cryptos.length
      ? uniq(cryptos).filter((c) => c !== '').length
        ? uniq(cryptos).filter((c) => c !== '')
        : ['']
      : []

    return {
      identifier,
      file,
      route,
      upstream,
      crypto: uniq(crypto).map((c) => c || ''),
      cryptoLabel: uniq(crypto)
        .map((c) =>
          c === ''
            ? CRYPTO_LABEL['']
            : /^[a-z]+$/.test(c) && CRYPTO_LABEL[c]
              ? CRYPTO_LABEL[c]
              : '动态（按 query / 变量）',
        )
        .join(' / '),
      checkToken: uniq(checkTokens),
      upload: /plugins\/(upload|songUpload)/.test(src),
      usesCookieDirectly: /query\.cookie/.test(src),
      description: leadingComment(src),
      bytes: Buffer.byteLength(src),
    }
  })
}

/* ---------------------------------------------------------------- 文档扫描 */

const LOGIN_MUST = /(需要登录|登录后调用|登录后才|请先登录|301)/

function classifyLogin(block) {
  if (/不需要登录/.test(block)) return 'no'
  if (LOGIN_MUST.test(block)) return 'yes'
  return 'unknown'
}

function scanDocs(knownRoutes) {
  const md = read(DOC_MD).replace(/\r\n/g, '\n')
  const lines = md.split('\n')
  const sections = []
  let cur = null
  for (const line of lines) {
    const h = line.match(/^###\s+(.+)$/)
    if (h) {
      cur = { title: h[1].trim(), routes: [], login: 'unknown', body: [] }
      sections.push(cur)
      continue
    }
    if (!cur) continue
    cur.body.push(line)
    const addr = line.match(/接口地址[^`\n]*`([^`]+)`/)
    if (addr) {
      for (const r of addr[1].split(/\s+/)) cur.routes.push(r)
    }
  }
  for (const s of sections) {
    const body = s.body.join('\n')
    s.login = classifyLogin(body)
    // 章节里出现的所有路由（含调用例子），用于回填 module → 章节
    s.allRoutes = uniq([...body.matchAll(/`(\/[a-z0-9_/-]+)`/g)].map((m) => m[1]))
  }
  const byRoute = new Map()
  // 第一遍只认 `接口地址`（权威），第二遍才用章节里出现的其它路由兜底
  for (const s of sections) {
    for (const r of s.routes) {
      const key = r.replace(/\/+$/, '')
      if (knownRoutes.has(key) && !byRoute.has(key)) byRoute.set(key, s)
    }
  }
  for (const s of sections) {
    for (const r of s.allRoutes) {
      const key = r.replace(/\/+$/, '')
      if (knownRoutes.has(key) && !byRoute.has(key)) byRoute.set(key, s)
    }
  }
  return { sections, byRoute }
}

/* ---------------------------------------------------------------- TS 类型扫描 */

function scanTypes() {
  const src = read(path.join(API, 'interface.d.ts'))
  const byFn = new Map()
  const marker = 'export function '
  let i = src.indexOf(marker)
  while (i !== -1) {
    const nameStart = i + marker.length
    const nameEnd = src.indexOf('(', nameStart)
    if (nameEnd === -1) break
    const name = src.slice(nameStart, nameEnd).trim()
    const close = matchParen(src, nameEnd)
    if (close === -1) break
    const paramsText = src.slice(nameEnd + 1, close)
    // 去掉 `params:` 声明，只保留类型体；裸类型引用（如 RequestBaseConfig）没有专属参数
    const decl = paramsText.match(/^\s*params\s*:/)
    const typeText = decl ? paramsText.slice(decl[0].length) : paramsText
    byFn.set(name, topLevelKeys(typeText))
    i = src.indexOf(marker, close)
  }
  return byFn
}

/** 取类型体顶层对象的属性名（不进入嵌套对象） */
function topLevelKeys(typeText) {
  const keys = []
  let depth = 0
  for (let i = 0; i < typeText.length; i++) {
    const c = typeText[i]
    if (c === '{' || c === '(' || c === '<') depth++
    else if (c === '}' || c === ')' || c === '>') depth--
    else if (depth <= 1) {
      const m = typeText.slice(i).match(/^([A-Za-z_$][\w$]*)\s*\??\s*:/)
      if (m) {
        keys.push(m[1])
        i += m[0].length - 1
      }
    }
  }
  return uniq(keys).filter((k) => k !== 'RequestBaseConfig')
}

/* ---------------------------------------------------------------- 组装 */

const modules = scanModules()
const routeSet = new Set(modules.map((m) => m.route))
const { sections, byRoute } = scanDocs(routeSet)
const types = scanTypes()

for (const m of modules) {
  const sec = byRoute.get(m.route)
  m.doc = sec
    ? { title: sec.title, login: sec.login }
    : null
  m.login = sec ? sec.login : 'unknown'
  m.params = types.get(m.identifier) ?? null
}

const categoryOf = (route) => route.split('/').filter(Boolean)[0] ?? '(root)'
const categories = new Map()
for (const m of modules) {
  const c = categoryOf(m.route)
  if (!categories.has(c)) categories.set(c, [])
  categories.get(c).push(m)
}

/* ---------------------------------------------------------------- 统计 */

const count = (arr, fn) => arr.reduce((acc, x) => {
  const k = fn(x)
  acc[k] = (acc[k] ?? 0) + 1
  return acc
}, {})

const sorted = [...modules].sort((a, b) => a.route.localeCompare(b.route))

const cryptoStats = count(sorted, (m) =>
  m.crypto.length === 0 ? '未使用 createOption' : m.cryptoLabel,
)
const loginStats = count(sorted, (m) => m.login)
const stats = {
  total: sorted.length,
  categories: categories.size,
  documented: sorted.filter((m) => m.doc).length,
  typed: sorted.filter((m) => m.params).length,
  upload: sorted.filter((m) => m.upload).length,
  checkToken: sorted.filter((m) => m.checkToken.length).length,
  directCookie: sorted.filter((m) => m.usesCookieDirectly).length,
  withUpstream: sorted.filter((m) => m.upstream.length).length,
  docSections: sections.length,
  cryptoStats,
  loginStats,
}

/* ---------------------------------------------------------------- 版本信息 */

let apiVersion = '?'
let apiCommit = '?'
let apiCommitDate = '?'
try {
  apiVersion = JSON.parse(read(path.join(API, 'package.json'))).version
} catch {}
try {
  apiCommit = execFileSync('git', ['-C', API, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
  apiCommitDate = execFileSync(
    'git',
    ['-C', API, 'log', '-1', '--format=%cI'],
    { encoding: 'utf8' },
  ).trim()
} catch {}

const generatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

const LOGIN_TEXT = { yes: '是', no: '否', unknown: '?' }
const cell = (s) => (s === '' || s == null ? '-' : String(s).replace(/\|/g, '\\|'))

/* ---------------------------------------------------------------- README.md */

const catRows = [...categories.entries()]
  .map(([c, list]) => [
    `[${c}](#${c.toLowerCase()})`,
    String(list.length),
    list
      .map((m) => '`' + m.route + '`')
      .sort()
      .join(' '),
  ])

const readme = `# api-enhanced 接口索引

**粗略索引，非完整文档。** 完整参数说明 / 调用例子见上游 \`api-enhanced/public/docs/home.md\`。

## 数据来源

| 项 | 值 |
| --- | --- |
| 上游仓库 | \`git@github.com:NeteaseCloudMusicApiEnhanced/api-enhanced.git\` |
| 上游版本 | \`@neteasecloudmusicapienhanced/api@${apiVersion}\` |
| 上游提交 | \`${apiCommit}\` (${apiCommitDate}) |
| 本地路径 | \`api-enhanced/\`（\`pnpm clone:api-enhanced\`） |
| 生成时间 | ${generatedAt} UTC |
| 生成方式 | \`node docs/api-enhanced/generate.mjs\`（纯静态解析，不联网） |

## 目录内容

| 文件 | 说明 |
| --- | --- |
| \`README.md\` | 本文件：字段约定、鉴权模型、统计、按分类索引 |
| \`apis.md\` | 全部 ${stats.total} 个接口的索引表，按分类分组 |
| \`apis.json\` | 同上的机器可读版本（含参数名、checkToken 等明细） |
| \`generate.mjs\` | 生成脚本；上游更新后重跑即可刷新 |

## 字段约定

| 字段 | 含义 |
| --- | --- |
| 路由 | 本地 HTTP 路径，\`module/xxx_yyy.js\` → \`/xxx/yyy\`；\`daily_signin\`/\`fm_trash\`/\`personal_fm\` 为 \`server.js\` 硬编码特例 |
| 模块 | \`module/\` 下文件名（去掉 \`.js\`），也是 Node.js 引入时的导出名（\`main.js\`） |
| 上游 | 转发到的网易云接口路径，取自模块里 \`request('/api/...')\` 的字面量；可能含模板变量或多条子请求 |
| 加密方式 | 请求体的加密/签名方案，取自 \`createOption(query, crypto)\`；模块未显式指定时由 \`util/config.json\` 的 \`APP_CONF.encrypt=true\` 决定，即默认 \`eapi\`。\`-\` 表示该模块压根没走 \`createOption\`（本地计算、走 axios 抓页或纯工具函数），而不是「未知」 |
| 登录 | 是否必须登录。\`是\` = 上游文档明确写了「需要登录 / 登录后调用 / 301」；\`否\` = 文档明确写了「不需要登录」；\`?\` = 文档未标注，**不做猜测**。\`是\` 包含上游自己的表述，如 \`/album/new\` 文档写的就是「登录后调用」 |
| 参数 | \`interface.d.ts\` 中该导出函数的专属参数名（不含 \`RequestBaseConfig\` 通用项）；空 = 只有通用参数 |
| 文档 | 上游 \`public/docs/home.md\` 中对应章节标题；\`-\` 表示文档未覆盖 |

### 通用参数（\`RequestBaseConfig\`，所有接口可用）

| 参数 | 说明 |
| --- | --- |
| \`cookie\` | 凭证字符串或对象，如 \`MUSIC_U=xxx\`（登录接口返回值里的 \`cookie\` 字段） |
| \`realIP\` | 写入 \`X-Real-IP\` / \`X-Forwarded-For\`，用于绕过「460 cheating」等地区限制 |
| \`randomCNIP\` | 随机中国 IP；仅当环境变量 \`ENABLE_RANDOM_CN_IP=true\` 时才不传即默认开启 |
| \`proxy\` | 单次请求代理（支持 PAC 与 http 隧道）；环境变量代理无效 |
| 其他 | \`crypto\`（覆盖加密方式）、\`ua\`、\`domain\`、\`headers\`、\`timeout\`、\`e_r\`（返回值加密）、\`noCookie\`（不向响应写 \`Set-Cookie\`） |

## 鉴权模型

上游没有「是否需登录」的声明式元数据，实际鉴权分三层：

1. **匿名 token**：服务启动时 \`generateConfig()\` 在 \`os.tmpdir()\` 写入 \`anonymous_token\` 与 \`xeapi_public_key\`，\`util/request.js\` 在 require 时同步读取。缺失/过期会报错，重启服务即可刷新。
2. **cookie / \`MUSIC_U\`**：登录接口返回 \`cookie\`（含 \`MUSIC_U\`、\`__csrf\` 等）。服务端模式下由浏览器 cookie 或 \`?cookie=xxx\`（需 \`encodeURIComponent\`）传入；\`main.js\` 在 Node 调用时把 cookie 字符串转成对象。\`__csrf\` 会被填进 \`csrf_token\` 参与 weapi 加密。
3. **游客登录**：\`/register/anonimous\` 可拿游客 cookie，用于规避未登录时的 400 验证错误。

与加密方式的关系：\`weapi\` 走 \`music.163.com/weapi/*\`（带 \`Referer\` + \`csrf_token\`）；\`eapi\`（当前默认）走 \`interfacepc.music.163.com/eapi/*\`；\`xeapi\` 走 \`interface3.music.163.com\`，是「不加密的特殊算法」，主要用于调试加密前的原始参数；\`api\` 为明文（\`interface.music.163.com\`）；\`linuxapi\` 走 \`/api/linux/forward\`。

另有反作弊 token：\`checkToken: 'v2' | 'v3'\` 会实时获取易盾 token 并写入 \`X-antiCheatToken\` 头（\`playlist_subscribe\` 内部强制开启 v2）。

## 统计

- 接口总数 **${stats.total}**，一级分类 **${stats.categories}**
- 文档覆盖 **${stats.documented}** / ${stats.total}（上游文档共 ${stats.docSections} 个章节）
- \`interface.d.ts\` 类型覆盖 **${stats.typed}** / ${stats.total}
- 带 \`checkToken\` **${stats.checkToken}**，需上传（\`multipart/form-data\`）**${stats.upload}**，模块内直接读 \`query.cookie\` **${stats.directCookie}**
- 登录需求：${['yes', 'no', 'unknown']
  .map((k) => `${LOGIN_TEXT[k]} ${loginStats[k] ?? 0}`)
  .join('，')}（\`是\` / \`否\` / \`?\`）
- 加密方式分布：

| 加密方式 | 数量 |
| --- | --- |
${Object.entries(cryptoStats)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

## 局限

- **登录需求仅来自上游文档标注**，覆盖 ${stats.documented} 个接口，其中被标记的只是文档里写了的那部分；其余标 \`?\`，不要当作「不需要登录」。
- 上游接口路径来自源码字面量，模板字符串里的变量不会展开；一个模块可能请求多个上游路径。
- 「参数」只列 \`interface.d.ts\` 里的名字，没有类型与必填信息，以上游文档为准。
- 服务端同时接受 GET / POST；转发给网易云的请求恒为 POST。

## 分类索引

| 分类 | 数量 | 路由 |
| --- | --- | --- |
${catRows.map((r) => '| ' + r.join(' | ') + ' |').join('\n')}
`

/* ---------------------------------------------------------------- apis.md */

const mdRows = (list) =>
  list
    .map(
      (m) =>
        '| ' +
        [
          '`' + m.route + '`',
          '`' + m.identifier + '`',
          cell(m.upstream.map((u) => '`' + u + '`').join('<br>')),
          cell(m.cryptoLabel),
          LOGIN_TEXT[m.login],
          cell(m.params ? m.params.map((p) => '`' + p + '`').join(' ') : '-'),
          cell(m.doc ? m.doc.title : '-'),
          cell(m.description),
        ].join(' | ') +
        ' |',
    )
    .join('\n')

const md = `# api-enhanced 接口索引表

字段含义见 [README.md](./README.md)。登录列 \`?\` = 上游文档未标注，不代表不需要登录。

共 ${stats.total} 个接口，按一级分类分组。

## 目录

${[...categories.keys()].map((c) => `- [${c}](#${c.toLowerCase()}) (${categories.get(c).length})`).join('\n')}

${[...categories.entries()]
  .map(
    ([c, list]) => `## ${c}

| 路由 | 模块 | 上游 | 加密方式 | 登录 | 参数 | 文档 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
${mdRows(list.sort((a, b) => a.route.localeCompare(b.route)))}`,
  )
  .join('\n\n')}
`

/* ---------------------------------------------------------------- 输出 */

fs.writeFileSync(path.join(HERE, 'README.md'), readme)
fs.writeFileSync(path.join(HERE, 'apis.md'), md)
fs.writeFileSync(
  path.join(HERE, 'apis.json'),
  JSON.stringify(
    {
      source: {
        repository: 'git@github.com:NeteaseCloudMusicApiEnhanced/api-enhanced.git',
        version: apiVersion,
        commit: apiCommit,
        commitDate: apiCommitDate,
        generatedAt,
        generator: 'docs/api-enhanced/generate.mjs',
      },
      baseConfig: {
        params: ['cookie', 'realIP', 'randomCNIP', 'proxy'],
        cryptoDefault: 'eapi',
      },
      stats,
      apis: sorted,
    },
    null,
    2,
  ) + '\n',
)

console.log(
  `api-enhanced@${apiVersion} ${apiCommit}: ${stats.total} 接口 / ${stats.categories} 分类 / 文档覆盖 ${stats.documented} / 类型覆盖 ${stats.typed}`,
)
console.log('登录需求：', loginStats)
