"""应用入口：只负责实例化、中间件与路由装配。"""

from fastapi import FastAPI

from api.github import router as github_router
from api.system import router as system_router
from core.middleware import setup_cors

app = FastAPI(title="Aboutme Backend")

setup_cors(app)

app.include_router(system_router)
app.include_router(github_router)
