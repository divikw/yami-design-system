"use client";

import { useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@yami/design-system";

export function ListActions({ trigger, group, pin, unpin, unavailable, icons = false }: {
  trigger: string; group: string; pin: string; unpin: string; unavailable: string; icons?: boolean;
}) {
  const [pinned, setPinned] = useState(false);
  const Icon = pinned ? PinOff : Pin;
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel inset={icons}>{group}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setPinned(!pinned)}>
          {icons && <Icon aria-hidden="true" />}{pinned ? unpin : pin}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled inset={icons}>{unavailable}</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
