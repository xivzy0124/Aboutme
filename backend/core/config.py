"""应用配置：统一从环境变量读取，避免散落在业务代码中。"""

import os
from pathlib import Path

# backend/ 目录，用于拼接默认数据文件路径
BASE_DIR = Path(__file__).resolve().parent.parent

# 配置后 GitHub Search API 配额由 10 次/分钟提升到 30 次/分钟
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# 允许跨域访问的前端地址，多个用英文逗号分隔
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# 数据存储后端：当前只实现 sqlite。
# 迁移 PostgreSQL 时新增对应 repository 实现，并在 repositories 工厂中切换。
DATABASE_BACKEND = os.getenv("DATABASE_BACKEND", "sqlite")


def get_sqlite_path() -> Path:
    """SQLite 文件路径。

    默认存放在 backend/data/ 下；测试通过 SQLITE_PATH 指向临时文件，
    避免污染开发数据。
    """
    raw = os.getenv("SQLITE_PATH")
    if raw:
        return Path(raw).expanduser()
    return BASE_DIR / "data" / "aboutme.db"
