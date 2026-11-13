import { describe, expect, it } from "vitest";
import { prototypeHref } from "../app/lib/prototype-projects";
import { addPrototypeItem, emptyPrototypeSession, prototypeSessionKey, readPrototypeSession } from "../app/lib/prototype-session";

describe("prototype delivery", () => {
  it("shares project, variant, page and presentation without editor or local draft parameters", () => {
    const href = prototypeHref(new URLSearchParams("project=global-navigation&variant=current&locale=en&theme=dark&viewport=402&direction=private-draft&embedded=1&story=example"), "/search/抹茶", "image-categories");
    const query = new URL(href, "https://example.com").searchParams;
    expect(Object.fromEntries(query)).toEqual({ project: "global-navigation", variant: "image-categories", locale: "en", theme: "dark", viewport: "402", path: "/search/抹茶" });
  });

  it("isolates project and variant sessions, and recovers from invalid storage", () => {
    expect(prototypeSessionKey("one", "current")).not.toBe(prototypeSessionKey("two", "current"));
    expect(prototypeSessionKey("one", "current")).not.toBe(prototypeSessionKey("one", "alternative"));
    expect(readPrototypeSession({ getItem: () => "broken" }, "key")).toEqual(emptyPrototypeSession());
    expect(readPrototypeSession({ getItem: () => { throw new Error("storage disabled"); } }, "key")).toEqual(emptyPrototypeSession());
  });

  it("merges repeated additions without losing basket selection or exceeding stock", () => {
    const item = { id: "tea", title: "Tea", href: "/products/tea", image: "/tea.jpg", merchantId: "yami", priceCents: 1000, attributes: [], quantity: 2, maxQuantity: 3, selected: false, availability: "available" as const };
    expect(addPrototypeItem([item], { ...item, quantity: 2, selected: true })).toEqual([{ ...item, quantity: 3 }]);
  });
});
