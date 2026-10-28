"""项目接口的请求 / 响应模型与字段校验。

校验规则集中在这里，路由层不再重复判断；
错误信息使用中文，前端可直接展示。
"""

import re
from datetime import datetime

from pydantic import (
    AnyHttpUrl,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from repositories.base import ProjectRecord

# 周期统一为 YYYY.MM - YYYY.MM，例如 2026.03 - 2026.05
_PERIOD_PATTERN = re.compile(
    r"^(?P<start>\d{4}\.(?:0[1-9]|1[0-2]))\s*-\s*(?P<end>\d{4}\.(?:0[1-9]|1[0-2]))$"
)


class ProjectCreate(BaseModel):
    """新增项目请求体。"""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=2, max_length=80, description="项目名称")
    role: str = Field(min_length=2, max_length=60, description="承担角色")
    period: str = Field(max_length=24, description="周期，格式 YYYY.MM - YYYY.MM")
    description: str = Field(min_length=10, max_length=600, description="项目简介")
    tags: list[str] = Field(min_length=1, max_length=12, description="技术栈标签")
    highlights: list[str] = Field(min_length=1, max_length=8, description="项目亮点")
    url: AnyHttpUrl | None = Field(default=None, description="项目访问地址")
    repo_url: AnyHttpUrl | None = Field(default=None, description="代码仓库地址")

    @field_validator("period")
    @classmethod
    def _normalize_period(cls, period: str) -> str:
        match = _PERIOD_PATTERN.match(period)
        if match is None:
            raise ValueError("周期格式应为 YYYY.MM - YYYY.MM，例如 2026.03 - 2026.05")
        if match.group("end") < match.group("start"):
            raise ValueError("周期结束月份不能早于开始月份")
        return f"{match.group('start')} - {match.group('end')}"

    @field_validator("tags")
    @classmethod
    def _normalize_tags(cls, tags: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in tags:
            value = tag.strip()
            if not value:
                continue
            if len(value) > 24:
                raise ValueError("单个技术标签不能超过 24 个字符")
            if value not in cleaned:
                cleaned.append(value)
        if not cleaned:
            raise ValueError("请至少填写一个技术标签")
        return cleaned

    @field_validator("highlights")
    @classmethod
    def _normalize_highlights(cls, highlights: list[str]) -> list[str]:
        cleaned = [item.strip() for item in highlights if item.strip()]
        if not cleaned:
            raise ValueError("请至少填写一条项目亮点")
        if any(len(item) > 300 for item in cleaned):
            raise ValueError("单条亮点不能超过 300 个字符")
        return cleaned


class ProjectOut(BaseModel):
    """项目响应体。"""

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

    @classmethod
    def from_record(cls, record: ProjectRecord) -> "ProjectOut":
        return cls(
            id=record.id,
            slug=record.slug,
            title=record.title,
            role=record.role,
            period=record.period,
            description=record.description,
            highlights=record.highlights,
            tags=record.tags,
            url=record.url,
            repo_url=record.repo_url,
            created_at=record.created_at,
        )


class ProjectListResponse(BaseModel):
    """项目列表响应体。"""

    items: list[ProjectOut]
    total: int
