import { useId, useState } from "react";
import { Switch } from "@yami/design-system";

export function TermsSwitch({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const id = useId();
  const [accepted, setAccepted] = useState(false);
  return <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "var(--space-200)" }}>
    <div style={{ display: "grid", gap: "var(--space-050)" }}>
      <label htmlFor={id} style={{ color: accepted ? "var(--text-primary)" : "var(--text-error)" }}>
        {zh ? "接受预购条款" : "Accept preorder terms"}
      </label>
      {!accepted && <span id={id + "-error"} style={{ color: "var(--text-secondary)" }}>
        {zh ? "请先接受预购条款，再提交订单。" : "Accept the preorder terms to place your order."}
      </span>}
    </div>
    <Switch id={id} required checked={accepted} onCheckedChange={setAccepted}
      aria-invalid={!accepted} aria-describedby={accepted ? undefined : id + "-error"} />
  </div>;
}
