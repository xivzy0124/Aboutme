"""应用配置：统一从环境变量读取，避免散落在业务代码中。"""

import os

# 配置后 GitHub Search API 配额由 10 次/分钟提升到 30 次/分钟
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# 允许跨域访问的前端地址，多个用英文逗号分隔
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
