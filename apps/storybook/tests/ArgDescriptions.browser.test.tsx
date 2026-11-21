import { describe, expect, test } from "vitest";
import { componentForTitle, getArgDescription, localizeArgTypes } from "../.storybook/arg-descriptions";

const components = import.meta.glob<{ name: string; props: Record<string, unknown> }>(
  "../../../packages/design-system/components/*/meta.json", { eager: true, import: "default" },
);

describe("shared component property descriptions", () => {
  test.each(Object.values(components))("$name has Chinese and English descriptions for every catalog property", ({ name, props }) => {
    for (const prop of Object.keys(props)) {
      const title = `YAMI/Components/${name}`;
      expect(getArgDescription(title, prop, "zh"), `${name}.${prop}`).toMatch(/[\u4e00-\u9fff]/);
      const english = getArgDescription(title, prop, "en");
      expect(english, `${name}.${prop}`).toBeTruthy();
      expect(english).not.toMatch(/[\u4e00-\u9fff\uac00-\ud7af]/);
    }
  });

  test("resolves display names and nested module stories without affecting pages", () => {
    expect(componentForTitle("YAMI/modules/commerce/floating bars")).toBe("Billboard");
    expect(componentForTitle("YAMI/modules/product display/product list/PC")).toBe("ProductList");
    expect(componentForTitle("YAMI/components/layout/dialog/draft/v1")).toBe("Dialog");
    expect(componentForTitle("YAMI/assets/membership/membershipbadge")).toBe("MembershipBadge");
    expect(componentForTitle("YAMI/assets/membership/membershipicon")).toBe("MembershipIcon");
    expect(componentForTitle("YAMI/pages/header")).toBeUndefined();
  });

  test("switches back and forth while retaining authored detail, types and controls", () => {
    const title = "YAMI/Components/Forms/Select";
    const args = { disabled: { description: "Original", control: "boolean", table: { category: "State" } }, children: { description: "Original children" } };
    const translations = { zh: { description: "选择器" }, en: { argDescriptions: { disabled: "Detailed disabled behavior." } } };
    const zh = localizeArgTypes(title, args, "zh", translations);
    const en = localizeArgTypes(title, zh, "en", translations);
    expect(zh.disabled.description).toBe("禁用控件操作。");
    expect(en.disabled.description).toBe("Detailed disabled behavior.");
    expect(en.children.description).toBe("Content rendered inside the component.");
    expect(en.disabled.control).toBe("boolean");
    expect(en.disabled.table).toEqual({ category: "State" });
    expect(localizeArgTypes(title, en, "zh", translations)).toEqual(zh);
    expect(args.disabled.description).toBe("Original");
  });

  test("keeps unrelated descriptions intact and handles missing translation maps", () => {
    const args = { title: { description: "Page-specific title." } };
    expect(localizeArgTypes("YAMI/Pages/Example", args, "zh")).toEqual(args);
    expect(getArgDescription("YAMI/Components/Card", "children", "zh", { zh: { description: "卡片" } })).toBe("卡片内容。");
  });
});
