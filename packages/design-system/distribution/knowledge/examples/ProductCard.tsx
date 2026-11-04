"use client";

import { useState } from "react";
import { ProductCard } from "@yami/design-system/components/ProductCard";

export function ProductCardExample() {
  const [added, setAdded] = useState(0);
  return (
    <div style={{ maxWidth: 240 }}>
      <ProductCard href="#example-product" title="Example product" priceCurrent="$12.99" priceOriginal="$19.99"
        onAddToCart={() => setAdded((count) => count + 1)} addButtonAriaLabel="Add example product" />
      <output aria-live="polite">Example items added: {added}</output>
    </div>
  );
}
