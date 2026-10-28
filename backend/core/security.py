"""管理后台鉴权的基础能力。

- 密码：scrypt 加盐哈希，比对使用常量时间比较，避免时序侧信道；
- 会话令牌：随机 32 字节，数据库只保存 SHA-256 摘要，即使库文件泄露也无法复用令牌。
"""

import hashlib
import hmac
import secrets

from core.config import ADMIN_PASSWORD

# 进程启动时随机生成盐；单实例部署下无需持久化，登录时用同一份盐重新计算
_SALT = secrets.token_bytes(16)

_SCRYPT_PARAMS = {"n": 2**14, "r": 8, "p": 1, "dklen": 32}

_PASSWORD_HASH = hashlib.scrypt(ADMIN_PASSWORD.encode("utf-8"), salt=_SALT, **_SCRYPT_PARAMS)


def verify_password(password: str) -> bool:
    """校验明文口令是否与配置中的管理员口令一致。"""
    candidate = hashlib.scrypt(password.encode("utf-8"), salt=_SALT, **_SCRYPT_PARAMS)
    return hmac.compare_digest(candidate, _PASSWORD_HASH)


def hash_token(token: str) -> str:
    """会话令牌入库前统一做摘要，避免明文令牌落库。"""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_session_token() -> str:
    """生成新的随机会话令牌（Cookie 中携带的值）。"""
    return secrets.token_urlsafe(32)
