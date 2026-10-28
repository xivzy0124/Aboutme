"""文章业务逻辑：slug 生成、读写编排，隔离 API 与存储实现。"""

import re
import secrets
from dataclasses import replace
from datetime import datetime, timezone

from repositories import get_post_repository
from repositories.base import PostDraft, PostRecord, SlugConflictError
from schemas.post import PostCreate

_SLUG_RETRY_LIMIT = 3


def list_posts() -> list[PostRecord]:
    """按发布时间倒序返回文章列表。"""
    return get_post_repository().list()


def get_post(slug: str) -> PostRecord | None:
    return get_post_repository().get_by_slug(slug)


def create_post(payload: PostCreate) -> PostRecord:
    """新增文章：优先使用指定 slug，否则按标题生成唯一 slug。"""
    repository = get_post_repository()
    draft = PostDraft(
        slug=payload.slug or "",
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        tags=payload.tags,
        published_at=payload.published_at,
        created_at=datetime.now(timezone.utc),
    )

    for attempt in range(_SLUG_RETRY_LIMIT):
        current = replace(draft, slug=draft.slug or _build_slug(payload.title))
        try:
            return repository.create(current)
        except SlugConflictError:
            # 用户指定的 slug 已存在属于冲突而非碰撞，直接报错
            if payload.slug:
                raise ValueError(f"路径 {payload.slug} 已被占用") from None
            if attempt == _SLUG_RETRY_LIMIT - 1:
                break

    raise RuntimeError("生成唯一 slug 失败，请稍后重试")


def update_post(slug: str, payload: PostCreate) -> PostRecord | None:
    """按 slug 更新文章，slug 本身不随编辑变化。"""
    current = get_post_repository().get_by_slug(slug)
    if current is None:
        return None

    draft = PostDraft(
        slug=current.slug,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        tags=payload.tags,
        published_at=payload.published_at,
        created_at=current.created_at,
    )
    return get_post_repository().update(slug, draft)


def delete_post(slug: str) -> bool:
    return get_post_repository().delete(slug)


def _build_slug(title: str) -> str:
    """拉丁标题直接复用；纯中文标题回退到 post-随机后缀。"""
    ascii_part = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{ascii_part or 'post'}-{secrets.token_hex(2)}"
