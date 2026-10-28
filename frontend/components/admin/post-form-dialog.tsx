"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createPost, updatePost, type Post, type PostInput } from "@/lib/posts-api";
import { ApiError } from "@/lib/projects-api";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string;
  publishedAt: string;
};

type FieldErrors = Partial<Record<keyof Draft, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const SERVER_FIELD_MAP: Record<string, keyof Draft> = {
  title: "title",
  slug: "slug",
  summary: "summary",
  content: "content",
  tags: "tags",
  published_at: "publishedAt",
};

/** 今天（本地时区）作为新增文章的默认发布日期。 */
function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function toDraft(post: Post): Draft {
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    tags: post.tags.join(", "),
    publishedAt: post.publishedAt,
  };
}

function splitTags(value: string): string[] {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildInput(draft: Draft): { errors: FieldErrors; input?: PostInput } {
  const errors: FieldErrors = {};

  const title = draft.title.trim();
  if (title.length < 2 || title.length > 80) errors.title = "标题需要 2–80 个字符。";

  const slug = draft.slug.trim().toLowerCase();
  if (slug && (!SLUG_PATTERN.test(slug) || slug.length > 80)) {
    errors.slug = "路径只能包含小写字母、数字与连字符，长度不超过 80。";
  }

  const summary = draft.summary.trim();
  if (summary.length < 10 || summary.length > 300) errors.summary = "摘要需要 10–300 个字符。";

  const content = draft.content.trim();
  if (content.length === 0) errors.content = "请填写正文。";
  else if (content.length > 20000) errors.content = "正文不能超过 20000 个字符。";

  const tags = splitTags(draft.tags);
  if (tags.length > 8) errors.tags = "最多填写 8 个标签。";
  else if (tags.some((tag) => tag.length > 24)) errors.tags = "单个标签不能超过 24 个字符。";

  if (!DATE_PATTERN.test(draft.publishedAt)) {
    errors.publishedAt = "请选择发布日期。";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    input: {
      title,
      slug: slug || undefined,
      summary,
      content,
      tags,
      publishedAt: draft.publishedAt,
    },
  };
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 text-ui text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
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

/** 文章新增 / 编辑弹窗；编辑时 slug 只读展示，避免已发布链接失效。 */
export function PostFormDialog({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (post: Post) => void;
  initial?: Post;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() =>
    initial
      ? toDraft(initial)
      : { title: "", slug: "", summary: "", content: "", tags: "", publishedAt: today() },
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const editing = Boolean(initial);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const update = (key: keyof Draft) => (value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const requestClose = () => {
    if (!submitting) onClose();
  };

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
      const post = initial ? await updatePost(initial.slug, input) : await createPost(input);
      onSaved(post);
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 401) {
          setServerError("登录已过期，请重新登录后再保存。");
          return;
        }
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
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="project-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 pt-5 pb-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-kicker text-primary">Blog · {editing ? "编辑" : "新建"}</p>
            <h2 id={titleId} className="mt-1.5 text-title">
              {editing ? "编辑文章" : "新建文章"}
            </h2>
            <p className="mt-1 text-meta text-muted-foreground">
              正文按空行分段，支持「## 二级标题」与「- 列表项」。
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
            <Field label="文章标题" htmlFor="post-title" error={errors.title}>
              <input
                id="post-title"
                type="text"
                required
                maxLength={80}
                autoComplete="off"
                placeholder="例如：把个人站点改成全栈应用"
                className={cn(inputClass, "h-10")}
                {...fieldProps("title", "post-title")}
              />
            </Field>

            <Field
              label="路径"
              htmlFor="post-slug"
              hint={editing ? "创建后不可修改" : "选填，留空自动生成"}
              error={errors.slug}
            >
              <input
                id="post-slug"
                type="text"
                readOnly={editing}
                autoComplete="off"
                spellCheck={false}
                placeholder="hello-world"
                className={cn(inputClass, "h-10 font-mono", editing && "text-muted-foreground")}
                {...fieldProps("slug", "post-slug")}
              />
            </Field>
          </div>

          <Field
            label="摘要"
            htmlFor="post-summary"
            hint={`${draft.summary.length}/300`}
            error={errors.summary}
          >
            <textarea
              id="post-summary"
              rows={3}
              required
              maxLength={300}
              placeholder="一两句话概括这篇文章讲了什么，会显示在列表页。"
              className={cn(inputClass, "scroll-thin resize-y py-2.5 leading-relaxed")}
              {...fieldProps("summary", "post-summary")}
            />
          </Field>

          <Field
            label="正文"
            htmlFor="post-content"
            hint={`${draft.content.length}/20000`}
            error={errors.content}
          >
            <textarea
              id="post-content"
              rows={10}
              required
              maxLength={20000}
              placeholder={"第一段内容。\n\n## 小标题\n\n第二段内容。\n\n- 列表项一\n- 列表项二"}
              className={cn(inputClass, "scroll-thin resize-y py-2.5 font-mono leading-relaxed")}
              {...fieldProps("content", "post-content")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="标签" htmlFor="post-tags" hint="逗号分隔，最多 8 个" error={errors.tags}>
              <input
                id="post-tags"
                type="text"
                autoComplete="off"
                placeholder="运维, Docker"
                className={cn(inputClass, "h-10")}
                {...fieldProps("tags", "post-tags")}
              />
            </Field>

            <Field label="发布日期" htmlFor="post-date" error={errors.publishedAt}>
              <input
                id="post-date"
                type="date"
                required
                className={cn(inputClass, "h-10")}
                {...fieldProps("publishedAt", "post-date")}
              />
            </Field>
          </div>

          {serverError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-meta text-destructive"
            >
              {serverError}
              {serverError.includes("登录") ? (
                <Link
                  href="/admin/login?next=/admin/blog"
                  className="ml-1 font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                >
                  去登录
                </Link>
              ) : null}
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
            {submitting ? "保存中…" : editing ? "保存修改" : "发布文章"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
