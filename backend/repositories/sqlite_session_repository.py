"""SQLite 版管理后台会话仓储。"""

from datetime import datetime

from db.database import SqliteDatabase
from repositories.base import SessionRecord, SessionRepository

_COLUMNS = "token_hash, username, created_at, last_seen_at, expires_at"


def _row_to_record(row) -> SessionRecord:
    return SessionRecord(
        token_hash=row["token_hash"],
        username=row["username"],
        # 统一用带时区的 ISO 字符串存取，读回时还原为 datetime 便于比较
        created_at=datetime.fromisoformat(row["created_at"]),
        last_seen_at=datetime.fromisoformat(row["last_seen_at"]),
        expires_at=datetime.fromisoformat(row["expires_at"]),
    )


class SqliteSessionRepository(SessionRepository):
    def __init__(self, database: SqliteDatabase | None = None) -> None:
        self._database = database or SqliteDatabase()

    def create(self, record: SessionRecord) -> None:
        with self._database.connect() as connection:
            connection.execute(
                f"INSERT INTO admin_sessions ({_COLUMNS}) VALUES (?, ?, ?, ?, ?)",
                (
                    record.token_hash,
                    record.username,
                    record.created_at.isoformat(),
                    record.last_seen_at.isoformat(),
                    record.expires_at.isoformat(),
                ),
            )

    def get(self, token_hash: str) -> SessionRecord | None:
        with self._database.connect() as connection:
            row = connection.execute(
                f"SELECT {_COLUMNS} FROM admin_sessions WHERE token_hash = ?", (token_hash,)
            ).fetchone()
        return _row_to_record(row) if row else None

    def touch(self, token_hash: str, last_seen_at: datetime, expires_at: datetime) -> None:
        with self._database.connect() as connection:
            connection.execute(
                "UPDATE admin_sessions SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?",
                (last_seen_at.isoformat(), expires_at.isoformat(), token_hash),
            )

    def delete(self, token_hash: str) -> None:
        with self._database.connect() as connection:
            connection.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash,))

    def prune(self, now: datetime) -> None:
        with self._database.connect() as connection:
            connection.execute(
                "DELETE FROM admin_sessions WHERE expires_at <= ?", (now.isoformat(),)
            )
