"""鉴权相关的 FastAPI 依赖：会话校验、Cookie 读写与来源校验。

所有写操作路由都挂 require_admin + require_same_origin，
未登录返回 401，来源不可信返回 403。
"""

from fastapi import HTTPException, Request, Response

from core.config import (
    ADMIN_COOKIE_NAME,
    ADMIN_COOKIE_SECURE,
    ADMIN_SESSION_SLIDING_SECONDS,
    CORS_ORIGINS,
)
from services.auth import validate_session


def set_session_cookie(response: Response, token: str) -> None:
    """写入会话 Cookie：HttpOnly 防 XSS 窃取，SameSite=Strict 防 CSRF。"""
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        max_age=ADMIN_SESSION_SLIDING_SECONDS,
        httponly=True,
        samesite="strict",
        secure=ADMIN_COOKIE_SECURE,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=ADMIN_COOKIE_NAME,
        httponly=True,
        samesite="strict",
        secure=ADMIN_COOKIE_SECURE,
        path="/",
    )


def require_admin(request: Request, response: Response) -> str:
    """校验管理后台会话；通过后顺带刷新 Cookie 的 Max-Age。"""
    token = request.cookies.get(ADMIN_COOKIE_NAME)
    session = validate_session(token)
    if session is None:
        raise HTTPException(status_code=401, detail="未登录或登录已过期")
    if token:
        set_session_cookie(response, token)
    return session.username


def require_same_origin(request: Request) -> None:
    """拒绝来源不可信的写请求，作为 SameSite 之外的额外防线。"""
    origin = request.headers.get("origin") or request.headers.get("referer")
    if not origin:
        # 非浏览器客户端（curl / 测试）不带 Origin，此处放行由会话校验兜底
        return
    if not any(origin == allowed or origin.startswith(f"{allowed}/") for allowed in CORS_ORIGINS):
        raise HTTPException(status_code=403, detail="请求来源不被允许")
