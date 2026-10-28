"""数据访问层的抽象定义。

Service / API 只依赖 ProjectRepository 与领域对象；
SQLite 只是当前实现，后续迁移 PostgreSQL 时无需触碰业务代码。
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ProjectRecord:
    """从存储层读出的完整项目实体。"""

    id: int
    slug: str
    title: str
    role: str
    period: str
    description: str
    highlights: list[str]
    tags: list[str]
    url: str | None
    repo_url: str | None
    created_at: datetime


@dataclass(frozen=True)
class ProjectDraft:
    """待写入的项目（尚未生成主键）。"""

    slug: str
    title: str
    role: str
    period: str
    description: str
    highlights: list[str]
    tags: list[str]
    created_at: datetime
    url: str | None = None
    repo_url: str | None = None


class SlugConflictError(Exception):
    """slug 已存在；由存储实现抛出，service 负责重新生成。"""


class ProjectRepository(ABC):
    """项目数据访问接口：上层只调用这些方法。"""

    @abstractmethod
    def list(self) -> list[ProjectRecord]:
        """按创建时间倒序返回全部项目。"""

    @abstractmethod
    def get_by_slug(self, slug: str) -> ProjectRecord | None:
        """按 slug 查询单个项目，不存在时返回 None。"""

    @abstractmethod
    def create(self, draft: ProjectDraft) -> ProjectRecord:
        """写入项目并返回带主键的实体。"""

    @abstractmethod
    def count(self) -> int:
        """返回项目总数，用于首次启动判断是否需要写入示例数据。"""
