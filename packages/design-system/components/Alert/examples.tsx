"use client";

import { useState } from "react";
import { Alert, AlertAction, AlertDescription, AlertTitle, Button } from "@yami/design-system";

export function StockAlert({ en = false }: { en?: boolean }) {
  const [quantity, setQuantity] = useState(3);
  const adjusted = quantity === 2;
  return <Alert variant={adjusted ? "default" : "destructive"}>
    <AlertTitle>{adjusted ? (en ? "Quantity updated" : "数量已更新") : (en ? "Only two left" : "库存仅剩 2 件")}</AlertTitle>
    <AlertDescription>{en ? `Your cart contains ${quantity} items.` : `购物车中有 ${quantity} 件商品。`}</AlertDescription>
    {!adjusted && <AlertAction>
      <Button size="sm" variant="secondary" onClick={() => setQuantity(2)}>{en ? "Change to 2" : "改为 2 件"}</Button>
    </AlertAction>}
  </Alert>;
}
