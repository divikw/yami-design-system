"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import styles from "./Textarea.module.css";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

export function Textarea({
  className, rows, id, name, value, defaultValue, disabled, required, autoFocus,
  "aria-describedby": describedBy, "aria-invalid": invalid, ...props
}: TextareaProps) {
  const controlRef = useRef<HTMLElement>(null);
  const [pointerFocus, setPointerFocus] = useState(false);

  useEffect(() => {
    const doc = controlRef.current?.ownerDocument;
    if (!doc) return;
    // Capture also covers focus transferred by a label and Tab from another control.
    const onPointerDown = () => setPointerFocus(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey) setPointerFocus(false);
    };
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("keydown", onKeyDown, true);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return <FieldPrimitive.Control
    ref={controlRef}
    id={id}
    name={name}
    value={value}
    defaultValue={defaultValue}
    disabled={disabled}
    required={required}
    autoFocus={autoFocus}
    aria-describedby={describedBy}
    aria-invalid={invalid}
    render={<textarea
      data-slot="textarea"
      {...props}
      data-pointer-focus={pointerFocus || undefined}
      data-auto-size={rows == null || undefined}
      rows={rows ?? 3}
      className={[styles.control, className].filter(Boolean).join(" ")}
    />}
  />;
}
