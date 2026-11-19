import { useId, useState } from "react";
import { Switch } from "@yami/design-system";

export function Preference({ title, description, card = false, defaultChecked = false }: {
  title: string;
  description: string;
  card?: boolean;
  defaultChecked?: boolean;
}) {
  const id = useId();
  const [checked, setChecked] = useState(defaultChecked);
  return <label htmlFor={id} style={{
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-200)",
    cursor: "pointer",
    ...(card && {
      padding: "var(--space-150)", borderRadius: "var(--radius-component-default)",
      border: "var(--stroke-default) solid var(--border-default)",
      background: checked ? "var(--surface-secondary)" : "var(--surface-primary)",
    }),
  }}>
    <span style={{ display: "grid", gap: "var(--space-050)" }}>
      <strong id={id + "-label"}>{title}</strong>
      <span id={id + "-help"} style={{ color: "var(--text-secondary)" }}>{description}</span>
    </span>
    <Switch id={id} checked={checked} onCheckedChange={setChecked}
      aria-labelledby={id + "-label"} aria-describedby={id + "-help"} />
  </label>;
}
