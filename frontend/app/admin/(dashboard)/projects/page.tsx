"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";

import { ProjectFormDialog } from "@/components/project-form-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, deleteProject, fetchProjects, type Project } from "@/lib/projects-api";

/** 后台项目列表：加载、编辑、两步确认删除，所有写操作走 /api/admin。 */
export default function AdminProjectsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // effect 只发起请求，状态更新都放在异步回调里，避免同步 setState 触发级联渲染
    const controller = new AbortController();

    fetchProjects(controller.signal)
      .then((data) => setItems(data))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof ApiError ? reason.message : "加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((project: Project) => {
    setEditing(project);
    setDialogOpen(true);
  }, []);

  const handleSaved = useCallback((project: Project) => {
    setItems((previous) => {
      const exists = previous.some((item) => item.slug === project.slug);
      return exists
        ? previous.map((item) => (item.slug === project.slug ? project : item))
        : [project, ...previous];
    });
    setDialogOpen(false);
    setStatus(`已保存「${project.title}」`);
  }, []);

  async function handleDelete(slug: string) {
    setDeleting(slug);
    setError("");

    try {
      await deleteProject(slug);
      setItems((previous) => previous.filter((item) => item.slug !== slug));
      setStatus("该项目已删除");
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        setError("登录已过期，请重新登录后再试。");
        router.replace("/admin/login?next=/admin/projects");
        return;
      }
      setError(reason instanceof ApiError ? reason.message : "删除失败，请稍后重试。");
    } finally {
      setDeleting(null);
      setPendingDelete(null);
    }
  }

  return (
    <section aria-labelledby="admin-projects-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="admin-projects-title" className="text-card-title">
            项目列表
          </h2>
          <p className="mt-1 text-meta text-muted-foreground">
            {loading ? "正在加载…" : `共 ${items.length} 个项目，编辑后公开页即时更新。`}
          </p>
        </div>
        <Button size="lg" onClick={openCreate} className="h-9 rounded-xl px-3">
          <Plus className="size-4" aria-hidden />
          新增项目
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
          正在读取项目数据…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-8 text-center">
          <p className="text-card-title">还没有项目</p>
          <p className="mt-1.5 text-copy text-muted-foreground">
            新增第一个项目后会出现在公开页面。
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60">
          {items.map((project) => (
            <li
              key={project.slug}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
            >
              <div className="min-w-0">
                <h3 className="text-card-title">{project.title}</h3>
                <p className="mt-1 text-meta text-muted-foreground">
                  {project.role} · {project.period}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 6).map((tag) => (
                    <li
                      key={tag}
                      className="rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs leading-5 text-foreground/70"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {pendingDelete === project.slug ? (
                  <>
                    <span className="text-meta text-muted-foreground">确认删除？</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting === project.slug}
                      onClick={() => handleDelete(project.slug)}
                    >
                      {deleting === project.slug ? "删除中…" : "确认"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(null)}
                      disabled={deleting === project.slug}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEdit(project)}>
                      <Pencil className="size-3.5" aria-hidden />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(project.slug)}
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

      {error ? (
        <Button variant="outline" size="sm" onClick={reload}>
          <RotateCw className="size-3.5" aria-hidden />
          重新加载
        </Button>
      ) : null}

      <ProjectFormDialog
        key={editing?.slug ?? "create"}
        open={dialogOpen}
        initial={editing ?? undefined}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
