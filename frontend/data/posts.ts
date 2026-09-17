export type Post = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
};

export const posts: Post[] = [
  {
    slug: "hello-world",
    title: "你好，世界",
    summary: "博客的第一篇文章。当前为骨架阶段的静态数据，后续全栈阶段接入 Tiptap 编辑器与数据库。",
    tags: ["随笔"],
    publishedAt: "2024-01-01",
  },
];
