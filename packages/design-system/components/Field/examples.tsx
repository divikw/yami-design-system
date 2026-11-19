import { Textarea } from "../Textarea";
import { Field, FieldError, FieldLabel, type FieldProps } from "./Field";

export function NotesField({ locale = "zh", ...props }: FieldProps & { locale?: "zh" | "en" }) {
  const en = locale === "en";
  return <Field name="notes" validationMode="onBlur" style={{ maxInlineSize: "30rem" }} {...props}>
    <FieldLabel>{en ? "Delivery notes (required)" : "配送备注（必填）"}</FieldLabel>
    <Textarea required maxLength={120} placeholder={en ? "Add any drop-off instructions, up to 120 characters." : "填写送达说明，最多 120 字。"} />
    <FieldError match="valueMissing">{en ? "Enter your delivery notes." : "请输入配送备注。"}</FieldError>
  </Field>;
}
