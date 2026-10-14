import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SocialVideoCard, type SocialVideoCardProps } from "../components/SocialMediaGallery";

const card = { id: "post", posterSrc: "/post.jpg", posterAlt: "Post", username: null };
const fallback = "No products featured in this post～";

function footer(props: Partial<SocialVideoCardProps> = {}) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<SocialVideoCard {...card} {...props} />);
  return container.querySelector<HTMLElement>('[data-slot="social-video-card-products"]')!;
}

describe("SocialVideoCard footer", () => {
  it.each([undefined, null, false, "", " \n ", [], [null, false, " "]].map((caption: ReactNode) => ({ caption })))("shows the exact fallback for an empty caption ($caption)", ({ caption }) => {
    const result = footer({ caption });
    expect(result.textContent).toBe(fallback);
    expect(result.querySelector("a, button, img")).toBeNull();
  });

  it("supports omitting both products and caption", () => {
    expect(footer().textContent).toBe(fallback);
  });

  it.each(["A post without featured products", 0, <strong key="caption">Post description</strong>])("preserves supplied caption content (%j)", (caption) => {
    const result = footer({ caption });
    expect(result.textContent).not.toContain(fallback);
    expect(result.textContent).toBe(typeof caption === "object" ? "Post description" : String(caption));
  });

  it.each([1, 3])("keeps the %i-product footer ahead of caption and fallback", (count) => {
    const products = Array.from({ length: count }, (_, index) => ({ id: String(index), imageSrc: "/product.jpg", imageAlt: "Product", title: "Featured product" }));
    const result = footer({ products, caption: "Post description" });
    expect(result.querySelectorAll("img")).toHaveLength(count);
    expect(result.textContent).not.toContain("Post description");
    expect(result.textContent).not.toContain(fallback);
    expect(result.dataset.footerMode).toBe(count === 1 ? "single" : "multiple");
  });
});
