"use client";

import { useState } from "react";
import { ProductList, type ProductListItem } from "@yami/design-system/components/ProductList";

const products: ProductListItem[] = [
  { id: "available-example", href: "#available-example", title: "Available example", priceCurrent: "$8.99", addButtonAriaLabel: "Add list example product" },
  { id: "sold-out-example", href: "#sold-out-example", title: "Sold out example", priceCurrent: "$6.99", availability: "sold-out", availabilityLabel: "Sold out" },
];

export function ProductListExample() {
  const [category, setCategory] = useState("all");
  return (
    <ProductList title="Packaged list example" layout="waterfall" mobileSurface="plain"
      products={category === "all" ? products : products.filter((product) => product.availability === "sold-out")}
      tabs={[{ value: "all", label: "All examples" }, { value: "sold-out", label: "Sold out examples" }]}
      value={category} onValueChange={setCategory} />
  );
}
