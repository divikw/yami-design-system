"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@yami/design-system";

export function RemoveItem({ trigger, remove, undo }: { trigger: string; remove: string; undo: string }) {
  const [removed, setRemoved] = useState(false);
  if (removed) return <Button size="sm" variant="secondary" onClick={() => setRemoved(false)}>{undo}</Button>;
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem variant="destructive" onClick={() => setRemoved(true)}><Trash2 aria-hidden="true" />{remove}</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
