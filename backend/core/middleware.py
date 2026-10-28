"""应用中间件注册。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import CORS_ORIGINS


def setup_cors(app: FastAPI) -> None:
    """注册跨域中间件，供独立部署的前端调用。"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
