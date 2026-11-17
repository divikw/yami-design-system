"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import styles from "./Select.module.css";

export const SelectValue = SelectPrimitive.Value;
export const SelectLabel = SelectPrimitive.Label;
export const SelectList = SelectPrimitive.List;

export type SelectProps = Omit<SelectPrimitive.Root.Props<string>, "multiple">;

export function Select({ value, defaultValue = null, onValueChange, inputRef, ...props }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const initialValue = useRef(defaultValue);
  const hiddenInput = useRef<HTMLInputElement>(null);
  useImperativeHandle(inputRef, () => hiddenInput.current!, []);
  useEffect(() => {
    const form = hiddenInput.current?.form;
    if (!form || value !== undefined) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setUncontrolledValue(initialValue.current);
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [props.form, value]);
  return <SelectPrimitive.Root<string> modal={false} {...props} inputRef={hiddenInput}
    value={value === undefined ? uncontrolledValue : value}
    onValueChange={(next, details) => {
      onValueChange?.(next, details);
      if (value === undefined && !details.isCanceled) setUncontrolledValue(next);
    }} />;
}

export type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, "className" | "children"> & {
  className?: string;
  children?: ReactNode;
};

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger({ className, children, ...props }, ref) {
  return <SelectPrimitive.Trigger {...props} ref={ref} className={className ?? styles.trigger}>{children}</SelectPrimitive.Trigger>;
});

export type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "className"> &
  Pick<SelectPrimitive.Portal.Props, "container"> &
  Pick<SelectPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "arrowPadding" | "anchor" | "alignItemWithTrigger"> & {
    className?: string;
  };

export function SelectContent({
  className, container, side, align = "start", sideOffset = 4,
  alignOffset, collisionPadding, arrowPadding, anchor, alignItemWithTrigger = false, ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal container={container ?? undefined}>
      <SelectPrimitive.Positioner
        className={styles.positioner} data-slot="select-positioner" side={side} align={align} sideOffset={sideOffset}
        alignOffset={alignOffset} collisionPadding={collisionPadding} arrowPadding={arrowPadding} anchor={anchor}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <SelectPrimitive.Popup {...props} className={className ?? styles.content} />
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = Omit<SelectPrimitive.Item.Props, "className" | "children" | "value"> & {
  value: string;
  children: ReactNode;
  className?: string;
};

export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item {...props} className={className ?? styles.item}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={styles.indicator}>
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
