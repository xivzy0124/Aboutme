"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, GitFork, RotateCw, Star } from "lucide-react";

import { fetchTrending, type Period, type TrendingResponse } from "@/lib/github";
import { cn } from "@/lib/utils";

const periods: { value: Period; label: string; caption: string }[] = [
  { value: "daily", label: "日榜", caption: "最近 24 小时新建" },
  { value: "weekly", label: "周榜", caption: "最近 7 天新建" },
  { value: "monthly", label: "月榜", caption: "最近 30 天新建" },
];

function compactNumber(value: number) {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}k`;
}

/**
 * GitHub 宝藏项目榜单。
 * 三个接口（daily / weekly / monthly）共用一套 UI，切换时按周期缓存结果。
 */
export function GithubTrending({ className }: { className?: string }) {
  const [period, setPeriod] = useState<Period>("daily");
  const [items, setItems] = useState<TrendingResponse["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const cache = useRef<Partial<Record<Period, TrendingResponse>>>({});

  useEffect(() => {
    const cached = cache.current[period];
    if (cached) {
      setItems(cached.items);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTrending(period, controller.signal)
      .then((response) => {
        cache.current[period] = response;
        setItems(response.items);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "榜单加载失败");
        setLoading(false);
      });

    return () => controller.abort();
  }, [period, reloadKey]);

  const refresh = () => {
    delete cache.current[period];
    setReloadKey((key) => key + 1);
  };

  const current = periods.find((item) => item.value === period);

  return (
    <section
      aria-label="GitHub 宝藏项目"
      className={cn(
        "rounded-2xl border bg-card/80 p-3.5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-kicker text-primary">GitHub</p>
          <h2 className="mt-1 text-card-title">宝藏项目</h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          aria-label="刷新榜单"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCw aria-hidden className={cn("size-3.5", loading && "animate-spin")} />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="榜单周期"
        className="mt-3 flex rounded-full bg-muted/60 p-1 text-[0.8125rem]"
      >
        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={period === item.value}
            onClick={() => setPeriod(item.value)}
            className={cn(
              "flex-1 rounded-full px-2 py-1.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              period === item.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-meta text-muted-foreground">
        {current?.caption} · 按 Star 排序
      </p>

      {loading ? (
        <ul aria-hidden className="mt-3 space-y-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="h-24 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </ul>
      ) : error ? (
        <div className="mt-3 rounded-xl border border-dashed p-4 text-center">
          <p className="text-meta text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-2 rounded-full border border-border px-3 py-1 text-meta transition-colors hover:bg-muted"
          >
            重试
          </button>
        </div>
      ) : (
        /* 固定行高 + 限高：默认只露出 5 条，其余在面板内滚动，不把页面撑长 */
        <ol className="scroll-thin mt-3 max-h-[31rem] space-y-1 overflow-y-auto overscroll-contain pr-1.5">
          {items.map((repo) => (
            <li key={repo.full_name} className="h-24 overflow-hidden">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full gap-2.5 rounded-xl px-2 py-2 transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mt-0.5 w-4 shrink-0 text-right font-mono text-meta text-muted-foreground tabular-nums">
                  {repo.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-ui font-medium">{repo.full_name}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </span>
                  {repo.description ? (
                    <span className="mt-0.5 line-clamp-2 block text-meta text-muted-foreground">
                      {repo.description}
                    </span>
                  ) : null}
                  <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star aria-hidden className="size-3" />
                      {compactNumber(repo.stars)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork aria-hidden className="size-3" />
                      {compactNumber(repo.forks)}
                    </span>
                    {repo.language ? (
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden className="size-2 rounded-full bg-primary/70" />
                        {repo.language}
                      </span>
                    ) : null}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
