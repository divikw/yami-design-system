"use client";

import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@yami/design-system";

export function PinShortcut({ trigger, pin, unpin }: { trigger: string; pin: string; unpin: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  function togglePin() {
    setPinned(value => !value);
    setOpen(false);
  }
  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent onKeyDown={event => {
      if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        togglePin();
      }
    }}>
      <DropdownMenuItem onClick={togglePin} aria-keyshortcuts="Shift+P">
        {pinned ? unpin : pin}<DropdownMenuShortcut>Shift + P</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
