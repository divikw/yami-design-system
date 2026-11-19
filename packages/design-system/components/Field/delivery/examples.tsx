import { useState } from "react";
import {
  Button, Checkbox, Divider, Field, FieldGroup, FieldLabel, FieldLegend,
  FieldSet, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea,
} from "@yami/design-system";

export function DeliveryPreferences({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const zh = locale === "zh";
  const [saved, setSaved] = useState(false);
  const [doorbell, setDoorbell] = useState(true);
  const deliveryOptions = [
    { value: "door", label: zh ? "送至门口" : "At the door" },
    { value: "reception", label: zh ? "交给前台" : "At reception" },
  ];
  return <form style={{ width: "100%", maxWidth: "30rem", marginInline: "auto" }}
    onChange={() => setSaved(false)} onReset={() => {
      setSaved(false);
      setDoorbell(true);
    }}
    onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
    <FieldGroup>
      <FieldSet>
        <FieldLegend>{zh ? "收件信息" : "Recipient details"}</FieldLegend>
        <FieldGroup layout="responsive">
          <Field name="recipient">
            <FieldLabel>{zh ? "收件人（必填）" : "Recipient (required)"}</FieldLabel>
            <Input density="compact" fullWidth required autoComplete="name" />
          </Field>
          <Field name="delivery">
            <FieldLabel>{zh ? "送达位置" : "Drop-off location"}</FieldLabel>
            <Select defaultValue="door" items={deliveryOptions} onValueChange={() => setSaved(false)}>
              <SelectTrigger style={{ width: "100%" }}><SelectValue /></SelectTrigger>
              <SelectContent>{deliveryOptions.map(item =>
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              )}</SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Divider />
      <FieldSet>
        <FieldLegend>{zh ? "配送偏好" : "Delivery preferences"}</FieldLegend>
        <FieldGroup>
          <Field name="ring" orientation="horizontal">
            <Checkbox checked={doorbell} onCheckedChange={(checked) => {
              setDoorbell(checked);
              setSaved(false);
            }} />
            <FieldLabel>{zh ? "送达时按门铃" : "Ring the doorbell on arrival"}</FieldLabel>
          </Field>
          <Field name="notes">
            <FieldLabel>{zh ? "配送备注" : "Delivery notes"}</FieldLabel>
            <Textarea rows={3} maxLength={120}
              placeholder={zh ? "可填写楼层、门牌等信息，最多 120 字。" : "Include the floor or unit number, up to 120 characters."} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <div style={{ display: "flex", gap: "var(--space-100)" }}>
        <Button htmlType="submit" size="sm">{zh ? "保存" : "Save"}</Button>
        <Button htmlType="reset" size="sm" variant="secondary">{zh ? "重置" : "Reset"}</Button>
      </div>
      {saved && <span role="status">{zh ? "示例已保存" : "Example saved"}</span>}
    </FieldGroup>
  </form>;
}
