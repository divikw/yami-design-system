import { useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@yami/design-system";

export function PlanCards({ locale }: { locale: "zh" | "en" }) {
  const id = useId();
  const [plan, setPlan] = useState<string | null>("plus");
  const zh = locale === "zh";
  const plans = [
    ["plus", "Plus", zh ? "适合个人和小型团队。" : "For individuals and small teams."],
    ["pro", "Pro", zh ? "适合成长中的团队。" : "For growing teams."],
    ["enterprise", zh ? "企业版" : "Enterprise", zh ? "适合跨部门协作。" : "For teams across an organization."],
  ];
  return <RadioGroup aria-label={zh ? "选择方案" : "Choose a plan"} value={plan} onValueChange={setPlan}>
    {plans.map(([value, title, hint]) => <label key={value} style={{
      display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start",
      gap: "var(--space-050) var(--space-150)", padding: "var(--space-100)",
      lineHeight: "var(--line-height-body-md)", borderRadius: "var(--radius-component-default)",
      border: "var(--stroke-default) solid", borderColor: value === plan ? "var(--text-primary)" : "var(--border-default)",
      cursor: "pointer",
    }}>
      <span id={id + value}>{title}</span>
      <RadioGroupItem value={value} aria-labelledby={id + value} aria-describedby={id + value + "-hint"} />
      <span id={id + value + "-hint"} style={{ gridColumn: 1, color: "var(--text-secondary)" }}>{hint}</span>
    </label>)}
  </RadioGroup>;
}
