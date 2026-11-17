"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import styles from "./Popover.module.css";

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export type PopoverProps = PopoverPrimitive.Root.Props;

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

export type PopoverContentProps = Omit<PopoverPrimitive.Popup.Props, "className"> &
  Pick<PopoverPrimitive.Portal.Props, "container" | "keepMounted"> &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "collisionAvoidance" | "arrowPadding" | "anchor"> & {
    className?: string;
  };

export function PopoverContent({
  className, container, keepMounted, side = "bottom", align = "start", sideOffset = 4,
  alignOffset, collisionPadding = 16, collisionAvoidance, arrowPadding, anchor, ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal container={container ?? undefined} keepMounted={keepMounted}>
      <PopoverPrimitive.Positioner
        className={styles.positioner} side={side} align={align} sideOffset={sideOffset}
        alignOffset={alignOffset} collisionPadding={collisionPadding} collisionAvoidance={collisionAvoidance} arrowPadding={arrowPadding} anchor={anchor}
      >
        <PopoverPrimitive.Popup {...props} className={[styles.content, className].filter(Boolean).join(" ")} />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function PopoverTitle({ className, ...props }: Omit<PopoverPrimitive.Title.Props, "className"> & { className?: string }) {
  return <PopoverPrimitive.Title {...props} className={[styles.title, className].filter(Boolean).join(" ")} />;
}

export function PopoverDescription({ className, ...props }: Omit<PopoverPrimitive.Description.Props, "className"> & { className?: string }) {
  return <PopoverPrimitive.Description {...props} className={[styles.description, className].filter(Boolean).join(" ")} />;
}
