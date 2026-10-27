"""GitHub 热门项目业务逻辑。

GitHub 没有公开的 Trending API，这里使用官方 Search API 近似：
按「创建时间 >= 起始时间」筛选仓库，再按 star 数降序取前十。

- 日榜：最近 1 天创建的仓库
- 周榜：最近 7 天创建的仓库
- 月榜：最近 30 天创建的仓库

结果在内存中缓存，避免触发 GitHub Search API 限流。
"""

from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException

from core.config import GITHUB_TOKEN
from schemas.github import Period, TrendingRepo, TrendingResponse

GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"
TOP_N = 10
REQUEST_TIMEOUT = 10.0

PERIOD_DAYS: dict[Period, int] = {"daily": 1, "weekly": 7, "monthly": 30}
CACHE_TTL_SECONDS: dict[Period, int] = {"daily": 300, "weekly": 900, "monthly": 1800}

# period -> (缓存写入时间, 响应体)
_cache: dict[Period, tuple[float, TrendingResponse]] = {}


def _request_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "aboutme-backend",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def _build_repo(raw: dict, rank: int) -> TrendingRepo:
    owner = raw.get("owner") or {}
    return TrendingRepo(
        rank=rank,
        full_name=raw["full_name"],
        name=raw["name"],
        owner=owner.get("login", ""),
        owner_avatar_url=owner.get("avatar_url"),
        description=raw.get("description"),
        html_url=raw["html_url"],
        language=raw.get("language"),
        stars=raw.get("stargazers_count", 0),
        forks=raw.get("forks_count", 0),
        topics=raw.get("topics") or [],
        created_at=raw["created_at"],
        updated_at=raw["updated_at"],
    )


async def fetch_trending(period: Period) -> TrendingResponse:
    """按周期返回最热的十个仓库，命中缓存时直接返回。"""
    cached = _cache.get(period)
    if cached and time.monotonic() - cached[0] < CACHE_TTL_SECONDS[period]:
        return cached[1]

    since = (datetime.now(timezone.utc) - timedelta(days=PERIOD_DAYS[period])).replace(
        microsecond=0
    )
    params = {
        "q": f"created:>={since.strftime('%Y-%m-%dT%H:%M:%SZ')}",
        "sort": "stars",
        "order": "desc",
        "per_page": TOP_N,
    }

    try:
        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT, headers=_request_headers()
        ) as client:
            response = await client.get(GITHUB_SEARCH_URL, params=params)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status in (403, 429):
            detail = "GitHub API 访问频率受限，请稍后重试或配置 GITHUB_TOKEN 环境变量"
        else:
            detail = f"GitHub API 请求失败（HTTP {status}）"
        raise HTTPException(status_code=502, detail=detail) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="无法连接 GitHub API") from exc

    result = TrendingResponse(
        period=period,
        since=since,
        fetched_at=datetime.now(timezone.utc),
        items=[
            _build_repo(raw, index + 1)
            for index, raw in enumerate(response.json().get("items", []))
        ],
    )
    _cache[period] = (time.monotonic(), result)
    return result
