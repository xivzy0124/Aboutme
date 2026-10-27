import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* dev server 以 localhost 启动，宿主机常用 127.0.0.1 访问，需放行该来源的 dev 资源，否则客户端脚本被拦截、页面无法水合 */
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
