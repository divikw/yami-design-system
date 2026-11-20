import { useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@yami/design-system";

export function NotificationPreference({ locale }: { locale: "zh" | "en" }) {
  const id = useId();
  const [value, setValue] = useState<string | null>(null);
  const invalid = value === null;
  const zh = locale === "zh";
  return <fieldset style={{ minWidth: 0, border: 0, margin: 0, padding: 0 }}>
    <legend id={id} style={{ padding: 0, marginBottom: "var(--space-150)" }}>
      {zh ? "通知偏好" : "Notification preferences"}
    </legend>
    <RadioGroup aria-labelledby={id} aria-describedby={invalid ? id + "-error" : undefined}
      aria-invalid={invalid} name="notifications" required value={value} onValueChange={setValue}>
      {[
        ["email", zh ? "仅邮件" : "Email only"],
        ["sms", zh ? "仅短信" : "SMS only"],
        ["both", zh ? "邮件和短信" : "Email and SMS"],
      ].map(([option, label]) => <label key={option} style={{
        display: "flex", alignItems: "center", columnGap: "var(--space-050)", lineHeight: "var(--line-height-body-md)",
      }}><RadioGroupItem value={option} aria-invalid={invalid} />{label}</label>)}
    </RadioGroup>
    {invalid && <p id={id + "-error"} style={{ color: "var(--text-error)", marginBlock: "var(--space-150) 0" }}>
      {zh ? "请选择一种通知方式。" : "Choose a notification preference."}
    </p>}
  </fieldset>;
}
