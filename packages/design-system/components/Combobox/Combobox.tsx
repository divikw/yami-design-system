"use client";

import { Combobox as Base } from "@base-ui/react/combobox";
import { createContext, useContext, useEffect, useImperativeHandle, useReducer, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import styles from "./Combobox.module.css";

const KeyboardFocus = createContext(false);

export type ComboboxProps<Value, Multiple extends boolean | undefined = false, Item = Value> = Base.Root.Props<Value, Multiple, Item>;
export function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  inputRef, ...props
}: ComboboxProps<Value, Multiple, Item>) {
  const formInput = useRef<HTMLInputElement>(null);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  useEffect(() => {
    const doc = formInput.current?.ownerDocument;
    if (!doc) return;
    // The popup search input may mount after its trigger receives the event.
    const pointer = () => setKeyboardFocus(false);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab" || (event.target as Element | null)?.closest?.('button[role="combobox"]')) {
        setKeyboardFocus(true);
      }
    };
    doc.addEventListener("pointerdown", pointer, true);
    doc.addEventListener("keydown", keyboard, true);
    return () => {
      doc.removeEventListener("pointerdown", pointer, true);
      doc.removeEventListener("keydown", keyboard, true);
    };
  }, []);
  const [resetCount, reset] = useReducer((count: number) => count + 1, 0);
  useImperativeHandle(inputRef, () => formInput.current!, [resetCount]);
  useEffect(() => {
    const form = formInput.current?.form;
    if (!form) return;
    // Base UI owns both the search text and the selection. Reset both together.
    const handleReset = (event: Event) => queueMicrotask(() => {
      if (!event.defaultPrevented) reset();
    });
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [props.form, resetCount]);
  return <KeyboardFocus.Provider value={keyboardFocus}>
    <Base.Root<Value, Multiple, Item> {...props} key={resetCount} inputRef={formInput} />
  </KeyboardFocus.Provider>;
}

export const ComboboxValue = Base.Value;
export const ComboboxList = Base.List;
export const ComboboxGroup = Base.Group;
export const ComboboxCollection = Base.Collection;
export const ComboboxEmpty = Base.Empty;

function Mark({ kind }: { kind: "expand" | "clear" | "check" }) {
  const path = { expand: "m4 6 4 4 4-4", clear: "m4 4 8 8m0-8-8 8", check: "m2.5 8 3.5 3.5 7-7" }[kind];
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>;
}

export function ComboboxTrigger({ children, ...props }: ComponentPropsWithRef<typeof Base.Trigger>) {
  return <Base.Trigger data-slot="combobox-trigger" {...props}>{children}<Mark kind="expand" /></Base.Trigger>;
}

export type ComboboxInputProps = Omit<ComponentPropsWithRef<typeof Base.Input>, "children"> & {
  children?: ReactNode;
  showTrigger?: boolean;
  showClear?: boolean;
  triggerLabel?: string;
  clearLabel?: string;
};

function EditableInput(props: ComponentPropsWithRef<typeof Base.Input>) {
  const keyboardFocus = useContext(KeyboardFocus);
  return <Base.Input data-slot="combobox-input" data-keyboard-focus={keyboardFocus || undefined} {...props} />;
}

export function ComboboxInput({ children, disabled, showTrigger = true, showClear = false,
  triggerLabel = "Show options", clearLabel = "Clear selection", ...props }: ComboboxInputProps) {
  return <Base.InputGroup className={styles.control}>
    {children}
    <EditableInput disabled={disabled} {...props} />
    {showTrigger && <ComboboxTrigger className={styles.action} disabled={disabled} aria-label={triggerLabel} />}
    {showClear && <Base.Clear className={styles.action} data-slot="combobox-clear" disabled={disabled} aria-label={clearLabel}><Mark kind="clear" /></Base.Clear>}
  </Base.InputGroup>;
}

export type ComboboxContentProps = ComponentPropsWithRef<typeof Base.Popup> &
  Pick<Base.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset" | "anchor"> &
  Pick<Base.Portal.Props, "container">;

export function ComboboxContent({ side = "bottom", sideOffset = 4, align = "start", alignOffset,
  anchor, container, className = styles.popup, ...props }: ComboboxContentProps) {
  return <Base.Portal container={container}>
    <Base.Positioner className={styles.positioner} {...{ side, sideOffset, align, alignOffset, anchor }}>
      <Base.Popup data-slot="combobox-content" className={className} {...props} />
    </Base.Positioner>
  </Base.Portal>;
}

export function ComboboxItem({ children, className = styles.item, ...props }: ComponentPropsWithRef<typeof Base.Item>) {
  return <Base.Item className={className} data-slot="combobox-item" {...props}>
    <span>{children}</span>
    <Base.ItemIndicator className={styles.indicator}><Mark kind="check" /></Base.ItemIndicator>
  </Base.Item>;
}

export function ComboboxLabel({ className = styles.groupLabel, ...props }: ComponentPropsWithRef<typeof Base.GroupLabel>) {
  return <Base.GroupLabel className={className} {...props} />;
}

export function ComboboxSeparator({ className = styles.separator, ...props }: ComponentPropsWithRef<typeof Base.Separator>) {
  return <Base.Separator className={className} {...props} />;
}

export function ComboboxChips({ className = styles.chips, ...props }: ComponentPropsWithRef<typeof Base.Chips>) {
  return <Base.Chips className={className} data-slot="combobox-chips" {...props} />;
}

export function ComboboxChip({ children, showRemove = true, removeLabel = "Remove selection", className = styles.chip, ...props }:
  ComponentPropsWithRef<typeof Base.Chip> & { showRemove?: boolean; removeLabel?: string }) {
  return <Base.Chip className={className} {...props}>
    <span>{children}</span>
    {showRemove && <Base.ChipRemove className={styles.action} aria-label={removeLabel}><Mark kind="clear" /></Base.ChipRemove>}
  </Base.Chip>;
}

export function ComboboxChipsInput(props: ComponentPropsWithRef<typeof Base.Input>) {
  return <EditableInput {...props} />;
}

export function useComboboxAnchor() {
  return useRef<HTMLDivElement>(null);
}
