"""应用中间件注册。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import CORS_ORIGINS


def setup_cors(app: FastAPI) -> None:
    """注册跨域中间件，供独立部署的前端调用。

    前端默认通过 Next 的 /api 反向代理同源访问，这里保留 CORS 以支持前后端
    分域部署；开启 allow_credentials 后必须使用明确的 origin 列表。
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
