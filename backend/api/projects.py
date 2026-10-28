"""项目 REST 接口。

只负责 HTTP 协议转换：参数校验在 schema 层，业务逻辑在 service 层。
"""

from fastapi import APIRouter, HTTPException

from schemas.project import ProjectCreate, ProjectListResponse, ProjectOut
from services.projects import create_project, get_project, list_projects

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse, summary="项目列表")
def list_projects_endpoint() -> ProjectListResponse:
    records = list_projects()
    return ProjectListResponse(
        items=[ProjectOut.from_record(record) for record in records],
        total=len(records),
    )


@router.post("", response_model=ProjectOut, status_code=201, summary="新增项目")
def create_project_endpoint(payload: ProjectCreate) -> ProjectOut:
    return ProjectOut.from_record(create_project(payload))


@router.get("/{slug}", response_model=ProjectOut, summary="项目详情")
def get_project_endpoint(slug: str) -> ProjectOut:
    record = get_project(slug)
    if record is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return ProjectOut.from_record(record)
