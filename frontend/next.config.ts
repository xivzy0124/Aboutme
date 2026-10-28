import type { NextConfig } from "next";

/** 后端地址：容器内用服务名，宿主机开发默认 localhost。 */
const apiBase = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  /* dev server 以 localhost 启动，宿主机常用 127.0.0.1 访问，需放行该来源的 dev 资源，否则客户端脚本被拦截、页面无法水合 */
  allowedDevOrigins: ["127.0.0.1"],

  /* 同源反向代理：浏览器只访问 /api/*，由 Next 转发到后端。
     这样管理后台的 HttpOnly 会话 Cookie 不需要跨端口/跨站，部署时同一域名即可。 */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiBase}/api/:path*` }];
  },
};

export default nextConfig;
