import { useRef, useState } from "react";
import { Button, Input, Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@yami/design-system";

export function EditNickname({ locale }: { locale: "zh" | "en" }) {
  const [nickname, setNickname] = useState("");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const zh = locale === "zh";
  const title = zh ? "编辑昵称" : "Edit nickname";

  return <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-100)" }}>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button size="sm" variant="tertiary" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>{title}</PopoverTrigger>
      <PopoverContent ref={panelRef} initialFocus={(method) => method === "keyboard" ? true : panelRef.current}>
        <form style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--space-200)" }}
          onSubmit={(event) => {
            event.preventDefault();
            setNickname(String(new FormData(event.currentTarget).get("nickname") ?? "").trim());
            setOpen(false);
          }}>
          <PopoverTitle>{title}</PopoverTitle>
          <Input fullWidth name="nickname" label={zh ? "昵称" : "Nickname"} defaultValue={nickname} />
          <Button htmlType="submit">{zh ? "保存" : "Save"}</Button>
        </form>
      </PopoverContent>
    </Popover>
    {nickname && <p role="status" style={{ margin: 0, overflowWrap: "anywhere" }}>{zh ? "当前昵称：" : "Current nickname: "}{nickname}</p>}
  </div>;
}
