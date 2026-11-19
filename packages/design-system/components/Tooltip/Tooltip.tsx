"use client";

import { useId, type ReactElement, type ReactNode } from "react";
import { Popover as Hint } from "@base-ui/react/popover";
import { Button } from "../Button";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import styles from "./Tooltip.module.css";

export function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export type TooltipProps<Payload = unknown> = TooltipPrimitive.Root.Props<Payload>;
export type TooltipContentProps = Omit<TooltipPrimitive.Popup.Props, "className"> &
  Pick<TooltipPrimitive.Portal.Props, "container"> &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "align" | "alignOffset" | "sideOffset"> & {
    className?: string;
  };

export function TooltipContent({
  children, className, container, side = "top", align = "center", alignOffset = 0, sideOffset = 4, ...props
}: TooltipContentProps) {
  return <TooltipPrimitive.Portal container={container}>
    <TooltipPrimitive.Positioner className={styles.positioner} alignOffset={alignOffset} side={side} align={align} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        data-slot="tooltip-content"
        {...props}
        className={[styles.content, className].filter(Boolean).join(" ")}
      >
        {children}
        <TooltipPrimitive.Arrow data-slot="tooltip-arrow" className={styles.arrow} />
      </TooltipPrimitive.Popup>
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>;
}

export type DismissibleTooltipProps = Pick<Hint.Root.Props, "open" | "defaultOpen" | "onOpenChange"> &
  Pick<TooltipContentProps, "side" | "align" | "sideOffset" | "alignOffset" | "container"> & {
    trigger: ReactElement<{ id?: string }>;
    closeLabel: string;
    children: ReactNode;
  };

export function DismissibleTooltip({
  trigger, closeLabel, children, open, defaultOpen = true, side = "top", align = "center",
  sideOffset = 4, alignOffset = 0, container, onOpenChange
}: DismissibleTooltipProps) {
  const generatedId = useId();
  const triggerId = trigger.props.id ?? generatedId;
  return <Hint.Root open={open} defaultOpen={defaultOpen} defaultTriggerId={triggerId}
    triggerId={open === undefined ? undefined : triggerId}
    onOpenChange={(nextOpen, details) => {
      if (details.reason === "outside-press" || details.reason === "focus-out") {
        details.cancel();
        return;
      }
      onOpenChange?.(nextOpen, details);
    }}>
    <Hint.Trigger id={triggerId} render={trigger} />
    <Hint.Portal container={container}>
      <Hint.Positioner className={styles.positioner} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <Hint.Popup initialFocus={false} className={`${styles.content} ${styles.dismissible}`} data-slot="tooltip-content">
          <Hint.Title render={<span />} className={styles.hintText}>{children}</Hint.Title>
          <Hint.Close render={<Button className={styles.closeButton} size="sm" form="icon" variant="tertiary" inverse aria-label={closeLabel} />}>
            <span aria-hidden="true" className={styles.closeIcon} />
          </Hint.Close>
          <Hint.Arrow data-slot="tooltip-arrow" className={styles.arrow} />
        </Hint.Popup>
      </Hint.Positioner>
    </Hint.Portal>
  </Hint.Root>;
}
