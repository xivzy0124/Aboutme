"""数据访问层的抽象定义。

Service / API 只依赖这里的仓库接口与领域对象；
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


@dataclass(frozen=True)
class PostRecord:
    """博客文章实体；published_at 使用 YYYY-MM-DD 字符串，便于直接展示与排序。"""

    id: int
    slug: str
    title: str
    summary: str
    content: str
    tags: list[str]
    published_at: str
    created_at: datetime


@dataclass(frozen=True)
class PostDraft:
    """待写入的文章。"""

    slug: str
    title: str
    summary: str
    content: str
    tags: list[str]
    published_at: str
    created_at: datetime


@dataclass(frozen=True)
class SessionRecord:
    """管理后台会话；token_hash 为令牌摘要，明文令牌只存在于 Cookie。"""

    token_hash: str
    username: str
    created_at: datetime
    last_seen_at: datetime
    expires_at: datetime


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
    def update(self, slug: str, draft: ProjectDraft) -> ProjectRecord | None:
        """按 slug 覆盖项目内容（slug 保持不变），不存在时返回 None。"""

    @abstractmethod
    def delete(self, slug: str) -> bool:
        """按 slug 删除项目，返回是否真的删除了记录。"""

    @abstractmethod
    def count(self) -> int:
        """返回项目总数，用于首次启动判断是否需要写入示例数据。"""


class PostRepository(ABC):
    """文章数据访问接口。"""

    @abstractmethod
    def list(self) -> list[PostRecord]:
        """按发布时间倒序返回全部文章。"""

    @abstractmethod
    def get_by_slug(self, slug: str) -> PostRecord | None:
        """按 slug 查询单篇文章。"""

    @abstractmethod
    def create(self, draft: PostDraft) -> PostRecord:
        """写入文章并返回带主键的实体。"""

    @abstractmethod
    def update(self, slug: str, draft: PostDraft) -> PostRecord | None:
        """按 slug 覆盖文章内容（slug 保持不变）。"""

    @abstractmethod
    def delete(self, slug: str) -> bool:
        """按 slug 删除文章。"""

    @abstractmethod
    def count(self) -> int:
        """返回文章总数，用于首次启动判断是否需要写入示例数据。"""


class SessionRepository(ABC):
    """管理后台会话存储接口。"""

    @abstractmethod
    def create(self, record: SessionRecord) -> None:
        """写入新会话。"""

    @abstractmethod
    def get(self, token_hash: str) -> SessionRecord | None:
        """按令牌摘要读取会话。"""

    @abstractmethod
    def touch(self, token_hash: str, last_seen_at: datetime, expires_at: datetime) -> None:
        """更新最近活跃时间与新的过期时间（滑动续期）。"""

    @abstractmethod
    def delete(self, token_hash: str) -> None:
        """删除会话（退出登录或绝对过期）。"""

    @abstractmethod
    def prune(self, now: datetime) -> None:
        """清理已过期会话，避免表无限增长。"""
