"use client";

import { useState } from "react";
import { Coupon } from "./Coupon";

export function CouponExample() {
  const [selected, setSelected] = useState(false);
  return <Coupon title="立享 20% OFF" description="亚米自营商品通用，特殊商品除外" validity="有效期至 01/01/2027 15:59" selected={selected} onSelectedChange={setSelected} />;
}
