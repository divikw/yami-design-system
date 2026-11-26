import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { AllFiltersDialog } from "../../../packages/prototypes/pages/SearchResultsPage/AllFiltersDialog";
import { SearchResultsPage } from "../../../packages/prototypes/pages/SearchResultsPage/SearchResultsPage";
import { createSearchResultsFixture } from "../../../packages/prototypes/pages/SearchResultsPage/fixtures";
import "@yami/design-system/tokens.css";

test("filter drafts survive the switch from a mobile child view to the desktop dialog", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<SearchResultsPage {...createSearchResultsFixture("en")} />));
    const trigger = host.querySelector<HTMLButtonElement>("[data-search-results-filter-button]")!;
    await page.elementLocator(trigger).click();
    const panel = () => document.getElementById("all-filters")!;
    await expect.poll(() => panel()?.dataset.drawerState).toBe("open");
    const sort = panel().querySelector<HTMLButtonElement>("section button")!;
    await page.elementLocator(sort).click();
    const second = panel().querySelectorAll<HTMLElement>('[role="radio"]')[1]!;
    await page.elementLocator(second).click();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(sort);
    await page.elementLocator(sort).click();
    await page.viewport(1024, 812);
    await expect.poll(() => panel()?.hasAttribute("data-dialog")).toBe(true);
    await expect.poll(() => panel().querySelector("h2")?.textContent).toBe("Filters");
    expect(panel().getBoundingClientRect().width).toBe(560);
    await expect.poll(() => panel().contains(document.activeElement)).toBe(true);
    await page.elementLocator(panel().querySelector<HTMLButtonElement>("section button")!).click();
    expect(panel().querySelectorAll('[role="radio"]')[1]).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.activeElement).toBe(trigger);
  } finally {
    root.unmount();
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([812, 365])("collection filter tags and actions fit in the mobile drawer at %ipx high", async (height) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  try {
    await page.viewport(402, height);
    flushSync(() => root.render(<AllFiltersDialog
      open locale="en" resultCount={12} sort="featured" category="skin-care" fulfilled={false}
      menuValues={{ inStock: ["in-stock"], price: ["range"] }}
      copy={{
        categoryOptions: [{ label: "Cleansers, toners and moisturizers", value: "skin-care" }],
        clearFilters: "Clear all", filtersButton: "Filters", sortLabel: "Sort by",
        showResults: () => "Show products",
      }}
      catalog={{
        categoryLabel: "Category", inStockLabel: "In Stock", priceLabel: "Price",
        priceOptions: [{ label: "$20 to $50", value: "range" }],
        sortOptions: [{ label: "Featured", value: "featured" }],
      }}
      onClose={() => {}} onClear={() => {}} onApply={() => {}}
    />));
    const panel = document.querySelector<HTMLElement>("#all-filters")!;
    const selectedFilters = panel.querySelector<HTMLElement>('[aria-label="Selected filters"]')!;
    const removeStock = page.getByRole("button", { name: "Remove In Stock filter" }).element();
    const apply = page.getByRole("button", { name: "Show products" }).element();
    const slider = page.getByRole("slider", { name: "Panel height" }).element() as HTMLElement;
    await expect.poll(() => panel.dataset.drawerState).toBe("open");
    expect(panel.lang).toBe("en");
    expect(slider.getAttribute("aria-valuenow")).toBe("60");
    expect(panel.getBoundingClientRect().top).toBeCloseTo(height * 0.4, 0);
    const verifyFooter = () => {
      const rail = selectedFilters.getBoundingClientRect();
      const chip = removeStock.parentElement!.getBoundingClientRect();
      expect(chip.top).toBeGreaterThanOrEqual(rail.top);
      expect(chip.bottom).toBeLessThanOrEqual(rail.bottom);
      expect(apply.getBoundingClientRect().bottom).toBeLessThanOrEqual(height);
    };
    verifyFooter();
    expect(selectedFilters.scrollWidth).toBeGreaterThan(selectedFilters.clientWidth);
    page.getByRole("button", { name: "Remove $20 to $50 filter" }).element().scrollIntoView({ block: "nearest", inline: "nearest" });
    expect(selectedFilters.scrollLeft).toBeGreaterThan(0);
    slider.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => panel.getBoundingClientRect().top).toBeCloseTo(48, 0);
    verifyFooter();
    await page.getByRole("button", { name: /Sort by/ }).click();
    expect(panel.querySelector('[aria-label="Selected filters"]')).toBeNull();
    await expect.element(page.getByRole("button", { name: "Show products" })).toBeVisible();
    await page.getByRole("button", { name: "Back to all filters" }).click();
    await expect.element(page.getByRole("button", { name: "Remove In Stock filter" })).toBeVisible();
    await page.getByRole("button", { name: /^Category/ }).click();
    expect(getComputedStyle(page.getByRole("radiogroup", { name: "Category" }).element()).rowGap).toBe("4px");
  } finally {
    root.unmount();
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
