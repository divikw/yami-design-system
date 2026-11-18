import { useId, useRef, useState } from "react";
import { Button, Checkbox } from "@yami/design-system";

export function ConsentForm({ label, submit, error, success }: {
  label: string; submit: string; error: string; success: string;
}) {
  const id = useId();
  const control = useRef<HTMLButtonElement>(null);
  const [result, setResult] = useState<"idle" | "invalid" | "accepted">("idle");
  const invalid = result === "invalid";
  return (
    <form noValidate style={{
      display: "grid", width: "min(100%, 18rem)", gridTemplateColumns: "auto minmax(0, 1fr) auto",
      alignItems: "center", rowGap: "var(--space-050)",
    }}
      onSubmit={(event) => {
        event.preventDefault();
        const accepted = new FormData(event.currentTarget).has("terms");
        setResult(accepted ? "accepted" : "invalid");
        if (!accepted) control.current?.focus();
      }}>
      <Checkbox ref={control} id={id} name="terms" value="accepted" required
        aria-invalid={invalid || undefined} aria-describedby={invalid ? id + "-error" : undefined}
        onCheckedChange={() => setResult("idle")} />
      <label htmlFor={id} style={{ marginInlineEnd: "var(--space-200)" }}>{label}</label>
      <Button htmlType="submit" size="sm">{submit}</Button>
      {result !== "idle" && (
        <span id={invalid ? id + "-error" : undefined} role={invalid ? "alert" : "status"}
          style={{ gridColumn: "2 / -1", color: invalid ? "var(--text-error)" : "var(--text-secondary)" }}>
          {invalid ? error : success}
        </span>
      )}
    </form>
  );
}
