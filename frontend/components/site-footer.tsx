import { Code, Mail, Phone } from "lucide-react";

import { site } from "@/data/site";

const socialIcons: Record<string, React.ReactNode> = {
  GitHub: <Code className="size-4" />,
  Email: <Mail className="size-4" />,
  Phone: <Phone className="size-4" />,
};

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-6 text-sm text-muted-foreground">
        {site.socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            /* 伪元素纵向扩展点击区域到 44px，不改变页脚视觉高度 */
            className="relative flex items-center gap-1.5 transition-colors after:absolute after:-inset-y-3 after:inset-x-0 after:content-[''] hover:text-foreground"
          >
            {socialIcons[link.label] ?? null}
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
