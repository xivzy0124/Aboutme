"""GitHub 热门项目路由，仅负责接收请求并转交 service 层。"""

from fastapi import APIRouter

from schemas.github import TrendingResponse
from services.github_trending import fetch_trending

router = APIRouter(prefix="/api/github", tags=["github"])


@router.get(
    "/trending/daily",
    response_model=TrendingResponse,
    summary="每日最热十个 GitHub 项目",
)
async def trending_daily() -> TrendingResponse:
    return await fetch_trending("daily")


@router.get(
    "/trending/weekly",
    response_model=TrendingResponse,
    summary="每周最热十个 GitHub 项目",
)
async def trending_weekly() -> TrendingResponse:
    return await fetch_trending("weekly")


@router.get(
    "/trending/monthly",
    response_model=TrendingResponse,
    summary="每月最热十个 GitHub 项目",
)
async def trending_monthly() -> TrendingResponse:
    return await fetch_trending("monthly")
