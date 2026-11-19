"use client";

import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@yami/design-system";

export function MoveList({ move, personal, shared }: { move: string; personal: string; shared: string }) {
  const [folder, setFolder] = useState<"personal" | "shared">("personal");
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>{folder === "personal" ? personal : shared}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{move}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setFolder("personal")}>{personal}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFolder("shared")}>{shared}</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>;
}
