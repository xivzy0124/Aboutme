import type { Metadata } from "next";
import { Code, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="pb-8 text-3xl font-bold tracking-tight">Projects</h1>

      <div className="flex flex-col gap-6">
        {projects.map((project) => (
          <Card key={project.slug}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>
                {project.role} · {project.period}
              </CardDescription>
              <CardAction className="flex items-center gap-2">
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub 仓库"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Code className="size-4" />
                  </a>
                ) : null}
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="访问项目"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <ul className="flex flex-col gap-2">
                {project.highlights.map((highlight, index) => (
                  <li key={index} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
