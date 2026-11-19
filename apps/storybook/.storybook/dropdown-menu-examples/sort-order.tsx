"use client";

import { useState } from "react";
import { Clock, ArrowDownAZ } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@yami/design-system";

export function SortOrder({ trigger, recent, name, icons = false }: { trigger: string; recent: string; name: string; icons?: boolean }) {
  const [sort, setSort] = useState("recent");
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuRadioGroup aria-label={trigger} value={sort} onValueChange={setSort}>
        <DropdownMenuRadioItem value="recent">{icons && <Clock aria-hidden="true" />}{recent}</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="name">{icons && <ArrowDownAZ aria-hidden="true" />}{name}</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
