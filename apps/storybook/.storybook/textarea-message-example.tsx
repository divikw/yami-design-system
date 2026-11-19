import { useState } from "react";
import { Button, Field, FieldGroup, FieldLabel, Textarea } from "@yami/design-system";

export function MessageForm({ locale }: { locale: "zh" | "en" }) {
  const [sent, setSent] = useState(false);
  const zh = locale === "zh";
  return <form onChange={() => setSent(false)} onSubmit={event => {
    event.preventDefault();
    event.currentTarget.reset();
    setSent(true);
  }}>
    <FieldGroup>
      <Field name="message">
        <FieldLabel>{zh ? "留言（必填）" : "Message (required)"}</FieldLabel>
        <Textarea required />
      </Field>
      <Button size="md" form="full" htmlType="submit">{zh ? "发送留言" : "Send message"}</Button>
      {sent && <span role="status">{zh ? "示例留言已提交" : "Demo message submitted"}</span>}
    </FieldGroup>
  </form>;
}
