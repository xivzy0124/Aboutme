"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

type PillGeometry = {
  left: number;
  width: number;
  visible: boolean;
};

export function SiteHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [pill, setPill] = useState<PillGeometry>({ left: 0, width: 0, visible: false });

  /**
   * 高亮胶囊的位置不写死像素值，而是量取真实 DOM：
   * 字体加载完成、窗口缩放、语言切换后都能自动对齐。
   */
  useEffect(() => {
    const rail = navRef.current;
    if (!rail) return;

    const measure = () => {
      const active = rail.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) {
        setPill((current) => (current.visible ? { ...current, visible: false } : current));
        return;
      }
      setPill({ left: active.offsetLeft, width: active.offsetWidth, visible: true });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    rail.querySelectorAll("a").forEach((link) => observer.observe(link));
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, [pathname]);

  /** 指针位置写入 CSS 变量，玻璃上的折射光斑跟着光标走 */
  const handleSheen = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  /* 触屏设备没有 hover，改用长按展开灵动岛 */
  const [expanded, setExpanded] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const clearPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPress = (event: PointerEvent<HTMLAnchorElement>) => {
    /* 鼠标用户走 hover，长按只服务于触屏和触控笔 */
    if (event.pointerType === "mouse") return;
    clearPress();
    suppressClick.current = false;
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      /* 长按成功后要吃掉随之而来的 click，否则会直接跳转 */
      suppressClick.current = true;
      setExpanded((current) => !current);
    }, 300);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    suppressClick.current = false;
  };

  /* 展开后点空白处或滚动页面即收起 */
  useEffect(() => {
    if (!expanded) return;
    const close = () => setExpanded(false);
    window.addEventListener("pointerdown", close, { capture: true });
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", close, { capture: true });
      window.removeEventListener("scroll", close);
    };
  }, [expanded]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 pb-1.5 sm:px-4">
      <div
        onPointerMove={handleSheen}
        className="glass-bar nav-shell relative mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-2 rounded-[1.75rem] pr-2 pl-2"
      >
        <span aria-hidden className="nav-sheen" />

        {/* 灵动岛：深色胶囊，悬停或键盘聚焦后展开显示状态 */}
        <Link
          href="/"
          title={`${site.name} · 主页`}
          onPointerDown={startPress}
          onPointerUp={clearPress}
          onPointerCancel={clearPress}
          onPointerLeave={clearPress}
          onClick={handleClick}
          onContextMenu={(event) => {
            if (suppressClick.current) event.preventDefault();
          }}
          className="island group relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-full pr-2.5 pl-1.5 outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden
            className="island-orb grid size-7 shrink-0 place-items-center rounded-full text-[0.8125rem] leading-none font-semibold text-primary-foreground"
          >
            {site.name.slice(0, 1)}
          </span>
          <span className="flex items-center">
            <span className="hidden text-[0.8125rem] font-semibold tracking-tight whitespace-nowrap text-white/90 min-[360px]:inline">
              {site.name}
            </span>
            <span className="hidden grid-cols-[0fr] overflow-hidden transition-[grid-template-columns] duration-500 ease-soft group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] sm:grid">
              <span className="min-w-0 overflow-hidden">
                <span className="flex items-center gap-1.5 pl-2 text-[0.75rem] whitespace-nowrap text-white/55">
                  <span aria-hidden className="h-3 w-px shrink-0 bg-white/20" />
                  <span aria-hidden className="island-dot shrink-0" />
                  2027 届 · 求职中
                </span>
              </span>
            </span>
          </span>

          {/* 手机端长按后从岛下方展开的状态卡：绝对定位，不挤压导航栏布局 */}
          <span
            aria-hidden
            className={cn(
              "island pointer-events-none absolute top-[calc(100%+0.5rem)] left-0 z-20 flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.75rem] whitespace-nowrap text-white/70 transition duration-300 ease-soft sm:hidden",
              expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            )}
          >
            <span aria-hidden className="island-dot shrink-0" />
            2027 届 · 软件工程 · 求职中
          </span>
        </Link>

        <div className="relative z-10 flex items-center gap-1.5">
          <nav ref={navRef} aria-label="主导航" className="nav-rail relative flex items-center rounded-full p-1">
            <span
              aria-hidden
              className="nav-pill"
              style={{ left: pill.left, width: pill.width, opacity: pill.visible ? 1 : 0 }}
            />
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-10 inline-flex h-10 items-center justify-center rounded-full px-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:px-3.5 sm:text-ui",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <span aria-hidden className="hidden h-5 w-px bg-border/70 sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
