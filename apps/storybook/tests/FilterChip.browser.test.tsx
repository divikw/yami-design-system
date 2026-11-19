import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { FilterChip } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test("supports toggle state and preserves legacy controlled and plain native button behavior", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const pressedChange = vi.fn();
  const submit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
  try {
    flushSync(() => root.render(<>
      <FilterChip defaultPressed onPressedChange={pressedChange}>In stock</FilterChip>
      <FilterChip selected={false} pressed>On sale</FilterChip>
      <FilterChip defaultPressed disabled>Unavailable</FilterChip>
      <form id="chip-form" onSubmit={submit} />
      <FilterChip type="submit" form="chip-form" name="filter" value="apply">Apply</FilterChip>
    </>));
    const toggle = page.getByRole("button", { name: "In stock" });
    await expect.element(toggle).toHaveAttribute("aria-pressed", "true");
    toggle.element().focus();
    await userEvent.keyboard(" ");
    await expect.element(toggle).toHaveAttribute("aria-pressed", "false");
    expect(pressedChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: "none" }));
    const legacy = page.getByRole("button", { name: "On sale" });
    await legacy.click();
    await expect.element(legacy).toHaveAttribute("aria-pressed", "false");
    await expect.element(page.getByRole("button", { name: "Unavailable" })).toBeDisabled();
    const action = page.getByRole("button", { name: "Apply" });
    await expect.element(action).not.toHaveAttribute("aria-pressed");
    await expect.element(action).toHaveAttribute("value", "apply");
    await action.click();
    expect(submit).toHaveBeenCalledOnce();
  } finally {
    root.unmount();
    host.remove();
  }
});
