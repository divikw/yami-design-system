import { useState } from "react";
import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";

export function ExternalErrors({ en = false }: { en?: boolean }) {
  const [notes, setNotes] = useState("");
  const errors = [];
  if (!notes.trim()) errors.push({ message: en ? "Enter delivery notes." : "请输入配送备注。" });
  if (notes.trim().length < 5) errors.push({ message: en ? "Use at least 5 characters." : "配送备注至少需要 5 个字符。" });
  return <Field invalid={errors.length > 0}>
    <FieldLabel>{en ? "Delivery notes (required)" : "配送备注（必填）"}</FieldLabel>
    <Textarea required minLength={5} value={notes} onChange={event => setNotes(event.currentTarget.value)} />
    <FieldError errors={errors} />
  </Field>;
}
