"""数据访问层工厂：根据配置返回具体实现。

业务层只从 get_project_repository() 拿接口，不关心底层是 SQLite 还是 PostgreSQL。
"""

from core.config import DATABASE_BACKEND
from repositories.base import ProjectRepository
from repositories.sqlite_project_repository import SqliteProjectRepository


def get_project_repository() -> ProjectRepository:
    if DATABASE_BACKEND == "sqlite":
        return SqliteProjectRepository()

    raise RuntimeError(f"暂不支持的数据存储后端：{DATABASE_BACKEND}")
