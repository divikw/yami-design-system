import { Button } from "../Button";
import { DismissibleTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

export function HoverTooltip({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const en = locale === "en";
  return <TooltipProvider>
    <Tooltip>
      <TooltipTrigger render={<Button variant="tertiary" size="sm" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>
        {en ? "Hover" : "悬停"}
      </TooltipTrigger>
      <TooltipContent>{en ? "Add to library" : "添加到资料库"}</TooltipContent>
    </Tooltip>
  </TooltipProvider>;
}

export function LibraryHint({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const en = locale === "en";
  return <DismissibleTooltip
    trigger={<Button variant="secondary" size="sm">{en ? "Library tips" : "资料库提示"}</Button>}
    closeLabel={en ? "Close tip" : "关闭提示"}
  >
    {en ? "Save favorites to your library." : "可以将喜欢的内容添加到资料库。"}
  </DismissibleTooltip>;
}
