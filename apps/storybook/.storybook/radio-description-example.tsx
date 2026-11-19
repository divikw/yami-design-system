import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@yami/design-system";

export function DensityDescriptions({ locale }: { locale: "zh" | "en" }) {
  const id = useId();
  const zh = locale === "zh";
  const choices = [
    ["default", zh ? "默认" : "Default", zh ? "适用于日常浏览。" : "Use the standard spacing for everyday browsing."],
    ["comfortable", zh ? "舒适" : "Comfortable", zh ? "增加选项之间的留白。" : "Give each option more room."],
    ["compact", zh ? "紧凑" : "Compact", zh ? "在一屏内显示更多内容。" : "Fit more content on screen."],
  ];
  return <RadioGroup aria-label={zh ? "显示密度" : "Display density"} defaultValue="comfortable">
    {choices.map(([value, title, hint]) => <label key={value} style={{
      display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "start",
      gap: "var(--space-050) var(--space-100)", lineHeight: "var(--line-height-body-md)",
    }}>
      <RadioGroupItem value={value} aria-labelledby={id + value} aria-describedby={id + value + "-hint"} />
      <span id={id + value}>{title}</span>
      <span id={id + value + "-hint"} style={{ gridColumn: 2, color: "var(--text-secondary)" }}>{hint}</span>
    </label>)}
  </RadioGroup>;
}
