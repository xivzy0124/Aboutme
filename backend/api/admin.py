"""管理后台写接口：项目与文章的编辑、删除。

整个路由统一挂会话校验与来源校验，未登录一律 401。
"""

from fastapi import APIRouter, Depends, HTTPException, Response

from api.deps import require_admin, require_same_origin
from schemas.post import PostCreate, PostOut
from schemas.project import ProjectCreate, ProjectOut
from services.posts import create_post, delete_post, update_post
from services.projects import delete_project, update_project

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin), Depends(require_same_origin)],
)


@router.put("/projects/{slug}", response_model=ProjectOut, summary="编辑项目")
def update_project_endpoint(slug: str, payload: ProjectCreate) -> ProjectOut:
    record = update_project(slug, payload)
    if record is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return ProjectOut.from_record(record)


@router.delete("/projects/{slug}", status_code=204, summary="删除项目")
def delete_project_endpoint(slug: str) -> Response:
    if not delete_project(slug):
        raise HTTPException(status_code=404, detail="项目不存在")
    return Response(status_code=204)


@router.post("/posts", response_model=PostOut, status_code=201, summary="新增文章")
def create_post_endpoint(payload: PostCreate) -> PostOut:
    try:
        return PostOut.from_record(create_post(payload))
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.put("/posts/{slug}", response_model=PostOut, summary="编辑文章")
def update_post_endpoint(slug: str, payload: PostCreate) -> PostOut:
    record = update_post(slug, payload)
    if record is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return PostOut.from_record(record)


@router.delete("/posts/{slug}", status_code=204, summary="删除文章")
def delete_post_endpoint(slug: str) -> Response:
    if not delete_post(slug):
        raise HTTPException(status_code=404, detail="文章不存在")
    return Response(status_code=204)
