/**
 * 文章正文渲染：按空行分段，支持 "## " 二级标题与 "- " 列表。
 *
 * 不引入 Markdown 依赖，避免为简单排版增加体积；
 * 后续接入富文本编辑器时可整体替换此组件。
 */
export function PostContent({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="mt-8 flex flex-col gap-5">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="mt-4 text-title">
              {block.slice(3)}
            </h2>
          );
        }

        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="flex max-w-[68ch] flex-col gap-2.5">
              {lines.map((line) => (
                <li key={line} className="flex gap-3 text-body text-foreground/80">
                  <span
                    aria-hidden
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50"
                  />
                  <span className="min-w-0">{line.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="max-w-[68ch] text-body text-foreground/80">
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}
