import { useState } from "react";
import {
  Button, EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateHeader, EmptyStateTitle, useDesktopViewport,
} from "@yami/design-system";

export function SavedLists({ en = false }: { en?: boolean }) {
  const desktop = useDesktopViewport();
  const [created, setCreated] = useState(false);
  if (created) return <p role="status">{en ? "Shopping list created" : "已创建购物清单"}</p>;
  return (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateTitle>{en ? "No shopping lists yet" : "还没有购物清单"}</EmptyStateTitle>
        <EmptyStateDescription>{en ? "Create a list for your next order." : "为下次采购创建一份清单。"}</EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button size={desktop ? "md" : "sm"} onClick={() => setCreated(true)}>{en ? "Create list" : "创建清单"}</Button>
      </EmptyStateContent>
    </EmptyState>
  );
}
