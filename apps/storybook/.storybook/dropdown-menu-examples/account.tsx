"use client";

import { useState } from "react";
import { Avatar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@yami/design-system";

export function AccountSwitcher({ label, personal, family }: { label: string; personal: string; family: string }) {
  const [account, setAccount] = useState("personal");
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" form="icon" variant="tertiary" />} aria-label={label + " · " + (account === "personal" ? personal : family)}>
      <Avatar alt="" size="sm" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup aria-label={label} value={account} onValueChange={setAccount}>
        <DropdownMenuRadioItem value="personal">{personal}</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="family">{family}</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
