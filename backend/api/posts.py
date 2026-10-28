"""文章公开读接口：博客列表与详情。

写操作全部在 /api/admin 下，需要管理员会话。
"""

from fastapi import APIRouter, HTTPException

from schemas.post import PostListResponse, PostOut
from services.posts import get_post, list_posts

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("", response_model=PostListResponse, summary="文章列表")
def list_posts_endpoint() -> PostListResponse:
    records = list_posts()
    return PostListResponse(
        items=[PostOut.from_record(record) for record in records],
        total=len(records),
    )


@router.get("/{slug}", response_model=PostOut, summary="文章详情")
def get_post_endpoint(slug: str) -> PostOut:
    record = get_post(slug)
    if record is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return PostOut.from_record(record)
