# Aboutme · AI 协作说明

个人网站 / 技术博客：Next.js 前端 + FastAPI 后端 + SQLite。
本文件是给 AI 编码助手的默认上下文，动手前先读一遍。

---

## 1. 最重要：开发环境跑在 Docker 里

本项目**所有开发、测试、装包都在容器内完成**，宿主机不要直接执行 `pnpm` / `npm` / `pip` / `uvicorn`。

- 开发编排文件：[compose.dev.yml](compose.dev.yml)（源码 bind mount + 热更新）
- 生产镜像编排文件：[docker-compose.yml](docker-compose.yml)（只用于验证镜像构建，端口 3005）
- 宿主机默认 Windows + PowerShell，命令在仓库根目录执行

### 常用命令

```powershell
# 启动 / 停止开发环境
docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml down

# 查看日志（改完代码确认是否热更新成功）
docker compose -f compose.dev.yml logs -f backend frontend

# 只重建前端（改了依赖、next.config.ts 等）
docker compose -f compose.dev.yml up -d --force-recreate frontend

# 进入容器
docker compose -f compose.dev.yml exec backend sh
docker compose -f compose.dev.yml exec frontend sh
```

### 验证命令（改完代码必跑）

```powershell
# 后端测试（容器内默认没装 pytest，第一次先装开发依赖）
docker compose -f compose.dev.yml exec backend python -m pip install -q -r requirements-dev.txt
docker compose -f compose.dev.yml exec backend python -m pytest -q

# 前端类型检查 / Lint
docker compose -f compose.dev.yml exec frontend pnpm exec tsc --noEmit
docker compose -f compose.dev.yml exec frontend pnpm exec eslint .
```

### 依赖变更

```powershell
# 前端：在容器内加包，会改写 package.json 与 pnpm-lock.yaml
docker compose -f compose.dev.yml exec frontend pnpm add <pkg>
docker compose -f compose.dev.yml exec frontend pnpm add -D <pkg>

# 后端：改 requirements.txt 后重启 backend，启动命令会自动 pip install
docker compose -f compose.dev.yml up -d --force-recreate backend
```

容器内 `pip install` 的包在容器重建后丢失；需要长期存在的依赖写进 `requirements*.txt`。

### 端口

| 服务 | 地址 |
| --- | --- |
| 前端 | http://localhost:3000 |
| 后端 / OpenAPI 文档 | http://localhost:8000 · http://localhost:8000/docs |
| PostgreSQL（预留） | 5432 |
| MinIO（预留） | 9000 / 9001 |

> `compose.dev.yml` 里的 postgres / minio 只是预留。**代码当前只使用 SQLite**，不要擅自切换数据后端。

---

## 2. 目录结构

```text
Aboutme/
├── compose.dev.yml           # 本地开发编排（实际使用）
├── docker-compose.yml        # 镜像构建 / 部署编排
├── AGENTS.md                 # 本文件
├── backend/                  # FastAPI（容器内工作目录 /app）
│   ├── main.py               # 入口：生命周期、中间件、路由装配
│   ├── api/                  # HTTP 层：只做协议转换
│   ├── services/             # 业务逻辑：slug 生成、鉴权、第三方请求
│   ├── repositories/         # 数据访问接口 + SQLite 实现 + 工厂
│   ├── db/                   # 连接管理、DDL（database.py）、示例数据（seed.py）
│   ├── schemas/              # Pydantic 出入参
│   ├── core/                 # 配置、中间件、安全工具
│   ├── tests/                # pytest，使用临时 SQLite 文件
│   └── data/aboutme.db       # 运行时数据（gitignore，勿提交）
├── frontend/                 # Next.js App Router
│   ├── app/                  # 路由：/ /about /projects /blog /admin
│   ├── components/           # 业务组件；components/ui 为 shadcn 组件
│   ├── lib/                  # 接口封装（*-api.ts）、服务端请求、工具
│   ├── data/                 # 站点名、About 等静态文案
│   ├── proxy.ts              # /admin 登录守卫（Next 16 的 proxy，不是 middleware）
│   └── next.config.ts        # /api 反向代理到后端
└── docs/技术栈.MD            # 早期纯前端阶段的技术选型记录，部分内容已过时
```

`docs/技术栈.MD` 中「当前为纯前端、不使用 Docker / FastAPI / 数据库」的描述已不符合现状，**以本文件和代码为准**。

---

## 3. 架构与分层

### 后端：api → services → repositories → db

```text
api/*.py            HTTP 入参出参、状态码，不写业务
   ↓
services/*.py      业务规则、slug 生成、会话与登录限流
   ↓
repositories/      抽象接口（base.py）+ SQLite 实现 + 工厂（__init__.py）
   ↓
db/database.py     唯一持有 DDL 与 SQLite 连接的地方
```

硬性约束：

- SQL 只允许出现在 `repositories/sqlite_*.py` 与 `db/` 内
- `api/` 不写业务判断，`services/` 不写 SQL
- 新增实体时按顺序补齐：`schemas/` → `repositories/base.py` 接口 → `sqlite_*_repository.py` 实现 → 工厂函数 → `services/` → `api/` → `tests/`
- 导入使用顶层模块名（如 `from services.posts import ...`），因为容器工作目录就是 `backend/`

### 前端：服务端组件取数，客户端走同源 /api

- 浏览器请求统一使用相对路径 `/api/...`，由 [next.config.ts](frontend/next.config.ts) 的 rewrite 转发到后端，因此 Cookie 不需要跨站
- 服务端组件 / 登录守卫直接请求后端，基址取 `INTERNAL_API_BASE_URL`（容器内 `http://backend:8000`），见 [server-api.ts](frontend/lib/server-api.ts)
- 接口响应是 snake_case，前端在 `lib/*-api.ts` 的 `mapXxx` 里转 camelCase，组件只消费 camelCase 类型
- 错误统一转成 `ApiError`（含字段级提示），不要在各组件里重复解析 FastAPI 的 `detail`

---

## 4. 接口清单

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/health` | 健康检查 |
| GET | `/api/github/trending/{daily\|weekly\|monthly}` | GitHub 热门项目 |
| GET | `/api/projects` | 项目列表 |
| POST | `/api/projects` | 新增项目（需管理员） |
| GET | `/api/posts`、`/api/posts/{slug}` | 文章列表 / 详情 |
| POST | `/api/auth/login`、`/api/auth/logout` | 登录 / 退出 |
| GET | `/api/auth/session` | 当前会话（未登录 401） |
| POST/PUT/DELETE | `/api/admin/posts`、`/api/admin/posts/{slug}` | 文章增改删 |
| PUT/DELETE | `/api/admin/projects/{slug}` | 项目改删 |

- 凡写操作都必须挂 `Depends(require_admin)` 与 `Depends(require_same_origin)`
- 未登录返回 401，来源不可信返回 403，资源不存在返回 404

---

## 5. 鉴权

- 会话 Cookie：`aboutme_admin`，`HttpOnly` + `SameSite=Strict`，服务端只存令牌哈希（表 `admin_sessions`）
- 滑动续期 2 小时，绝对上限 12 小时；登录失败 5 次 / 15 分钟锁定（进程内计数）
- 账号通过环境变量配置：`ADMIN_USERNAME` / `ADMIN_PASSWORD`，开发默认值写在 `compose.dev.yml`
- 生产必须覆盖默认口令，并设置 `ADMIN_COOKIE_SECURE=true`
- 禁止把口令、Cookie、令牌写进日志、提交记录或文档

---

## 6. 数据

- 默认数据库文件：`backend/data/aboutme.db`（WAL 模式，已被 gitignore）
- 表结构只定义在 [database.py](backend/db/database.py)；示例数据在 [seed.py](backend/db/seed.py)，**表为空时才写入**
- 没有迁移框架：改字段要同时更新 `SCHEMA`，并手动 `ALTER TABLE` 或删库重建
- 删库会丢失所有后台录入的内容，执行前必须确认
- 重置开发库（宿主机直接删 bind mount 文件即可，然后重启后端）：

```powershell
Remove-Item backend/data/aboutme.db* -Force
docker compose -f compose.dev.yml restart backend
```

---

## 7. 前端约定

- **Next.js 16 + React 19**：API 与目录约定可能和训练数据不同。写不熟悉的 API 前先读 `frontend/node_modules/next/dist/docs/`，注意弃用提示
- 路由守卫用 `frontend/proxy.ts`（导出 `proxy` + `config.matcher`）；不要改回 `middleware.ts`
- TypeScript `strict: true`：避免 `any`，公共结构定义明确类型
- Tailwind CSS v4：没有 `tailwind.config.js`，主题与排版令牌在 [globals.css](frontend/app/globals.css)；优先使用已有 `text-body`、`text-display`、`text-meta` 等令牌，不要新造任意字号
- UI 组件优先用 `components/ui` 里的 shadcn 组件；图标统一 `lucide-react`，不用 Emoji
- 包管理只用 pnpm（`pnpm-lock.yaml` 已入库），禁止 npm / yarn
- 默认写服务端组件，只有需要浏览器状态 / 事件时才加 `"use client"`
- 内容渲染不动 Markdown 库：`PostContent` 只支持空行分段、`## ` 标题、`- ` 列表

---

## 8. 测试

- 后端：pytest；测试通过 `SQLITE_PATH` 指向临时文件，不会污染开发库
- 修改接口 / 业务逻辑时同步补 `backend/tests/` 用例
- 前端没有单元测试；改页面后用浏览器打开 `http://localhost:3000` 自测，管理流程需覆盖登录 → 新增/编辑/删除 → 退出
- `.verify/` 是本地截图与校验脚本，已 gitignore，不属于项目代码

---

## 9. Git 与提交

- 使用 Conventional Commits，描述用中文，例如 `feat(admin): 博客改为后端驱动`
- 不提交：`backend/data/`、`sqldata/`、`miniodata/`、`.next/`、`node_modules/`、`.verify/`、`.env*`
- 用户没明确要求时**不要自动 commit / push**

---

## 10. 不要做的事

- 不要在宿主机直接 `pnpm install` / `pip install` / 跑 dev server
- 不要把 SQLite 换成 PostgreSQL（预留服务尚未接入）
- 不要在 `api/` 里写业务逻辑，或在 `services/` 里写 SQL
- 不要提交数据库文件、密钥、`.env`
- 不要为简单页面引入新的 CSS 框架、状态管理库或富文本编辑器
- 不要删除或覆盖用户已有数据与未提交的改动
