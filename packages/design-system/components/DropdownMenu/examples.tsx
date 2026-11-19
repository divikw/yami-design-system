"use client";

import { useState } from "react";
import {
  Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator,
} from "@yami/design-system";

export function ShoppingListMenu({ en = false }: { en?: boolean }) {
  const [showPurchased, setShowPurchased] = useState(true);
  const [sort, setSort] = useState("recent");
  const [pinned, setPinned] = useState(false);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
      {en ? "List options" : "清单选项"}
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel>{en ? "Shopping list" : "购物清单"}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setPinned(!pinned)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 4h12v16l-6-4-6 4z" />
          </svg>
          {pinned ? (en ? "Unpin list" : "取消置顶") : (en ? "Pin list" : "置顶清单")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked={showPurchased} onCheckedChange={setShowPurchased}>
        {en ? "Show purchased items" : "显示已购商品"}
      </DropdownMenuCheckboxItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{en ? "Sort by" : "排序方式"}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup aria-label={en ? "Sort by" : "排序方式"} value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="recent">{en ? "Recently added" : "最近添加"}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">{en ? "Product name" : "商品名称"}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>;
}
