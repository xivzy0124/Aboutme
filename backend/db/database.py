"""SQLite 连接与表结构初始化。

这一层是唯一知道 SQLite 文件位置与 DDL 的地方；
service / api 只通过 repositories 的抽象接口访问数据，
后续迁移到 PostgreSQL 时新增实现并在工厂中切换即可，无需改动上层。
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from core.config import get_sqlite_path

SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT NOT NULL,
    tags TEXT NOT NULL,
    url TEXT,
    repo_url TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
    ON projects (created_at DESC);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL,
    published_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_published_at
    ON posts (published_at DESC);

-- 管理后台会话：只保存令牌摘要，过期会话由服务端校验时清理
CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
    ON admin_sessions (expires_at);
"""


class SqliteDatabase:
    """SQLite 连接管理：每次操作使用独立连接，并显式提交 / 回滚。"""

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or get_sqlite_path()

    def initialize(self) -> None:
        """创建数据目录与表结构，可重复执行（IF NOT EXISTS）。"""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript(SCHEMA)

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            # WAL 提升读写并发；busy_timeout 避免短事务之间直接抛锁冲突
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA busy_timeout = 5000")
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()
