export type SocialLink = {
  label: string;
  url: string;
};

export type SiteInfo = {
  name: string;
  description: string;
  socialLinks: SocialLink[];
};

export const site: SiteInfo = {
  name: "赵晓威",
  description: "软件开发 / 运维 DevOps · 个人网站与技术博客",
  socialLinks: [
    { label: "GitHub", url: "https://github.com/xivzy0124/" },
    { label: "个人博客", url: "https://aboutme.xiaov.cyou" },
    { label: "Email", url: "mailto:xiaowei9500772@gmail.com" },
    { label: "Phone", url: "tel:17681230221" },
  ],
};
