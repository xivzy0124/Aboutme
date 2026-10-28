"""项目业务逻辑：生成 slug、组装写入数据，隔离 API 与具体存储实现。"""

import re
import secrets
from dataclasses import replace
from datetime import datetime, timezone

from repositories import get_project_repository
from repositories.base import ProjectDraft, ProjectRecord, SlugConflictError
from schemas.project import ProjectCreate

# slug 冲突时重新生成的最大次数（随机后缀碰撞概率极低，这里只做兜底）
_SLUG_RETRY_LIMIT = 3


def list_projects() -> list[ProjectRecord]:
    """按创建时间倒序返回项目列表。"""
    return get_project_repository().list()


def get_project(slug: str) -> ProjectRecord | None:
    """按 slug 读取单个项目。"""
    return get_project_repository().get_by_slug(slug)


def create_project(payload: ProjectCreate) -> ProjectRecord:
    """新增项目：生成唯一 slug 后写入存储层。"""
    repository = get_project_repository()
    draft = ProjectDraft(
        slug="",
        title=payload.title,
        role=payload.role,
        period=payload.period,
        description=payload.description,
        highlights=payload.highlights,
        tags=payload.tags,
        created_at=datetime.now(timezone.utc),
        url=str(payload.url) if payload.url else None,
        repo_url=str(payload.repo_url) if payload.repo_url else None,
    )

    for _ in range(_SLUG_RETRY_LIMIT):
        current = replace(draft, slug=_build_slug(payload.title))
        try:
            return repository.create(current)
        except SlugConflictError:
            continue

    raise RuntimeError("生成唯一 slug 失败，请稍后重试")


def update_project(slug: str, payload: ProjectCreate) -> ProjectRecord | None:
    """按 slug 更新项目；slug 与创建时间保持不变，避免已分享链接失效。"""
    repository = get_project_repository()
    existing = repository.get_by_slug(slug)
    if existing is None:
        return None

    draft = ProjectDraft(
        slug=existing.slug,
        title=payload.title,
        role=payload.role,
        period=payload.period,
        description=payload.description,
        highlights=payload.highlights,
        tags=payload.tags,
        created_at=existing.created_at,
        url=str(payload.url) if payload.url else None,
        repo_url=str(payload.repo_url) if payload.repo_url else None,
    )
    return repository.update(slug, draft)


def delete_project(slug: str) -> bool:
    return get_project_repository().delete(slug)


def _build_slug(title: str) -> str:
    """优先复用标题中的拉丁字符；纯中文标题回退到 project-随机后缀。"""
    ascii_part = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{ascii_part or 'project'}-{secrets.token_hex(2)}"
