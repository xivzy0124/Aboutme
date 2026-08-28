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
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="flex items-center gap-3">
          {site.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              {socialIcons[link.label] ?? null}
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
