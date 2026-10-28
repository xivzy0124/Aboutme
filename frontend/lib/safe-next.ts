/** 只允许站内相对路径，防止 ?next=https://evil 造成开放重定向。 */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}
