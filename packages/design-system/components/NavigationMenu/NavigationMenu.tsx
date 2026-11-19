"use client";

import { NavigationMenu as Base } from "@base-ui/react/navigation-menu";
import type { ComponentPropsWithRef, ReactElement } from "react";
import styles from "./NavigationMenu.module.css";

type Styled<Props> = Omit<Props, "className"> & { className?: string };
export type NavigationMenuProps<Value = string> = Styled<Base.Root.Props<Value>> &
  Pick<Base.Positioner.Props, "align" | "side" | "sideOffset" | "alignOffset"> & {
    positioner?: ReactElement;
  };

export function NavigationMenu<Value = string>({
  children, className, positioner, side, align, sideOffset, alignOffset, orientation = "horizontal", ...props
}: NavigationMenuProps<Value>) {
  return <Base.Root {...props} orientation={orientation} data-orientation={orientation}
    data-slot="navigation-menu" className={[styles.root, className].filter(Boolean).join(" ")}>
    {children}
    {positioner ?? <NavigationMenuPositioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} />}
  </Base.Root>;
}

export function NavigationMenuPositioner({
  className, side = "bottom", align = "start", sideOffset = 8, alignOffset = 0, collisionPadding = 8, ...props
}: Styled<ComponentPropsWithRef<typeof Base.Positioner>>) {
  return <Base.Portal>
    <Base.Positioner {...props} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}
      collisionPadding={collisionPadding} data-slot="navigation-menu-positioner" className={[styles.positioner, className].filter(Boolean).join(" ")}>
      <Base.Popup data-slot="navigation-menu-popup" className={styles.popup}>
        <Base.Viewport data-slot="navigation-menu-viewport" />
      </Base.Popup>
    </Base.Positioner>
  </Base.Portal>;
}

export function NavigationMenuItem(props: ComponentPropsWithRef<typeof Base.Item>) {
  return <Base.Item {...props} data-slot="navigation-menu-item" />;
}

export function NavigationMenuIndicator(props: Styled<ComponentPropsWithRef<typeof Base.Icon>>) {
  const { className, ...iconProps } = props;
  return <Base.Icon {...iconProps} data-slot="navigation-menu-indicator"
    className={[styles.indicator, className].filter(Boolean).join(" ")}>{null}</Base.Icon>;
}

export function navigationMenuTriggerStyle() {
  return styles.trigger;
}

export function NavigationMenuList({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.List>>) {
  return <Base.List {...props} data-slot="navigation-menu-list" className={[styles.list, className].filter(Boolean).join(" ")} />;
}

export function NavigationMenuTrigger({ children, className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Trigger>>) {
  return <Base.Trigger {...props} data-slot="navigation-menu-trigger" className={[navigationMenuTriggerStyle(), className].filter(Boolean).join(" ")}>
    {children}<Base.Icon aria-hidden="true" className={styles.chevron}>{null}</Base.Icon>
  </Base.Trigger>;
}

export function NavigationMenuContent({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Content>>) {
  return <Base.Content {...props} data-slot="navigation-menu-content" className={[styles.content, className].filter(Boolean).join(" ")} />;
}

export function NavigationMenuLink({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Link>>) {
  return <Base.Link {...props} data-slot="navigation-menu-link" className={[styles.link, className].filter(Boolean).join(" ")} />;
}
