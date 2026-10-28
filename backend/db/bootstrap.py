"""数据库初始化：建表 + 首次写入示例数据。"""

from db.database import SqliteDatabase
from db.seed import seed_default_posts, seed_default_projects


def initialize_storage() -> None:
    """应用启动时调用；重复执行安全。"""
    SqliteDatabase().initialize()
    seed_default_projects()
    seed_default_posts()
