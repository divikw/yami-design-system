import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuShortcut, DropdownMenuCheckboxItem,
} from "@yami/design-system";
import "@yami/design-system/tokens.css";

test("a wide trigger sizes its panel and disabled shortcuts inherit the item color", async () => {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<DropdownMenu>
      <DropdownMenuTrigger style={{ width: 240 }}>List actions</DropdownMenuTrigger>
      <DropdownMenuContent container={host}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Prices</DropdownMenuCheckboxItem>
          <DropdownMenuItem disabled>Export<DropdownMenuShortcut>Shift + E</DropdownMenuShortcut></DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>));
    const trigger = page.getByRole("button", { name: "List actions" });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect.element(menu).toBeVisible();
    await expect.poll(() => menu.element().getBoundingClientRect().width).toBeCloseTo(trigger.element().getBoundingClientRect().width, 0);
    expect(host.contains(menu.element())).toBe(true);
    const item = page.getByRole("menuitem", { name: "Export" }).element();
    const shortcut = page.getByText("Shift + E").element();
    expect(getComputedStyle(shortcut).color).toBe(getComputedStyle(item).color);
    expect(getComputedStyle(shortcut).lineHeight).toBe(getComputedStyle(shortcut).getPropertyValue("--line-height-caption-sm").trim());
    await expect.element(page.getByRole("menuitemcheckbox", { name: "Prices" })).toBeChecked();
  } finally {
    root.unmount();
    host.remove();
  }
});
