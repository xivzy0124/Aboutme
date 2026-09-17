import type { Metadata } from "next";
import { Award, GraduationCap, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { about } from "@/data/about";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
};

const awardLevelVariant = {
  国家级: "default",
  省级: "secondary",
  校级: "outline",
} as const;

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      {/* 基本信息 */}
      <section className="pb-10">
        <h1 className="text-3xl font-bold tracking-tight">{about.name}</h1>
        <p className="pt-1 text-muted-foreground">{about.basicInfo}</p>
        <div className="flex flex-wrap gap-4 pt-3 text-sm text-muted-foreground">
          <a
            href={`tel:17681230221`}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Phone className="size-4" />
            17681230221
          </a>
          <a
            href="mailto:xiaowei9500772@gmail.com"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Mail className="size-4" />
            xiaowei9500772@gmail.com
          </a>
          <a
            href={site.socialLinks[0].url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            GitHub: xivzy0124
          </a>
        </div>
        <p className="pt-4 leading-relaxed">{about.summary}</p>
      </section>

      {/* 个人优势 */}
      <section className="pb-10">
        <h2 className="pb-4 text-xl font-semibold">个人优势</h2>
        <div className="flex flex-col gap-3">
          {about.highlights.map((item, index) => (
            <div key={index} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 专业技能 */}
      <section className="pb-10">
        <h2 className="pb-4 text-xl font-semibold">专业技能</h2>
        <div className="flex flex-col gap-4">
          {about.skillGroups.map((group) => (
            <div key={group.name}>
              <p className="pb-2 text-sm font-medium">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 荣誉奖项 */}
      <section className="pb-10">
        <h2 className="flex items-center gap-2 pb-4 text-xl font-semibold">
          <Award className="size-5" />
          荣誉奖项
        </h2>
        <div className="flex flex-col gap-2">
          {about.awards.map((award, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm"
            >
              <Badge variant={awardLevelVariant[award.level]}>
                {award.level}
              </Badge>
              <span>
                {award.year ? `${award.year} · ` : ""}
                {award.name}
              </span>
              <span className="ml-auto font-medium">{award.result}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 教育经历 */}
      <section>
        <h2 className="flex items-center gap-2 pb-4 text-xl font-semibold">
          <GraduationCap className="size-5" />
          教育经历
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {about.education.school} · {about.education.major}
            </CardTitle>
            <CardDescription>
              {about.education.degree} · {about.education.period}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {about.education.description}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
