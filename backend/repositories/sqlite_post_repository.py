"""SQLite 版文章仓储。"""

import json
import sqlite3
from datetime import datetime

from db.database import SqliteDatabase
from repositories.base import PostDraft, PostRecord, PostRepository, SlugConflictError

_COLUMNS = "id, slug, title, summary, content, tags, published_at, created_at"


def _row_to_record(row: sqlite3.Row) -> PostRecord:
    return PostRecord(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        summary=row["summary"],
        content=row["content"],
        tags=json.loads(row["tags"]),
        published_at=row["published_at"],
        created_at=datetime.fromisoformat(row["created_at"]),
    )


class SqlitePostRepository(PostRepository):
    def __init__(self, database: SqliteDatabase | None = None) -> None:
        self._database = database or SqliteDatabase()

    def list(self) -> list[PostRecord]:
        with self._database.connect() as connection:
            rows = connection.execute(
                f"SELECT {_COLUMNS} FROM posts ORDER BY published_at DESC, id DESC"
            ).fetchall()
        return [_row_to_record(row) for row in rows]

    def get_by_slug(self, slug: str) -> PostRecord | None:
        with self._database.connect() as connection:
            row = connection.execute(
                f"SELECT {_COLUMNS} FROM posts WHERE slug = ?", (slug,)
            ).fetchone()
        return _row_to_record(row) if row else None

    def create(self, draft: PostDraft) -> PostRecord:
        try:
            with self._database.connect() as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO posts
                        (slug, title, summary, content, tags, published_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        draft.slug,
                        draft.title,
                        draft.summary,
                        draft.content,
                        json.dumps(draft.tags, ensure_ascii=False),
                        draft.published_at,
                        draft.created_at.isoformat(),
                    ),
                )
                row = connection.execute(
                    f"SELECT {_COLUMNS} FROM posts WHERE id = ?", (cursor.lastrowid,)
                ).fetchone()
        except sqlite3.IntegrityError as error:
            raise SlugConflictError(draft.slug) from error

        return _row_to_record(row)

    def update(self, slug: str, draft: PostDraft) -> PostRecord | None:
        """覆盖文章内容；slug 保持不变，避免已发布链接失效。"""
        with self._database.connect() as connection:
            connection.execute(
                """
                UPDATE posts
                SET title = ?, summary = ?, content = ?, tags = ?, published_at = ?
                WHERE slug = ?
                """,
                (
                    draft.title,
                    draft.summary,
                    draft.content,
                    json.dumps(draft.tags, ensure_ascii=False),
                    draft.published_at,
                    slug,
                ),
            )
            row = connection.execute(
                f"SELECT {_COLUMNS} FROM posts WHERE slug = ?", (slug,)
            ).fetchone()
        return _row_to_record(row) if row else None

    def delete(self, slug: str) -> bool:
        with self._database.connect() as connection:
            cursor = connection.execute("DELETE FROM posts WHERE slug = ?", (slug,))
        return cursor.rowcount > 0

    def count(self) -> int:
        with self._database.connect() as connection:
            return int(connection.execute("SELECT COUNT(*) FROM posts").fetchone()[0])
