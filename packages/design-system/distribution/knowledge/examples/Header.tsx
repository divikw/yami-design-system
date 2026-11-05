"use client";

import { useState } from "react";
import { StickyStorefrontHeader } from "@yami/design-system/components/Header";

const logo = "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 160 48'%3E%3Ctext x='4' y='33' font-family='sans-serif' font-size='24'%3EDemo shop%3C/text%3E%3C/svg%3E";

export function HeaderExample() {
  const [query, setQuery] = useState("");
  return (
    <>
      <StickyStorefrontHeader
        logo={{ src: logo, alt: "Demo shop" }} homeHref="#demo-home"
        categories={[{ id: "pantry", label: "Pantry", href: "#demo-pantry" }]}
        searchLabel="Search the demo shop" mobileSearchHref="#demo-search"
        onSearchSubmit={setQuery}
        account={{ label: "Account", href: "#demo-account" }}
        locale={{ label: "EN", flag: { src: logo, alt: "" }, href: "#demo-language" }}
        cart={{ label: "Cart", href: "#demo-cart" }}
      />
      <h4 id="demo-home">Demo shop</h4>
      <p id="demo-search" role="status">{query ? `Searched for: ${query}` : "Search the demo shop"}</p>
      <p id="demo-pantry">Pantry collection</p>
      <p id="demo-account">Account details</p>
      <p id="demo-language">Language preferences</p>
      <p id="demo-cart">Your cart</p>
    </>
  );
}
