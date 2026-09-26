import { startServer } from "../src/elysia";

// 监听地址与端口默认取 HOST / PORT 环境变量（缺省 127.0.0.1:3000）。
const token = process.env.TOKEN;
const { url } = startServer({
  cors: { origin: true },
  ...(token !== undefined ? { auth: { token } } : {}),
});

console.log(`Cecilia Elysia 服务器已启动：${url}`);
