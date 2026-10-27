"""GitHub 热门项目相关的响应模型。"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

Period = Literal["daily", "weekly", "monthly"]


class TrendingRepo(BaseModel):
    rank: int
    full_name: str
    name: str
    owner: str
    owner_avatar_url: str | None
    description: str | None
    html_url: str
    language: str | None
    stars: int
    forks: int
    topics: list[str]
    created_at: datetime
    updated_at: datetime


class TrendingResponse(BaseModel):
    period: Period
    since: datetime
    fetched_at: datetime
    items: list[TrendingRepo]
