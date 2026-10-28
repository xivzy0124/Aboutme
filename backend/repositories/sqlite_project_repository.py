"""SQLite 版项目仓储：只负责 SQL 与行到领域对象的转换。"""

import json
import sqlite3

from db.database import SqliteDatabase
from repositories.base import (
    ProjectDraft,
    ProjectRecord,
    ProjectRepository,
    SlugConflictError,
)

_COLUMNS = "id, slug, title, role, period, description, highlights, tags, url, repo_url, created_at"


def _row_to_record(row: sqlite3.Row) -> ProjectRecord:
    return ProjectRecord(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        role=row["role"],
        period=row["period"],
        description=row["description"],
        highlights=json.loads(row["highlights"]),
        tags=json.loads(row["tags"]),
        url=row["url"],
        repo_url=row["repo_url"],
        created_at=row["created_at"],
    )


class SqliteProjectRepository(ProjectRepository):
    def __init__(self, database: SqliteDatabase | None = None) -> None:
        self._database = database or SqliteDatabase()

    def list(self) -> list[ProjectRecord]:
        with self._database.connect() as connection:
            rows = connection.execute(
                f"SELECT {_COLUMNS} FROM projects ORDER BY created_at DESC, id DESC"
            ).fetchall()
        return [_row_to_record(row) for row in rows]

    def get_by_slug(self, slug: str) -> ProjectRecord | None:
        with self._database.connect() as connection:
            row = connection.execute(
                f"SELECT {_COLUMNS} FROM projects WHERE slug = ?", (slug,)
            ).fetchone()
        return _row_to_record(row) if row else None

    def create(self, draft: ProjectDraft) -> ProjectRecord:
        try:
            with self._database.connect() as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO projects
                        (slug, title, role, period, description, highlights, tags, url, repo_url, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        draft.slug,
                        draft.title,
                        draft.role,
                        draft.period,
                        draft.description,
                        json.dumps(draft.highlights, ensure_ascii=False),
                        json.dumps(draft.tags, ensure_ascii=False),
                        draft.url,
                        draft.repo_url,
                        draft.created_at.isoformat(),
                    ),
                )
                row = connection.execute(
                    f"SELECT {_COLUMNS} FROM projects WHERE id = ?", (cursor.lastrowid,)
                ).fetchone()
        except sqlite3.IntegrityError as error:
            # slug 唯一约束冲突时转换成领域异常，便于 service 层重试
            raise SlugConflictError(draft.slug) from error

        return _row_to_record(row)

    def update(self, slug: str, draft: ProjectDraft) -> ProjectRecord | None:
        """覆盖项目内容；slug 与创建时间保持不变，用于后台编辑。"""
        with self._database.connect() as connection:
            connection.execute(
                """
                UPDATE projects
                SET title = ?, role = ?, period = ?, description = ?,
                    highlights = ?, tags = ?, url = ?, repo_url = ?
                WHERE slug = ?
                """,
                (
                    draft.title,
                    draft.role,
                    draft.period,
                    draft.description,
                    json.dumps(draft.highlights, ensure_ascii=False),
                    json.dumps(draft.tags, ensure_ascii=False),
                    draft.url,
                    draft.repo_url,
                    slug,
                ),
            )
            row = connection.execute(
                f"SELECT {_COLUMNS} FROM projects WHERE slug = ?", (slug,)
            ).fetchone()
        return _row_to_record(row) if row else None

    def delete(self, slug: str) -> bool:
        with self._database.connect() as connection:
            cursor = connection.execute("DELETE FROM projects WHERE slug = ?", (slug,))
        return cursor.rowcount > 0

    def count(self) -> int:
        with self._database.connect() as connection:
            return int(connection.execute("SELECT COUNT(*) FROM projects").fetchone()[0])
