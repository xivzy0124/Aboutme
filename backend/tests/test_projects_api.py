"""项目接口基础功能测试：覆盖列表、鉴权、新增、校验、详情与持久化。

运行方式（backend 目录）：
    pip install -r requirements-dev.txt
    python -m pytest -q
"""

import pytest
from fastapi.testclient import TestClient

from main import app

ADMIN_CREDENTIALS = {"username": "xivzy", "password": "9500772"}

VALID_PAYLOAD = {
    "title": "测试项目 Alpha",
    "role": "全栈开发",
    "period": "2026.10 - 2026.11",
    "description": "用于验证新增项目链路的测试数据，提交后应能立即查询到。",
    "tags": ["FastAPI", "SQLite", "Next.js"],
    "highlights": ["完成接口联调", "数据写入本地数据库"],
    "repo_url": "https://github.com/xivzy0124/",
}


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """每个用例使用独立的临时 SQLite 文件，避免污染开发数据。"""
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "aboutme-test.db"))
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def admin_client(client: TestClient):
    """已登录的管理员客户端；写操作统一走这里。"""
    login = client.post("/api/auth/login", json=ADMIN_CREDENTIALS)
    assert login.status_code == 200
    return client


def test_list_returns_seed_projects(client: TestClient) -> None:
    response = client.get("/api/projects")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 3
    assert body["items"][0]["slug"] == "posture-gait-analysis"


def test_create_requires_admin_session(client: TestClient) -> None:
    """未登录时写操作应被拦截，避免匿名用户改动内容。"""
    response = client.post("/api/projects", json=VALID_PAYLOAD)

    assert response.status_code == 401
    assert client.get("/api/projects").json()["total"] == 3


def test_create_project_and_read_back(admin_client: TestClient) -> None:
    created = admin_client.post("/api/projects", json=VALID_PAYLOAD)

    assert created.status_code == 201
    project = created.json()
    assert project["title"] == VALID_PAYLOAD["title"]
    assert project["tags"] == VALID_PAYLOAD["tags"]
    assert project["slug"]

    listing = admin_client.get("/api/projects").json()
    assert listing["total"] == 4
    # 新数据按创建时间倒序排在最前
    assert listing["items"][0]["slug"] == project["slug"]

    detail = admin_client.get(f"/api/projects/{project['slug']}")
    assert detail.status_code == 200
    assert detail.json()["id"] == project["id"]


def test_admin_can_update_and_delete_project(admin_client: TestClient) -> None:
    created = admin_client.post("/api/projects", json=VALID_PAYLOAD).json()
    slug = created["slug"]

    updated = admin_client.put(
        f"/api/admin/projects/{slug}",
        json={**VALID_PAYLOAD, "title": "测试项目 Beta", "tags": ["FastAPI"]},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "测试项目 Beta"
    assert updated.json()["slug"] == slug

    deleted = admin_client.delete(f"/api/admin/projects/{slug}")
    assert deleted.status_code == 204
    assert admin_client.get(f"/api/projects/{slug}").status_code == 404


def test_create_rejects_invalid_payload(admin_client: TestClient) -> None:
    invalid_title = admin_client.post("/api/projects", json={**VALID_PAYLOAD, "title": "A"})
    assert invalid_title.status_code == 422

    invalid_period = admin_client.post(
        "/api/projects", json={**VALID_PAYLOAD, "period": "2026-10 2026-11"}
    )
    assert invalid_period.status_code == 422

    empty_tags = admin_client.post("/api/projects", json={**VALID_PAYLOAD, "tags": ["  "]})
    assert empty_tags.status_code == 422


def test_get_unknown_project_returns_404(client: TestClient) -> None:
    response = client.get("/api/projects/not-exists")

    assert response.status_code == 404
    assert response.json()["detail"] == "项目不存在"


def test_data_survives_app_restart(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "persist-test.db"))

    with TestClient(app) as first:
        first.post("/api/auth/login", json=ADMIN_CREDENTIALS)
        created = first.post("/api/projects", json=VALID_PAYLOAD).json()

    with TestClient(app) as second:
        listing = second.get("/api/projects").json()

    assert listing["total"] == 4
    assert any(item["id"] == created["id"] for item in listing["items"])
