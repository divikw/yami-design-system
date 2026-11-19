import { useId } from "react";

import { Checkbox } from "@yami/design-system";

export function CheckboxOverview({ labels }: { labels: {
  offers: string;
  shipping: string;
  shippingHelp: string;
  sms: string;
  restock: string;
  restockHelp: string;
} }) {
  const id = useId();
  const options = [
    { key: "offers", label: labels.offers },
    { key: "shipping", label: labels.shipping, description: labels.shippingHelp, checked: true },
    { key: "sms", label: labels.sms, disabled: true },
    { key: "restock", label: labels.restock, description: labels.restockHelp, bordered: true },
  ];

  return (
    <div style={{ display: "grid", gap: "var(--space-250)", paddingBlock: "var(--space-200)" }}>
      {options.map(({ key, label, description, checked, disabled, bordered }) => {
        const optionId = `${id}-${key}`;
        return (
          <label key={key} htmlFor={optionId} style={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            alignItems: "start",
            columnGap: "var(--space-100)",
            padding: bordered ? "var(--space-100)" : undefined,
            border: bordered ? "var(--stroke-default) solid var(--border-default)" : undefined,
            borderRadius: bordered ? "var(--radius-component-default)" : undefined,
            background: bordered ? "var(--fill-tertiary)" : undefined,
            color: disabled ? "var(--text-disabled)" : "var(--text-primary)",
          }}>
            <Checkbox id={optionId} defaultChecked={checked} disabled={disabled}
              aria-labelledby={`${optionId}-label`}
              aria-describedby={description ? `${optionId}-description` : undefined} />
            <span style={{
              display: "grid", gap: "var(--space-050)",
              lineHeight: "var(--line-height-body-md)",
            }}>
              <span id={`${optionId}-label`} style={{ fontWeight: "var(--font-weight-emphasize)" }}>{label}</span>
              {description && <span id={`${optionId}-description`} style={{ color: "var(--text-secondary)" }}>{description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
