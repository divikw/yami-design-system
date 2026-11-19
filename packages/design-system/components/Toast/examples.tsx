"use client";

import { useId, useState } from "react";
import { Button, toast } from "@yami/design-system";

// Mount one Toaster at the application root.
export function SaveForLater({ en = false }: { en?: boolean }) {
  const [saved, setSaved] = useState(false);
  const id = useId();
  function save() {
    setSaved(!saved);
    toast.add({
      id,
      type: "success",
      title: saved ? (en ? "Removed from favorites" : "已移出收藏") : (en ? "Item saved" : "已收藏商品"),
      description: saved ? undefined : (en ? "Find it in your favorites." : "可在收藏夹中查看。"),
      actionProps: {
        children: en ? "Undo" : "撤销",
        onClick() {
          setSaved(saved);
          toast.close(id);
        },
      },
    });
  }
  return <Button size="sm" variant="secondary" onClick={save}>
    {saved ? (en ? "Remove from favorites" : "移出收藏") : (en ? "Save item" : "收藏商品")}
  </Button>;
}
