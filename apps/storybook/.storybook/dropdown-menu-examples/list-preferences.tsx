"use client";

import { useState } from "react";
import { Bell, Settings, Slash } from "lucide-react";
import {
  Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@yami/design-system";

export function ListPreferences({ menu, purchased, settings, order, recent, name, notifications, email, push, unsubscribe }: {
  menu: string; purchased: string; settings: string; order: string; recent: string; name: string;
  notifications: string; email: string; push: string; unsubscribe: string;
}) {
  const [showPurchased, setShowPurchased] = useState(true);
  const [sort, setSort] = useState("recent");
  const [mail, setMail] = useState(true);
  const [alerts, setAlerts] = useState(false);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>{menu}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuCheckboxItem checked={showPurchased} onCheckedChange={setShowPurchased}>{purchased}</DropdownMenuCheckboxItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger><Settings aria-hidden="true" />{settings}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{order}</DropdownMenuLabel>
            <DropdownMenuRadioGroup aria-label={order} value={sort} onValueChange={setSort}>
              <DropdownMenuRadioItem value="recent">{recent}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">{name}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger><Bell aria-hidden="true" />{notifications}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{notifications}</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={mail} onCheckedChange={setMail}>{email}</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={alerts} onCheckedChange={setAlerts}>{push}</DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" disabled={!mail && !alerts} onClick={() => { setMail(false); setAlerts(false); }}>
        <Slash aria-hidden="true" />{unsubscribe}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
