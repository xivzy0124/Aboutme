export type SkillGroup = {
  name: string;
  skills: string[];
};

export type Award = {
  level: "国家级" | "省级" | "校级";
  year: string;
  name: string;
  result: string;
};

export type Education = {
  school: string;
  degree: string;
  major: string;
  period: string;
  description: string;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  points: string[];
};

export type AboutContent = {
  name: string;
  basicInfo: string;
  summary: string;
  highlights: string[];
  skillGroups: SkillGroup[];
  experience: Experience[];
  awards: Award[];
  education: Education;
};

export const about: AboutContent = {
  name: "赵晓威",
  basicInfo: "男 · 21 岁 · 2027 届毕业生",
  summary:
    "2027 届软件工程毕业生，专业成绩前 3%，获国家级奖项 1 项、省级奖项 6 项。具备 Linux 运维部署与自动化脚本开发经验，熟悉容器化与 CI/CD 实践；习惯使用 AI 工具辅助编码与问题排查，并在实际项目中落地大模型应用（本地部署、API 集成），保持对 AI Agent、云原生等前沿技术的热情。",
  highlights: [
    "工程基础扎实：专业成绩位列前 3%，累计获国家级奖项 1 项、省级奖项 6 项，具备 Linux 系统管理与 VPS 运维、Nginx 反向代理及故障排查经验。",
    "容器化与 CI/CD 实践：熟练编写 Dockerfile 与 Docker Compose，基于 kubeadm 自建 3 节点 Kubernetes 集群完成应用编排部署，并用 GitHub Actions 落地自动化交付流水线。",
    "运维开发能力：熟练借助 AI 编写 Python / Java（FastAPI + Spring Boot）后端服务与自动化脚本，熟悉 Vue3 + TypeScript 前端交互开发与 MySQL 查询。",
    "AI 工具协同与团队协作：熟练运用 Claude Code、Codex CLI 等工具协同开发运维，了解 Agent 与 MCP 架构；性格开朗，善于团队协作与交流沟通。",
  ],
  skillGroups: [
    {
      name: "系统与自动化",
      skills: [
        "Linux 系统管理",
        "VPS 运维",
        "Nginx 反向代理",
        "Ansible Playbook",
        "DNS / HTTP(S)",
        "SSL 证书配置",
      ],
    },
    {
      name: "容器化与编排",
      skills: [
        "Dockerfile",
        "Docker Compose",
        "容器网络与数据卷",
        "Kubernetes (kubeadm 3 节点)",
        "Pod / Deployment / Service",
      ],
    },
    {
      name: "运维开发",
      skills: [
        "Python",
        "Java (FastAPI / Spring Boot)",
        "RESTful API",
        "自动化脚本",
        "Vue3 + TypeScript",
        "MySQL",
      ],
    },
    {
      name: "流水线与监控",
      skills: [
        "Git / GitHub / GitLab 协作",
        "GitHub Actions CI/CD",
        "私有容器镜像仓库",
        "Prometheus + Grafana",
      ],
    },
    {
      name: "人工智能工具",
      skills: [
        "Claude Code",
        "Codex CLI",
        "AI Agent / MCP 架构",
        "Skills 固化工作流",
      ],
    },
  ],
  experience: [
    {
      company: "安徽省大数据中心 · 政务信息化项目",
      role: "系统运维实习生",
      period: "2026.09 - 至今",
      points: [
        "Linux 服务器巡检与问题排查：负责 7 台 Linux 服务器的日常巡检，通过命令行核查系统状态、服务运行情况及日志文件，协助定位服务异常、资源占用过高等问题并及时上报。",
        "巡检信息自动采集：基于 Python 通过 SSH 远程批量登录服务器，按固定时段采集系统运行信息，输出结构化结果用于日报填写，减少逐台手动登录核查的重复操作。",
        "安全运营支持：负责安全告警数据的采集、统计与核对，协助安全团队完成平台运行数据的整理与异常核验，保障安全运营流程的数据准确性。",
        "数据采集与整理自动化：使用 Python 编写数据爬取脚本，结合 pandas 完成数据清洗、去重与汇总并导出报表，替代原本人工复制整理的流程，日常处理时间节省约 70%。",
        "运维文档与规范化：按项目规范编写日常运维报告，覆盖服务器巡检结果、告警处理及平台运行数据汇总，参与建立标准化的巡检记录与报告流程。",
      ],
    },
  ],
  awards: [
    {
      level: "国家级",
      year: "2025",
      name: "世界院校职业技能大赛 · 新一代信息技术赛道",
      result: "国赛铜奖",
    },
    {
      level: "省级",
      year: "2026",
      name: "安徽省大数据与人工智能应用竞赛",
      result: "省级一等奖",
    },
    {
      level: "省级",
      year: "2026",
      name: "第十六届蓝桥杯全国软件和信息技术专业人才大赛（安徽赛区）C/C++ 程序设计",
      result: "省级二等奖",
    },
    {
      level: "省级",
      year: "2025",
      name: "安徽省大数据与人工智能应用竞赛",
      result: "省级二等奖",
    },
    {
      level: "省级",
      year: "2026",
      name: "安徽省计算机设计大赛（信息可视化方向）",
      result: "省级二等奖",
    },
    {
      level: "省级",
      year: "2026",
      name: "安徽省计算机设计大赛（大数据应用方向）",
      result: "省级三等奖",
    },
    {
      level: "省级",
      year: "2025",
      name: "安徽省机器人大赛算法设计赛道",
      result: "省级三等奖",
    },
    {
      level: "校级",
      year: "2025",
      name: "讯飞杯编程竞赛、校级大数据技能竞赛",
      result: "一等奖",
    },
  ],
  education: {
    school: "安徽电子信息职业技术学院",
    degree: "专科",
    major: "软件工程",
    period: "2024.09 - 2027.06",
    description:
      "深耕大数据、人工智能、算法程序设计与信息可视化方向，多次带队参与专科技术竞赛，累计获国家级奖项 1 项、省级奖项 6 项、校级一等奖若干；专业成绩位列前 3%，获评专业讯飞奖学金。",
  },
};
