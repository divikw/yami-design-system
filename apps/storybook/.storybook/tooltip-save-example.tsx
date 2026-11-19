import { useState } from "react";
import { Check, Save } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";

export function SaveExample({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const [saved, setSaved] = useState(false);
  const label = locale === "zh" ? "保存" : "Save";
  const done = locale === "zh" ? "已保存" : "Saved";
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const Icon = saved ? Check : Save;
  return <TooltipProvider><Tooltip>
    <TooltipTrigger render={<Button form="icon" size="sm" variant="tertiary"
      aria-label={saved ? done : label} aria-keyshortcuts={mac ? "Meta+S" : "Control+S"}
      style={{ border: "var(--stroke-default) solid var(--border-default)" }}
      onClick={() => setSaved(true)} onKeyDown={(event) => {
        if ((mac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          setSaved(true);
        }
      }} />}>
      <Icon size={16} aria-hidden="true" />
    </TooltipTrigger>
    <TooltipContent>{saved ? done : label} <kbd>{mac ? "⌘ S" : "Ctrl S"}</kbd></TooltipContent>
  </Tooltip></TooltipProvider>;
}
