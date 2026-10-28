"""应用入口：只负责实例化、生命周期、中间件与路由装配。"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.admin import router as admin_router
from api.auth import router as auth_router
from api.github import router as github_router
from api.posts import router as posts_router
from api.projects import router as projects_router
from api.system import router as system_router
from core.middleware import setup_cors
from db.bootstrap import initialize_storage


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """启动时建表并按需写入示例数据，后续切换数据库只需替换此处的初始化实现。"""
    initialize_storage()
    yield


app = FastAPI(title="Aboutme Backend", lifespan=lifespan)

setup_cors(app)

app.include_router(system_router)
app.include_router(github_router)
app.include_router(projects_router)
app.include_router(posts_router)
app.include_router(auth_router)
app.include_router(admin_router)
