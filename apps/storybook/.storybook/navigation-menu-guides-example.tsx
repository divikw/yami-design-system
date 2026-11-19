import { AlignLeft, ListFilter, ListOrdered, SlidersHorizontal } from "lucide-react";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuPositioner, NavigationMenuTrigger,
} from "@yami/design-system";

export function ComponentNavigation({ en = false }: { en?: boolean }) {
  const label = en ? "Form controls" : "表单控件";
  const guides = [
    { name: "Slider", icon: SlidersHorizontal, id: "slider", detail: en ? "Choose a value or range" : "选择数值或范围" },
    { name: "Combobox", icon: ListFilter, id: "combobox", detail: en ? "Search available options" : "搜索候选项" },
    { name: "Select", icon: ListOrdered, id: "select", detail: en ? "Choose from a list" : "从列表中选择" },
    { name: "Textarea", icon: AlignLeft, id: "textarea", detail: en ? "Enter multiline text" : "输入多行文本" },
  ];
  return <NavigationMenu positioner={<NavigationMenuPositioner align="center" />} aria-label={en ? "Component library" : "组件库"}>
    <NavigationMenuList>
      <NavigationMenuItem value="forms">
        <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
        <NavigationMenuIndicator />
        <NavigationMenuContent style={{
          width: "min(28rem, calc(100vw - 2rem))", display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(11rem, 100%), 1fr))", gap: "var(--space-050)",
        }}>
          {guides.map(({ name, icon: Icon, id, detail }) => (
            <NavigationMenuLink key={id} href={`/?path=/docs/yami-components-forms-${id}--docs`} target="_parent">
              <Icon size={16} aria-hidden="true" />
              <span>{name}<small style={{ display: "block", color: "var(--text-secondary)", fontSize: "var(--font-size-caption-sm)", lineHeight: "var(--line-height-caption-sm)", fontWeight: "var(--font-weight-normal)" }}>{detail}</small></span>
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>;
}
