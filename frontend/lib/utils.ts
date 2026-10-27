import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 项目在 globals.css 里定义了一套自定义字号令牌（text-display / text-body …）。
 * tailwind-merge 默认把非标准 text-* 当成文字颜色，遇到 text-foreground 之类的颜色类
 * 会误删字号，因此这里显式把它们登记进 font-size 组。
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "kicker",
            "meta",
            "ui",
            "copy",
            "body",
            "lede",
            "card-title",
            "title",
            "display",
            "stat",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
