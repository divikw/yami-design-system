import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
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
