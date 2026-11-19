import { useId, useState } from "react";
import { Switch } from "@yami/design-system";

export function TermsSwitch({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const id = useId();
  const [accepted, setAccepted] = useState(false);
  return <div style={{ display: "grid", gap: "var(--space-050)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-200)" }}>
      <label htmlFor={id}>{zh ? "接受预购条款" : "Accept preorder terms"}</label>
      <Switch id={id} required checked={accepted} onCheckedChange={setAccepted}
        aria-invalid={!accepted || undefined} aria-describedby={accepted ? undefined : id + "-error"} />
    </div>
    {!accepted && <span id={id + "-error"} role="alert" style={{
      color: "var(--text-error)", fontSize: "var(--font-size-caption-md)", lineHeight: "var(--line-height-caption-md)",
    }}>{zh ? "请先接受预购条款，再提交订单。" : "Accept the preorder terms to place your order."}</span>}
  </div>;
}
