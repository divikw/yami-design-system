"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@yami/design-system/components/Button";

export function ButtonExample() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-100)" }}>
      <Button onClick={() => setSaved(true)}>Save example</Button>
      <ButtonLink href="#example-order" variant="secondary">View example order</ButtonLink>
      <output aria-live="polite">{saved ? "Example saved" : "No example changes"}</output>
    </div>
  );
}
