"""文章接口的请求 / 响应模型与字段校验。

校验规则与项目接口保持一致，集中在这里，路由层不再重复判断。
"""

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from repositories.base import PostRecord

_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PostCreate(BaseModel):
    """新增 / 编辑文章请求体；slug 留空时由服务端按标题生成。"""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=2, max_length=80, description="文章标题")
    slug: str | None = Field(default=None, max_length=80, description="文章路径，留空自动生成")
    summary: str = Field(min_length=10, max_length=300, description="文章摘要")
    content: str = Field(min_length=1, max_length=20000, description="正文，按空行分段")
    tags: list[str] = Field(default_factory=list, max_length=8, description="文章标签")
    published_at: str = Field(description="发布日期，格式 YYYY-MM-DD")

    @field_validator("slug")
    @classmethod
    def _normalize_slug(cls, slug: str | None) -> str | None:
        if slug is None or not slug.strip():
            return None
        value = slug.strip().lower()
        if not _SLUG_PATTERN.match(value):
            raise ValueError("路径只能包含小写字母、数字与连字符")
        return value

    @field_validator("published_at")
    @classmethod
    def _validate_published_at(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as error:
            raise ValueError("发布日期格式应为 YYYY-MM-DD") from error
        return value

    @field_validator("tags")
    @classmethod
    def _normalize_tags(cls, tags: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in tags:
            value = tag.strip()
            if not value:
                continue
            if len(value) > 24:
                raise ValueError("单个标签不能超过 24 个字符")
            if value not in cleaned:
                cleaned.append(value)
        return cleaned


class PostOut(BaseModel):
    """文章响应体。"""

    id: int
    slug: str
    title: str
    summary: str
    content: str
    tags: list[str]
    published_at: str
    created_at: datetime

    @classmethod
    def from_record(cls, record: PostRecord) -> "PostOut":
        return cls(
            id=record.id,
            slug=record.slug,
            title=record.title,
            summary=record.summary,
            content=record.content,
            tags=record.tags,
            published_at=record.published_at,
            created_at=record.created_at,
        )


class PostListResponse(BaseModel):
    """文章列表响应体。"""

    items: list[PostOut]
    total: int
