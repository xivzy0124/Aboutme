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

# ---------------------------------------------------------------------------
# 管理后台鉴权
# 预置固定账号；密码只以 scrypt 哈希形式参与比较，不会写入数据库或日志。
# 生产环境应通过 ADMIN_PASSWORD 覆盖默认口令。
# ---------------------------------------------------------------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "xivzy")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "9500772")

ADMIN_COOKIE_NAME = os.getenv("ADMIN_COOKIE_NAME", "aboutme_admin")
# 本地是 http，需关闭 Secure；生产（HTTPS）应设置 ADMIN_COOKIE_SECURE=true
ADMIN_COOKIE_SECURE = os.getenv("ADMIN_COOKIE_SECURE", "false").lower() == "true"

# 会话有效期：滑动续期（有操作则延长）+ 绝对上限（超过必须重新登录）
ADMIN_SESSION_SLIDING_SECONDS = int(os.getenv("ADMIN_SESSION_SLIDING_SECONDS", str(2 * 60 * 60)))
ADMIN_SESSION_ABSOLUTE_SECONDS = int(os.getenv("ADMIN_SESSION_ABSOLUTE_SECONDS", str(12 * 60 * 60)))

# 登录失败限流：窗口内达到次数即锁定
ADMIN_LOGIN_MAX_FAILURES = int(os.getenv("ADMIN_LOGIN_MAX_FAILURES", "5"))
ADMIN_LOGIN_WINDOW_SECONDS = int(os.getenv("ADMIN_LOGIN_WINDOW_SECONDS", str(15 * 60)))


def get_sqlite_path() -> Path:
    """SQLite 文件路径。

    默认存放在 backend/data/ 下；测试通过 SQLITE_PATH 指向临时文件，
    避免污染开发数据。
    """
    raw = os.getenv("SQLITE_PATH")
    if raw:
        return Path(raw).expanduser()
    return BASE_DIR / "data" / "aboutme.db"
