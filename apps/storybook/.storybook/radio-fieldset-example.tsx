import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@yami/design-system";

export function BillingPeriod({ locale }: { locale: "zh" | "en" }) {
  const id = useId();
  const zh = locale === "zh";
  return <fieldset style={{ minWidth: 0, border: 0, margin: 0, padding: 0 }}>
    <legend id={id} style={{ padding: 0, fontWeight: "var(--font-weight-emphasize)" }}>
      {zh ? "订阅周期" : "Subscription plan"}
    </legend>
    <p id={id + "-hint"} style={{ color: "var(--text-secondary)" }}>
      {zh ? "选择适合你的计费周期。" : "Choose how often you want to be billed."}
    </p>
    <RadioGroup aria-labelledby={id} aria-describedby={id + "-hint"} name="billing" defaultValue="monthly">
      {[
        ["monthly", zh ? "每月" : "Monthly"],
        ["yearly", zh ? "每年" : "Yearly"],
        ["lifetime", zh ? "一次付清" : "Lifetime"],
      ].map(([value, label]) => <label key={value} style={{
        display: "flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)",
      }}><RadioGroupItem value={value} />{label}</label>)}
    </RadioGroup>
  </fieldset>;
}
