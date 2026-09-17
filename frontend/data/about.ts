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

export type AboutContent = {
  name: string;
  basicInfo: string;
  summary: string;
  highlights: string[];
  skillGroups: SkillGroup[];
  awards: Award[];
  education: Education;
};

export const about: AboutContent = {
  name: "赵晓威",
  basicInfo: "男 · 21 岁 · 2027 届毕业生",
  summary:
    "软件开发与运维 DevOps 双方向：能独立完成全栈项目从开发到上线的基础流程，具备多台 VPS 部署维护、Nginx 反向代理、Docker 容器化与 CI/CD 实操经验；多次参与校级、省级、国家级科创竞赛，累计获得国家级奖项 1 项、省级奖项 6 项。",
  highlights: [
    "实操落地能力较强：在校独立完成多款全栈练习项目，能自主完成服务器基础部署、环境搭建与简单维护，熟悉从开发到上线的基础流程，擅长动手调试解决工程问题。",
    "新技术学习适应快：乐于主动接触各类开发框架与工具，遇到陌生技术可通过官方文档、日志分析及实际环境测试自主排查验证并完成落地。",
    "竞赛项目协作经验：多次参与校级、省级、国家级科创竞赛，获国赛铜奖 1 项、省赛奖项 6 项；熟悉小组分工合作，能配合完成项目开发、材料整理与答辩交付。",
    "擅长借助工具提效：业务逻辑、架构设计以自主实现为主，熟练使用 Codex、Claude Code、Hermes、Pi 等 AI 工具提升开发与排查效率。",
  ],
  skillGroups: [
    {
      name: "前端开发",
      skills: [
        "Vue",
        "React",
        "TypeScript",
        "Next.js App Router 全栈开发",
      ],
    },
    {
      name: "后端开发",
      skills: ["Java (Spring Boot 3)", "Python (FastAPI)", "RESTful API 设计"],
    },
    {
      name: "数据相关",
      skills: ["SQL (MySQL / SQLite)", "Hadoop 分布式架构基础"],
    },
    {
      name: "运维 & 部署",
      skills: [
        "Linux",
        "Docker",
        "Nginx 反向代理",
        "VPS 部署维护",
        "HTTPS / DNS (Cloudflare / acme.sh)",
        "GitHub Actions CI/CD",
      ],
    },
    {
      name: "开发工具",
      skills: ["Git", "AI 编码工具 (Codex / Claude Code 等)"],
    },
    {
      name: "移动端开发",
      skills: ["鸿蒙 (ArkTS)", "安卓", "iOS 原生项目参与经验"],
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
      name: "第十六届蓝桥杯安徽赛区 C/C++ 程序设计大学 C 组",
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
      name: "安徽省计算机设计大赛（信息可视化）",
      result: "省级二等奖",
    },
    {
      level: "省级",
      year: "2026",
      name: "安徽省计算机设计大赛（大数据应用）",
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
      year: "",
      name: "讯飞杯编程竞赛、校级大数据技能竞赛等",
      result: "多项一等奖",
    },
  ],
  education: {
    school: "安徽电子信息职业技术学院",
    degree: "专科",
    major: "软件工程",
    period: "2024 - 2027",
    description:
      "深耕大数据、人工智能、算法程序设计、信息可视化方向，持续参与学科技术竞赛，累计斩获国家级奖项 1 项、省级奖项 6 项、校级一等奖若干。",
  },
};
