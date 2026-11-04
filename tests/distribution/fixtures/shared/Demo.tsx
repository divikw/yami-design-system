"use client";

import { useState } from "react";
import { Button } from "@yami/design-system/components/Button";
import { Input } from "@yami/design-system/components/Input";
import { ProductCard } from "@yami/design-system/components/ProductCard";
import { ProductList, type ProductListItem } from "@yami/design-system/components/ProductList";

const products: ProductListItem[] = [
  { id: "sample", title: "Product image sample", href: "#sample", image: "/product.svg", imageAlt: "Neutral product image fixture", priceCurrent: "$12.99", priceOriginal: "$19.99", addButtonAriaLabel: "Add sample product", badges: [{ type: "sale", label: "Sale" }] },
  { id: "sold-out", title: "Sold out sample", href: "#sold-out", priceCurrent: "$8.99", availability: "sold-out", availabilityLabel: "Sold out" },
];

export function Demo() {
  const [query, setQuery] = useState("");
  const [applications, setApplications] = useState(0);
  const [cart, setCart] = useState(0);
  const [dark, setDark] = useState(false);
  const [chinese, setChinese] = useState(false);
  const [category, setCategory] = useState("all");

  return (
    <>
      <section aria-label="Host controls" className="controls">
        <Button data-testid="theme" variant="secondary" onClick={() => {
          document.documentElement.classList.toggle("dark", !dark);
          setDark(!dark);
        }}>Use {dark ? "light" : "dark"} theme</Button>
        <Button data-testid="language" variant="secondary" onClick={() => {
          document.documentElement.lang = chinese ? "en" : "zh";
          setChinese(!chinese);
        }}>Use {chinese ? "English" : "Chinese"}</Button>
      </section>
      <form onSubmit={(event) => { event.preventDefault(); setApplications((count) => count + 1); }} className="controls">
        <Input label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} clearable onClear={() => setQuery("")} error={query === "invalid" ? "Enter another search" : undefined} />
        <Button variant="emphasis" htmlType="submit">Apply</Button>
        <Button disabled onClick={() => setApplications((count) => count + 1)}>Unavailable action</Button>
      </form>
      <output aria-live="polite" data-testid="result">Search: {query || "empty"}; Applications: {applications}; Cart: {cart}</output>
      <ProductList
        title="Product list"
        products={category === "all" ? products : products.filter((product) => product.availability === "sold-out")}
        layout="waterfall"
        mobileSurface="plain"
        tabs={[{ value: "all", label: "All products" }, { value: "sold-out", label: "Sold out products" }]}
        value={category}
        onValueChange={setCategory}
        onAddToCart={() => setCart((count) => count + 1)}
      />
      <section aria-label="Saved item" className="single-product">
        <ProductCard title="Saved item" href="#saved" image="/product.svg" imageAlt="Saved product image fixture" priceCurrent="$6.99" onAddToCart={() => setCart((count) => count + 1)} addButtonAriaLabel="Add saved item" />
      </section>
    </>
  );
}
