"use client";

import { Menu } from "@base-ui/react/menu";
import type { ComponentPropsWithRef, RefAttributes } from "react";
import styles from "./DropdownMenu.module.css";

export const DropdownMenu = Menu.Root;
export type DropdownMenuProps<Payload = unknown> = Menu.Root.Props<Payload>;
export function DropdownMenuTrigger<Payload = unknown>(props: Menu.Trigger.Props<Payload> & RefAttributes<HTMLElement>) {
  return <Menu.Trigger<Payload> data-slot="dropdown-menu-trigger" {...props} />;
}
export function DropdownMenuPortal(props: ComponentPropsWithRef<typeof Menu.Portal>) {
  return <Menu.Portal data-slot="dropdown-menu-portal" {...props} />;
}
export function DropdownMenuGroup(props: ComponentPropsWithRef<typeof Menu.Group>) {
  return <Menu.Group data-slot="dropdown-menu-group" {...props} />;
}
export function DropdownMenuRadioGroup(props: ComponentPropsWithRef<typeof Menu.RadioGroup>) {
  return <Menu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}
export const DropdownMenuSub = Menu.SubmenuRoot;

type Styled<P> = Omit<P, "className"> & { className?: string };
type Inset<P> = Styled<P> & { inset?: boolean };

export type DropdownMenuContentProps = Styled<ComponentPropsWithRef<typeof Menu.Popup>> &
  Pick<Menu.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"> &
  Pick<Menu.Portal.Props, "container" | "keepMounted">;

export function DropdownMenuContent({
  align = "start", side = "bottom", sideOffset = 4, alignOffset, collisionPadding = 8,
  container, keepMounted, className, ...props
}: DropdownMenuContentProps) {
  return <Menu.Portal container={container} keepMounted={keepMounted}>
    <Menu.Positioner className={styles.positioner} {...{ align, side, sideOffset, alignOffset, collisionPadding }}>
      <Menu.Popup data-slot="dropdown-menu-content" {...props} className={[styles.popup, className].filter(Boolean).join(" ")} />
    </Menu.Positioner>
  </Menu.Portal>;
}

export function DropdownMenuSubContent(props: DropdownMenuContentProps) {
  return <DropdownMenuContent data-slot="dropdown-menu-sub-content" side="right" sideOffset={0} alignOffset={-4} {...props} />;
}

export function DropdownMenuLabel({ inset, className, ...props }: Inset<ComponentPropsWithRef<typeof Menu.GroupLabel>>) {
  return <Menu.GroupLabel data-slot="dropdown-menu-label" {...props} data-inset={inset || undefined} className={[styles.label, className].filter(Boolean).join(" ")} />;
}

export function DropdownMenuItem({ inset, variant = "default", className, ...props }:
  Inset<ComponentPropsWithRef<typeof Menu.Item>> & { variant?: "default" | "destructive" }) {
  return <Menu.Item data-slot="dropdown-menu-item" {...props} data-inset={inset || undefined} data-variant={variant} className={[styles.item, className].filter(Boolean).join(" ")} />;
}

export function DropdownMenuSubTrigger({ children, inset, className, ...props }: Inset<ComponentPropsWithRef<typeof Menu.SubmenuTrigger>>) {
  return <Menu.SubmenuTrigger data-slot="dropdown-menu-sub-trigger" {...props} data-inset={inset || undefined} className={[styles.item, className].filter(Boolean).join(" ")}>
    {children}<span className={styles.chevron} aria-hidden="true" />
  </Menu.SubmenuTrigger>;
}

export function DropdownMenuCheckboxItem({ children, inset, className, ...props }: Inset<ComponentPropsWithRef<typeof Menu.CheckboxItem>>) {
  return <Menu.CheckboxItem data-slot="dropdown-menu-checkbox-item" {...props} data-inset={inset || undefined} className={[styles.item, className].filter(Boolean).join(" ")}>
    {children}<span data-slot="dropdown-menu-checkbox-item-indicator" aria-hidden="true" className={styles.indicator}><Menu.CheckboxItemIndicator className={styles.check} /></span>
  </Menu.CheckboxItem>;
}

export function DropdownMenuRadioItem({ children, inset, className, ...props }: Inset<ComponentPropsWithRef<typeof Menu.RadioItem>>) {
  return <Menu.RadioItem data-slot="dropdown-menu-radio-item" {...props} data-inset={inset || undefined} className={[styles.item, className].filter(Boolean).join(" ")}>
    {children}<span data-slot="dropdown-menu-radio-item-indicator" aria-hidden="true" className={styles.indicator}><Menu.RadioItemIndicator className={styles.check} /></span>
  </Menu.RadioItem>;
}

export function DropdownMenuSeparator({ className, ...props }: Styled<ComponentPropsWithRef<typeof Menu.Separator>>) {
  return <Menu.Separator data-slot="dropdown-menu-separator" {...props} className={[styles.separator, className].filter(Boolean).join(" ")} />;
}

export function DropdownMenuShortcut({ className, ...props }: ComponentPropsWithRef<"span">) {
  return <span data-slot="dropdown-menu-shortcut" aria-hidden="true" {...props} className={[styles.shortcut, className].filter(Boolean).join(" ")} />;
}
