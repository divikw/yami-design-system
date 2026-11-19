import { X } from "lucide-react";
import { Button, Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@yami/design-system";

export function KeyboardHelp({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const title = zh ? "快捷键" : "Keyboard shortcuts";

  return <div style={{ display: "flex", justifyContent: "center" }}>
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="secondary" />}>{title}</PopoverTrigger>
      <PopoverContent>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-100)" }}>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverClose render={
            <Button form="icon" size="sm" variant="tertiary" aria-label={zh ? "关闭" : "Close"}
              style={{
                width: "var(--space-200)", height: "var(--space-200)",
                borderRadius: "var(--radius-sm)", backgroundColor: "var(--button-tertiary)",
              }} />
          }>
            <X size={16} aria-hidden="true" />
          </PopoverClose>
        </div>
        <PopoverDescription style={{ marginBlockStart: "var(--space-100)" }}>
          {zh ? "按 Esc 关闭浮层并返回触发按钮。" : "Press Escape to close the popover and return to the trigger."}
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  </div>;
}
