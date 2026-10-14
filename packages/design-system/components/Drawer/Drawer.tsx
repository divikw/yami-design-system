"use client";

import { Sheet, type SheetProps } from "../Sheet";

export type DrawerProps = Omit<SheetProps, "desktopPlacement">;

/** Right-side desktop drawer; mobile keeps Sheet's bottom presentation. */
export function Drawer({ size = "full", "data-slot": slot = "drawer", ...props }: DrawerProps) {
  return <Sheet {...props} size={size} desktopPlacement="right" data-slot={slot} />;
}
