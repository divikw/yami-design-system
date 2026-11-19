"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@yami/design-system";

export function Notifications({ trigger, email, push, sms, icons = false }: { trigger: string; email: string; push: string; sms: string; icons?: boolean }) {
  const [mail, setMail] = useState(true);
  const [alerts, setAlerts] = useState(false);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel inset={icons}>{trigger}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={mail} onCheckedChange={setMail}>{icons && <Mail aria-hidden="true" />}{email}</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={alerts} onCheckedChange={setAlerts}>{icons && <Bell aria-hidden="true" />}{push}</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem disabled>{icons && <MessageSquare aria-hidden="true" />}{sms}</DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
