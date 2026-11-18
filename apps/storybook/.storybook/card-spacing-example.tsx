import { useState, type CSSProperties, type ReactNode } from "react";
import { Button, ButtonGroup, Card } from "@yami/design-system";

const defaultSpacing = "var(--space-200)";
const spacings = [
  { label: "8px", value: "var(--space-100)" },
  { label: "16px", value: defaultSpacing },
  { label: "20px", value: "var(--space-250)" },
  { label: "24px", value: "var(--space-300)" },
  { label: "32px", value: "var(--space-400)" },
];

export function CardSpacingExample({ label, children }: { label: string; children: ReactNode }) {
  const [spacing, setSpacing] = useState(defaultSpacing);
  return (
    <div style={{ display: "grid", gap: "var(--space-200)" }}>
      <ButtonGroup aria-label={label}>
        {spacings.map(({ label, value }) => (
          <Button key={value} size="sm" variant={spacing === value ? "primary" : "secondary"}
            aria-pressed={spacing === value} onClick={() => setSpacing(value)}>
            {label}
          </Button>
        ))}
      </ButtonGroup>
      <Card as="article" surface="secondary" style={{ "--card-spacing": spacing } as CSSProperties}>
        {children}
      </Card>
    </div>
  );
}
