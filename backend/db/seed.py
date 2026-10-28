"""首次启动时写入的示例数据。

内容与前端静态阶段保持一致，避免接入数据库后页面突然变空；
只在对应表为空时写入一次，不会覆盖用户新增的数据。
"""

from datetime import datetime, timezone

from repositories import get_post_repository, get_project_repository
from repositories.base import PostDraft, ProjectDraft

_DEFAULT_PROJECTS = (
    ProjectDraft(
        slug="posture-gait-analysis",
        title="智能体态分析与步态矫正系统",
        role="全栈开发 · 独立承担核心模块",
        period="2026.03 - 2026.05",
        description=(
            "软硬件融合项目：通过足底压力传感器采集数据，经蓝牙传输至鸿蒙设备；"
            "结合摄像头计算机视觉获取人体骨骼姿态信息，后端统一接收并入库，"
            "通过 AI 工作流分析生成体态问题报告与个性化矫正方案。"
        ),
        highlights=[
            "鸿蒙端 SDK 与 APP 开发：独立将 Android 蓝牙方案移植至鸿蒙平台，使用 ArkTS 编写鸿蒙 SDK，实现智能鞋垫的设备识别、足底压力数据采集、缓存与统一上报；独立完成鸿蒙 APP 架构设计与页面开发，保障设备稳定连接与数据可靠传输。",
            "后端 RESTful API 开发：基于 Spring Boot 3 + MySQL + MyBatis 搭建后端服务，实现核心业务 CRUD；设计数据对齐逻辑，完成摄像头骨骼点位与足底压力数据的时间戳同步，为 AI 工作流提供高质量多模态特征输入。",
            "前端可视化大屏开发：基于 Vue3 + ECharts 开发步态分析可视化页面，实现 36 路压力传感器动态热力图实时展示；优化高频数据渲染性能，确保足底压力监测流畅稳定。",
        ],
        tags=["HarmonyOS / ArkTS", "Spring Boot 3", "MySQL", "MyBatis", "Vue3", "ECharts"],
        created_at=datetime(2026, 10, 3, 8, tzinfo=timezone.utc),
        repo_url="https://github.com/xivzy0124/",
    ),
    ProjectDraft(
        slug="vcore",
        title="VCore - 轻量化 Linux 运维与 AI 管理工具",
        role="独立开发",
        period="2026.01 - 2026.02",
        description=(
            "前后端分离的轻量化 Linux 运维与 AI 管理工具：SQLite 本地轻量存储，"
            "实现无依赖、免安装、非侵入式部署，不污染 Linux 原生运行环境。"
        ),
        highlights=[
            "架构设计：基于 Spring Boot 3 + Vue3 前后端分离开发，SQLite 做本地轻量存储，免安装、非侵入式部署。",
            "实时通信与远程终端：整合 JSch + WebSocket 搭建长连接通道，实现 CPU / 内存 / 磁盘秒级指标实时监控；集成 Xterm.js 实现 Web 端交互式远程终端，免客户端直接操作服务器。",
            "容器编排能力：封装 Docker API，实现镜像拉取、容器创建 / 启停 / 删除等全生命周期可视化管理。",
            "AI 运维融合：对接 Ollama 本地大模型，结合实时服务器状态（含 GPU 算力占用），基于 SSE 流式推送实现 AI 运维问答、故障分析与建议辅助。",
        ],
        tags=[
            "Spring Boot 3",
            "Vue3",
            "WebSocket",
            "JSch",
            "Docker API",
            "SQLite",
            "Ollama",
            "Xterm.js",
            "SSE",
        ],
        created_at=datetime(2026, 10, 2, 8, tzinfo=timezone.utc),
        repo_url="https://github.com/xivzy0124/",
    ),
    ProjectDraft(
        slug="cicd-container-deploy",
        title="CI/CD 容器化自动部署系统",
        role="运维开发",
        period="2026.07 - 2026.08",
        description=(
            "基于 GitHub Actions 搭建 CI/CD 自动化部署流水线，代码提交后自动触发构建、测试与部署；"
            "生产环境通过拉取私有仓库指定版本镜像并用 Docker Compose 更新容器，"
            "实现构建与运行环境解耦及版本快速切换。"
        ),
        highlights=[
            "流水线搭建：使用 GitHub Actions 串联构建、测试与部署流程，替代生产环境的人工部署操作。",
            "自托管执行：使用 GitHub Self-hosted Runner 执行服务器侧任务，完成代码拉取、Docker 镜像构建与容器部署。",
            "镜像交付：将构建产物推送至私有容器镜像仓库，以镜像版本进行应用交付，实现构建环境与生产运行环境解耦，避免在生产服务器直接构建镜像。",
            "生产更新：生产环境拉取指定版本镜像并结合 Docker Compose 更新容器，实现版本快速切换，统一管理服务编排与配置。",
            "统一入口：使用 Nginx 配置反向代理及 HTTPS，为容器化应用提供统一访问入口。",
            "流程梳理：打通 Git → GitHub Actions → Docker Build → 私有镜像仓库 → Docker Compose → Nginx 的标准化持续交付链路。",
        ],
        tags=[
            "GitHub Actions",
            "Self-hosted Runner",
            "Docker",
            "Docker Compose",
            "Nginx",
            "Linux",
            "私有镜像仓库",
        ],
        created_at=datetime(2026, 10, 1, 8, tzinfo=timezone.utc),
        repo_url="https://github.com/xivzy0124/",
    ),
)


def seed_default_projects() -> None:
    """表为空时写入示例项目；已有数据则跳过，保证幂等。"""
    repository = get_project_repository()
    if repository.count() > 0:
        return

    for project in _DEFAULT_PROJECTS:
        repository.create(project)


# 示例文章正文按空行分段；标题用 "## " 开头，列表项用 "- " 开头
_DEFAULT_POSTS = (
    PostDraft(
        slug="hello-world",
        title="你好，世界",
        summary="博客的第一篇文章：记录这个站点从静态页面走向前后端打通的过程与后续写作计划。",
        content="""这里是关于这个个人站点的第一篇文章。它最初只是一组静态页面，用来验证排版、字号与响应式布局；现在项目与文章都已经迁入数据库，可以通过管理后台直接编辑。

## 接下来会写什么

主要围绕自己在做项目时真正遇到的问题：运维部署、容器化、后端接口设计，以及 AI 工具如何进入日常工作流。

- 项目复盘：从需求到上线的完整链路
- 运维笔记：部署、排障与自动化
- AI 实践：工具与工作流的组合方式

写作的原则很简单：写清楚背景、过程和结论，少一点正确的废话。""",
        tags=["随笔"],
        published_at="2024-01-01",
        created_at=datetime(2024, 1, 1, 8, tzinfo=timezone.utc),
    ),
)


def seed_default_posts() -> None:
    """表为空时写入示例文章；已有数据则跳过。"""
    repository = get_post_repository()
    if repository.count() > 0:
        return

    for post in _DEFAULT_POSTS:
        repository.create(post)
