"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, createProject, type Project, type ProjectInput } from "@/lib/projects-api";
import { cn } from "@/lib/utils";

/** 表单内部字段；周期拆成两个月份输入，提交时再拼成 "YYYY.MM - YYYY.MM"。 */
type Draft = {
  title: string;
  role: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  tags: string;
  highlights: string;
  repoUrl: string;
};

type FieldErrors = Partial<Record<keyof Draft, string>>;

const EMPTY_DRAFT: Draft = {
  title: "",
  role: "",
  periodStart: "",
  periodEnd: "",
  description: "",
  tags: "",
  highlights: "",
  repoUrl: "",
};

/** 与后端 schemas/project.py 的约束保持一致，避免提交后才看到错误。 */
const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

/** 后端字段名 → 表单字段名；url 与 repo_url 共用仓库链接输入框。 */
const SERVER_FIELD_MAP: Record<string, keyof Draft> = {
  title: "title",
  role: "role",
  period: "periodEnd",
  description: "description",
  tags: "tags",
  highlights: "highlights",
  repo_url: "repoUrl",
  url: "repoUrl",
};

function splitList(value: string, separator: RegExp): string[] {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "2025-03" → "2025.03"；空值或非法月份返回 null。 */
function toPeriod(value: string): string | null {
  if (!MONTH_PATTERN.test(value)) return null;
  return value.replace("-", ".");
}

/** 客户端校验 + 组装接口参数；有错误时只返回错误，不发请求。 */
function buildInput(draft: Draft): { errors: FieldErrors; input?: ProjectInput } {
  const errors: FieldErrors = {};

  const title = draft.title.trim();
  if (title.length < 2 || title.length > 80) {
    errors.title = "项目名称需要 2–80 个字符。";
  }

  const role = draft.role.trim();
  if (role.length < 2 || role.length > 60) {
    errors.role = "承担角色需要 2–60 个字符。";
  }

  const start = toPeriod(draft.periodStart);
  const end = toPeriod(draft.periodEnd);
  if (!start) {
    errors.periodStart = "请选择开始月份。";
  } else if (!end) {
    errors.periodEnd = "请选择结束月份。";
  } else if (end < start) {
    errors.periodEnd = "结束月份不能早于开始月份。";
  }

  const description = draft.description.trim();
  if (description.length < 10 || description.length > 600) {
    errors.description = "项目简介需要 10–600 个字符。";
  }

  const tags = splitList(draft.tags, /[,，、\n]/);
  if (tags.length === 0) {
    errors.tags = "至少填写一个技术标签。";
  } else if (tags.length > 12) {
    errors.tags = "最多填写 12 个技术标签。";
  } else if (tags.some((tag) => tag.length > 24)) {
    errors.tags = "单个技术标签不能超过 24 个字符。";
  }

  const highlights = splitList(draft.highlights, /\n/);
  if (highlights.length === 0) {
    errors.highlights = "至少填写一条项目亮点。";
  } else if (highlights.length > 8) {
    errors.highlights = "最多填写 8 条项目亮点。";
  } else if (highlights.some((item) => item.length > 300)) {
    errors.highlights = "单条亮点不能超过 300 个字符。";
  }

  const repoUrl = draft.repoUrl.trim();
  if (repoUrl && !URL_PATTERN.test(repoUrl)) {
    errors.repoUrl = "请输入以 http(s):// 开头的完整链接。";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    input: {
      title,
      role,
      period: `${start} - ${end}`,
      description,
      tags,
      highlights,
      repoUrl: repoUrl || undefined,
    },
  };
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 text-ui text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

/** 带标签、提示与错误信息的字段容器；错误提示与输入框通过 id 关联。 */
function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-meta font-medium text-foreground">
          {label}
        </label>
        {hint ? <span className="text-[0.6875rem] text-muted-foreground">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[0.75rem] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProjectFormDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();

  // open 由父组件控制：true 走 showModal（自带焦点陷阱与 Esc 处理），false 关闭。
  // 表单初始值由父组件通过 key 重新挂载来重置，这里只负责同步原生 dialog 的开关。
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const update = (key: keyof Draft) => (value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    // 用户开始修正时立即撤掉该字段的错误，减少视觉干扰
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const requestClose = () => {
    if (submitting) return;
    onClose();
  };

  /** 统一生成输入框的受控属性与无障碍关联。 */
  const fieldProps = (key: keyof Draft, htmlFor: string) => ({
    value: draft[key],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(key)(event.target.value),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${htmlFor}-error` : undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const { errors: nextErrors, input } = buildInput(draft);
    if (!input) {
      setErrors(nextErrors);
      setServerError("");
      return;
    }

    setErrors({});
    setServerError("");
    setSubmitting(true);

    try {
      const project = await createProject(input);
      onCreated(project);
    } catch (reason) {
      if (reason instanceof ApiError) {
        const mapped: FieldErrors = {};
        for (const [field, message] of Object.entries(reason.fieldErrors)) {
          const local = SERVER_FIELD_MAP[field];
          if (local) mapped[local] = message;
        }
        setErrors(mapped);
        setServerError(reason.message);
      } else {
        setServerError("网络异常，未能写入数据库，请稍后重试。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // 交给 React 状态统一关闭，避免原生关闭与父组件状态不同步
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        // dialog 本身没有内边距，点到的元素就是遮罩层
        if (event.target === event.currentTarget) requestClose();
      }}
      className="project-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 pt-5 pb-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-kicker text-primary">Projects · 新增</p>
            <h2 id={titleId} className="mt-1.5 text-title">
              新增项目
            </h2>
            <p className="mt-1 text-meta text-muted-foreground">
              提交后写入本地 SQLite，并立即出现在列表顶部。
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="关闭弹窗"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="scroll-thin min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="项目名称" htmlFor="project-title" error={errors.title}>
              <input
                id="project-title"
                type="text"
                required
                maxLength={80}
                autoComplete="off"
                placeholder="例如：智能体态分析与步态矫正系统"
                className={cn(inputClass, "h-10")}
                {...fieldProps("title", "project-title")}
              />
            </Field>

            <Field label="承担角色" htmlFor="project-role" error={errors.role}>
              <input
                id="project-role"
                type="text"
                required
                maxLength={60}
                autoComplete="off"
                placeholder="例如：全栈开发 / 独立负责"
                className={cn(inputClass, "h-10")}
                {...fieldProps("role", "project-role")}
              />
            </Field>
          </div>

          <Field
            label="项目周期"
            htmlFor="project-period-start"
            error={errors.periodStart ?? errors.periodEnd}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input
                id="project-period-start"
                type="month"
                required
                aria-label="开始月份"
                className={cn(inputClass, "h-10")}
                {...fieldProps("periodStart", "project-period-start")}
              />
              <span aria-hidden className="text-meta text-muted-foreground">
                —
              </span>
              <input
                id="project-period-end"
                type="month"
                required
                aria-label="结束月份"
                className={cn(inputClass, "h-10")}
                {...fieldProps("periodEnd", "project-period-start")}
              />
            </div>
          </Field>

          <Field
            label="项目简介"
            htmlFor="project-description"
            hint={`${draft.description.length}/600`}
            error={errors.description}
          >
            <textarea
              id="project-description"
              rows={3}
              required
              maxLength={600}
              placeholder="用两三句话说明解决的问题与最终成果。"
              className={cn(inputClass, "scroll-thin resize-y py-2.5 leading-relaxed")}
              {...fieldProps("description", "project-description")}
            />
          </Field>

          <Field
            label="技术栈"
            htmlFor="project-tags"
            hint="逗号分隔，最多 12 个"
            error={errors.tags}
          >
            <input
              id="project-tags"
              type="text"
              required
              autoComplete="off"
              placeholder="React, FastAPI, Docker"
              className={cn(inputClass, "h-10")}
              {...fieldProps("tags", "project-tags")}
            />
          </Field>

          <Field
            label="项目亮点"
            htmlFor="project-highlights"
            hint={`每行一条，${splitList(draft.highlights, /\n/).length}/8`}
            error={errors.highlights}
          >
            <textarea
              id="project-highlights"
              rows={4}
              required
              placeholder={"完成数据采集与矫正算法的端侧闭环\n把部署时间从 30 分钟压缩到 5 分钟"}
              className={cn(inputClass, "scroll-thin resize-y py-2.5 leading-relaxed")}
              {...fieldProps("highlights", "project-highlights")}
            />
          </Field>

          <Field label="仓库链接" htmlFor="project-repo" hint="选填" error={errors.repoUrl}>
            <input
              id="project-repo"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://github.com/..."
              className={cn(inputClass, "h-10")}
              {...fieldProps("repoUrl", "project-repo")}
            />
          </Field>

          {serverError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-meta text-destructive"
            >
              {serverError}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={requestClose}
            disabled={submitting}
            className="h-10 rounded-xl px-4"
          >
            取消
          </Button>
          <Button type="submit" size="lg" disabled={submitting} className="h-10 rounded-xl px-4">
            {submitting ? "保存中…" : "保存项目"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
