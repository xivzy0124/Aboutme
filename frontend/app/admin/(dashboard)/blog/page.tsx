"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, PenLine, Plus, Trash2 } from "lucide-react";

import { PostFormDialog } from "@/components/admin/post-form-dialog";
import { Button } from "@/components/ui/button";
import { deletePost, fetchPosts, type Post } from "@/lib/posts-api";
import { ApiError } from "@/lib/projects-api";

const formatDate = (iso: string) => iso.replaceAll("-", ".");

/** 后台博客列表：新建、编辑、两步确认删除。 */
export default function AdminBlogPage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // 只在异步回调里更新状态，避免 effect 同步 setState
    const controller = new AbortController();

    fetchPosts(controller.signal)
      .then((data) => setItems(data))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof ApiError ? reason.message : "加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((post: Post) => {
    setEditing(post);
    setDialogOpen(true);
  }, []);

  const handleSaved = useCallback((post: Post) => {
    setItems((previous) => {
      const exists = previous.some((item) => item.slug === post.slug);
      const next = exists
        ? previous.map((item) => (item.slug === post.slug ? post : item))
        : [post, ...previous];
      // 与后端一致：按发布日期倒序
      return next.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    });
    setDialogOpen(false);
    setStatus(`已保存「${post.title}」`);
  }, []);

  async function handleDelete(slug: string) {
    setDeleting(slug);
    setError("");

    try {
      await deletePost(slug);
      setItems((previous) => previous.filter((item) => item.slug !== slug));
      setStatus("该文章已删除");
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        router.replace("/admin/login?next=/admin/blog");
        return;
      }
      setError(reason instanceof ApiError ? reason.message : "删除失败，请稍后重试。");
    } finally {
      setDeleting(null);
      setPendingDelete(null);
    }
  }

  return (
    <section aria-labelledby="admin-blog-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="admin-blog-title" className="text-card-title">
            文章列表
          </h2>
          <p className="mt-1 text-meta text-muted-foreground">
            {loading ? "正在加载…" : `共 ${items.length} 篇文章，发布后立即出现在博客页。`}
          </p>
        </div>
        <Button size="lg" onClick={openCreate} className="h-9 rounded-xl px-3">
          <Plus className="size-4" aria-hidden />
          新建文章
        </Button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-meta text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/50 p-6 text-meta text-muted-foreground">
          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
          正在读取文章数据…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
          <PenLine className="mx-auto size-5 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-card-title">还没有文章</p>
          <p className="mt-1.5 text-copy text-muted-foreground">新建第一篇后会出现在博客列表中。</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60">
          {items.map((post) => (
            <li
              key={post.slug}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <time
                    dateTime={post.publishedAt}
                    className="font-mono text-meta text-muted-foreground tabular-nums"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                  <h3 className="text-card-title">{post.title}</h3>
                </div>
                <p className="mt-1 line-clamp-2 text-copy text-muted-foreground">{post.summary}</p>
                {post.tags.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs leading-5 text-foreground/70"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {pendingDelete === post.slug ? (
                  <>
                    <span className="text-meta text-muted-foreground">确认删除？</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting === post.slug}
                      onClick={() => handleDelete(post.slug)}
                    >
                      {deleting === post.slug ? "删除中…" : "确认"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(null)}
                      disabled={deleting === post.slug}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                      <Pencil className="size-3.5" aria-hidden />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(post.slug)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      删除
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <PostFormDialog
        key={editing?.slug ?? "create"}
        open={dialogOpen}
        initial={editing ?? undefined}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
