"""管理后台鉴权与文章管理测试。

覆盖：登录成功 / 失败 / 限流、会话校验与退出、未登录拦截、
文章公开读取与管理员增删改。
"""

import pytest
from fastapi.testclient import TestClient

from main import app
from services import auth as auth_service

ADMIN_CREDENTIALS = {"username": "xivzy", "password": "9500772"}

POST_PAYLOAD = {
    "title": "测试文章 Alpha",
    "summary": "用于验证文章新增、编辑与删除链路的测试数据。",
    "content": "第一段内容。\n\n## 小标题\n\n第二段内容。",
    "tags": ["测试"],
    "published_at": "2026-10-28",
}


@pytest.fixture(autouse=True)
def reset_login_failures():
    """登录失败计数存在进程内存中，用例之间需要清理，避免相互影响。"""
    auth_service._failures.clear()
    yield
    auth_service._failures.clear()


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "admin-test.db"))
    with TestClient(app) as test_client:
        yield test_client


def test_login_success_sets_httponly_cookie(client: TestClient) -> None:
    response = client.post("/api/auth/login", json=ADMIN_CREDENTIALS)

    assert response.status_code == 200
    assert response.json()["username"] == "xivzy"
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie
    assert "SameSite=strict" in cookie.lower() or "samesite=strict" in cookie.lower()

    session = client.get("/api/auth/session")
    assert session.status_code == 200
    assert session.json()["username"] == "xivzy"


def test_login_rejects_wrong_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login", json={"username": "xivzy", "password": "wrong-password"}
    )

    assert response.status_code == 401
    assert client.get("/api/auth/session").status_code == 401


def test_logout_invalidates_session(client: TestClient) -> None:
    client.post("/api/auth/login", json=ADMIN_CREDENTIALS)
    token_cookie = client.cookies.get("aboutme_admin")
    assert token_cookie

    client.post("/api/auth/logout")

    assert client.get("/api/auth/session").status_code == 401
    # 旧令牌即使被手工重放也已失效
    client.cookies.set("aboutme_admin", token_cookie)
    assert client.get("/api/auth/session").status_code == 401


def test_login_rate_limit_after_repeated_failures(client: TestClient) -> None:
    for _ in range(5):
        client.post("/api/auth/login", json={"username": "xivzy", "password": "bad"})

    blocked = client.post("/api/auth/login", json=ADMIN_CREDENTIALS)
    assert blocked.status_code == 401
    assert "次数过多" in blocked.json()["detail"]


def test_admin_write_endpoints_require_login(client: TestClient) -> None:
    assert client.post("/api/admin/posts", json=POST_PAYLOAD).status_code == 401
    assert client.put("/api/admin/posts/hello-world", json=POST_PAYLOAD).status_code == 401
    assert client.delete("/api/admin/posts/hello-world").status_code == 401
    assert client.put("/api/admin/projects/vcore", json={}).status_code == 401


def test_post_crud_flow(client: TestClient) -> None:
    client.post("/api/auth/login", json=ADMIN_CREDENTIALS)

    created = client.post("/api/admin/posts", json=POST_PAYLOAD)
    assert created.status_code == 201
    post = created.json()
    assert post["title"] == POST_PAYLOAD["title"]

    listing = client.get("/api/posts").json()
    assert listing["total"] == 2
    assert listing["items"][0]["slug"] == post["slug"]

    detail = client.get(f"/api/posts/{post['slug']}")
    assert detail.status_code == 200
    assert detail.json()["content"].startswith("第一段内容。")

    updated = client.put(
        f"/api/admin/posts/{post['slug']}",
        json={**POST_PAYLOAD, "title": "测试文章 Beta"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "测试文章 Beta"

    deleted = client.delete(f"/api/admin/posts/{post['slug']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/posts/{post['slug']}").status_code == 404
    assert client.get("/api/posts").json()["total"] == 1


def test_post_slug_conflict_returns_409(client: TestClient) -> None:
    client.post("/api/auth/login", json=ADMIN_CREDENTIALS)

    conflict = client.post(
        "/api/admin/posts", json={**POST_PAYLOAD, "slug": "hello-world"}
    )

    assert conflict.status_code == 409
