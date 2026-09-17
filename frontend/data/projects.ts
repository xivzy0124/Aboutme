export type Project = {
  slug: string;
  title: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  tags: string[];
  url?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "posture-gait-analysis",
    title: "智能体态分析与步态矫正系统",
    role: "全栈开发 · 独立承担核心模块",
    period: "2026.03 - 至今",
    description:
      "软硬件融合项目：通过足底压力传感器采集数据，经蓝牙传输至鸿蒙设备；结合摄像头计算机视觉获取人体骨骼姿态信息，后端统一接收并入库，通过 AI 工作流分析生成体态问题报告与个性化矫正方案。",
    highlights: [
      "鸿蒙端 SDK 与 APP 开发：独立将 Android 蓝牙方案移植至鸿蒙平台，使用 ArkTS 编写鸿蒙 SDK，实现智能鞋垫的设备识别、足底压力数据采集、缓存与统一上报；独立完成鸿蒙 APP 架构设计与页面开发，保障设备稳定连接与数据可靠传输。",
      "后端 RESTful API 开发：基于 Spring Boot 3 + MySQL + MyBatis 搭建后端服务，实现核心业务 CRUD；设计数据对齐逻辑，完成摄像头骨骼点位与足底压力数据的时间戳同步，为 AI 工作流提供高质量多模态特征输入。",
      "前端可视化大屏开发：基于 Vue3 + ECharts 开发步态分析可视化页面，实现 36 路压力传感器动态热力图实时展示；优化高频数据渲染性能，确保足底压力监测流畅稳定。",
    ],
    tags: ["HarmonyOS / ArkTS", "Spring Boot 3", "MySQL", "MyBatis", "Vue3", "ECharts"],
    repoUrl: "https://github.com/xivzy0124/",
  },
  {
    slug: "vcore",
    title: "VCore - 轻量化 Linux 运维与 AI 管理工具",
    role: "独立开发",
    period: "2026.01 - 2026.02",
    description:
      "前后端分离的轻量化 Linux 运维与 AI 管理工具：SQLite 本地轻量存储，实现无依赖、免安装、非侵入式部署，不污染 Linux 原生运行环境。",
    highlights: [
      "架构设计：基于 Spring Boot 3 + Vue3 前后端分离开发，SQLite 做本地轻量存储，免安装、非侵入式部署。",
      "实时通信与远程终端：整合 JSch + WebSocket 搭建长连接通道，实现 CPU / 内存 / 磁盘秒级指标实时监控；集成 Xterm.js 实现 Web 端交互式远程终端，免客户端直接操作服务器。",
      "容器编排能力：封装 Docker API，实现镜像拉取、容器创建 / 启停 / 删除等全生命周期可视化管理。",
      "AI 运维融合：对接 Ollama 本地大模型，结合实时服务器状态（含 GPU 算力占用），基于 SSE 流式推送实现 AI 运维问答、故障分析与建议辅助。",
    ],
    tags: [
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
    repoUrl: "https://github.com/xivzy0124/",
  },
];
