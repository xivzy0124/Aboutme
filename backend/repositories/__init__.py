"""数据访问层工厂：根据配置返回具体实现。

业务层只从这些工厂函数拿接口，不关心底层是 SQLite 还是 PostgreSQL。
迁移数据库时新增实现并在这里切换即可。
"""

from core.config import DATABASE_BACKEND
from repositories.base import PostRepository, ProjectRepository, SessionRepository
from repositories.sqlite_post_repository import SqlitePostRepository
from repositories.sqlite_project_repository import SqliteProjectRepository
from repositories.sqlite_session_repository import SqliteSessionRepository


def _ensure_supported() -> None:
    if DATABASE_BACKEND != "sqlite":
        raise RuntimeError(f"暂不支持的数据存储后端：{DATABASE_BACKEND}")


def get_project_repository() -> ProjectRepository:
    _ensure_supported()
    return SqliteProjectRepository()


def get_post_repository() -> PostRepository:
    _ensure_supported()
    return SqlitePostRepository()


def get_session_repository() -> SessionRepository:
    _ensure_supported()
    return SqliteSessionRepository()
