"""管理后台鉴权业务逻辑：登录限流、会话签发、滑动续期与吊销。"""

import time
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from core.config import (
    ADMIN_LOGIN_MAX_FAILURES,
    ADMIN_LOGIN_WINDOW_SECONDS,
    ADMIN_SESSION_ABSOLUTE_SECONDS,
    ADMIN_SESSION_SLIDING_SECONDS,
    ADMIN_USERNAME,
)
from core.security import hash_token, new_session_token, verify_password
from repositories import get_session_repository
from repositories.base import SessionRecord


class LoginError(Exception):
    """登录失败；消息可直接展示给用户，不区分账号或密码错误以免泄露信息。"""


# 仅保存在进程内存中的失败计数：单实例部署足够；多实例可换成 Redis
_failures: dict[str, list[float]] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _prune_failures(client_key: str, now_ts: float) -> list[float]:
    recent = [ts for ts in _failures.get(client_key, []) if now_ts - ts < ADMIN_LOGIN_WINDOW_SECONDS]
    _failures[client_key] = recent
    return recent


def login(username: str, password: str, client_key: str) -> tuple[str, SessionRecord]:
    """校验账号口令并创建会话，返回明文令牌与会话记录。"""
    now_ts = time.time()
    recent = _prune_failures(client_key, now_ts)
    if len(recent) >= ADMIN_LOGIN_MAX_FAILURES:
        raise LoginError(
            f"登录尝试次数过多，请 {ADMIN_LOGIN_WINDOW_SECONDS // 60} 分钟后再试"
        )

    if username != ADMIN_USERNAME or not verify_password(password):
        _failures.setdefault(client_key, []).append(now_ts)
        raise LoginError("用户名或密码错误")

    _failures.pop(client_key, None)

    repository = get_session_repository()
    now = _now()
    repository.prune(now)

    token = new_session_token()
    record = SessionRecord(
        token_hash=hash_token(token),
        username=username,
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(seconds=ADMIN_SESSION_SLIDING_SECONDS),
    )
    repository.create(record)
    return token, record


def logout(token: str | None) -> None:
    if token:
        get_session_repository().delete(hash_token(token))


def validate_session(token: str | None) -> SessionRecord | None:
    """校验会话并做滑动续期；过期或超过绝对上限时直接吊销。"""
    if not token:
        return None

    repository = get_session_repository()
    record = repository.get(hash_token(token))
    if record is None:
        return None

    now = _now()
    absolute_deadline = record.created_at + timedelta(seconds=ADMIN_SESSION_ABSOLUTE_SECONDS)
    if now >= record.expires_at or now >= absolute_deadline:
        repository.delete(record.token_hash)
        return None

    expires_at = min(
        now + timedelta(seconds=ADMIN_SESSION_SLIDING_SECONDS),
        absolute_deadline,
    )
    repository.touch(record.token_hash, now, expires_at)
    return replace(record, last_seen_at=now, expires_at=expires_at)
