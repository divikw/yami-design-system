import { Textarea, type TextareaProps } from "./Textarea";

export function NotesTextarea({ locale = "zh", disabled, ...props }: TextareaProps & { locale?: "zh" | "en" }) {
  const en = locale === "en";
  return <label style={{ display: "grid", gap: "var(--space-050)", maxInlineSize: "30rem" }}>
    <span style={{ fontSize: "var(--font-size-caption-md)", lineHeight: "var(--line-height-caption-md)", color: disabled ? "var(--text-disabled)" : "var(--text-primary)", fontWeight: "var(--font-weight-emphasize)" }}>
      {en ? "Order notes" : "订单备注"}
    </span>
    <Textarea disabled={disabled} placeholder={en ? "Add a note for your order" : "填写订单备注"} {...props} />
  </label>;
}
