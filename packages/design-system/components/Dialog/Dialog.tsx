"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useId, useRef } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "../Button";
import styles from "./Dialog.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;

interface DialogBaseProps extends Omit<ComponentPropsWithoutRef<"div">, "title" | "onClose" | "role"> {
  open: boolean;
  title: string;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  /** Remains outside the scrolling content. The caller owns its actions. */
  footer?: ReactNode;
  "data-slot"?: string;
}

export type DialogProps = DialogBaseProps & (
  | { variant?: "default"; closeLabel: string }
  | { variant: "confirmation"; closeLabel?: never }
);

export function Dialog({
  open, title, closeLabel, onClose, role = "dialog", variant = "default", footer,
  id: providedId, className, children, "data-slot": slot = "dialog", ...rest
}: DialogProps) {
  const generatedId = useId();
  const id = providedId ?? `dialog-${generatedId}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={styles.backdrop} />
        <DialogPrimitive.Viewport className={styles.viewport}>
          <DialogPrimitive.Popup
            {...rest}
            id={id}
            role={role}
            aria-modal="true"
            className={[styles.dialog, className].filter(Boolean).join(" ")}
            initialFocus={variant === "confirmation" ? true : closeRef}
            data-slot={slot}
            data-dialog=""
            data-variant={variant}
          >
            <div className={styles.body} data-slot="dialog-body">
              <header className={styles.header} data-slot="dialog-header">
                {variant !== "confirmation" && (
                  <DialogPrimitive.Close render={<Button ref={closeRef} className={styles.closeButton} variant="tertiary" form="icon" size="sm" aria-label={closeLabel} />}>
                    <img src={closeIcon} alt="" width={24} height={24} />
                  </DialogPrimitive.Close>
                )}
                <DialogPrimitive.Title className={styles.title} id={`${id}-title`}>{title}</DialogPrimitive.Title>
              </header>
              <div className={styles.content} data-slot={`${id}-content`} data-dialog-content="">
                {children}
              </div>
            </div>
            {footer && <div className={styles.footer} data-slot="dialog-footer">{footer}</div>}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
