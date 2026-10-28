"""管理后台登录 / 退出 / 会话查询接口。"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from api.deps import clear_session_cookie, require_admin, set_session_cookie
from core.config import ADMIN_COOKIE_NAME
from services.auth import LoginError, login, logout

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class SessionOut(BaseModel):
    username: str


@router.post("/login", response_model=SessionOut, summary="管理员登录")
def login_endpoint(payload: LoginRequest, request: Request, response: Response) -> SessionOut:
    # 反向代理（Next rewrite）下直接取 client.host 会得到代理容器 IP，
    # 因此优先使用 X-Forwarded-For 的第一个地址作为限流键。
    forwarded = request.headers.get("x-forwarded-for", "")
    client_key = forwarded.split(",")[0].strip() or (
        request.client.host if request.client else "unknown"
    )
    try:
        token, session = login(payload.username, payload.password, client_key)
    except LoginError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error

    set_session_cookie(response, token)
    return SessionOut(username=session.username)


@router.post("/logout", summary="退出登录")
def logout_endpoint(request: Request, response: Response) -> dict[str, bool]:
    logout(request.cookies.get(ADMIN_COOKIE_NAME))
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/session", response_model=SessionOut, summary="查询当前会话")
def session_endpoint(username: str = Depends(require_admin)) -> SessionOut:
    return SessionOut(username=username)
