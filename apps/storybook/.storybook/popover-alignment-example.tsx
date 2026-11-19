import { Button, Popover, PopoverContent, PopoverTrigger } from "@yami/design-system";

export function PopoverAlignment({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const options = [
    { align: "start", label: zh ? "起始" : "Start", message: zh ? "与起始边对齐" : "Aligned to start" },
    { align: "center", label: zh ? "居中" : "Center", message: zh ? "与中心对齐" : "Aligned to center" },
    { align: "end", label: zh ? "末端" : "End", message: zh ? "与末端对齐" : "Aligned to end" },
  ] as const;

  return <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "var(--space-100)" }}>
    {options.map(({ align, label, message }) => <Popover key={align}>
      <PopoverTrigger render={<Button size="sm" variant="tertiary" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>
        {label}
      </PopoverTrigger>
      <PopoverContent align={align} aria-label={message} style={{ width: 160, fontSize: "var(--font-size-body-md)", lineHeight: "var(--line-height-body-md)" }}>
        {message}
      </PopoverContent>
    </Popover>)}
  </div>;
}
