"""系统基础路由。"""

from fastapi import APIRouter

router = APIRouter(tags=["system"])


@router.get("/")
def hello_world() -> dict[str, str]:
    return {"message": "Hello World"}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
