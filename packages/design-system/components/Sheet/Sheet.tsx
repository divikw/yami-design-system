"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Button } from "../Button";
import styles from "./Sheet.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;
const backIcon = new URL("../../assets/icons/action/arrow-left.svg", import.meta.url).href;

export interface SheetProps extends Omit<ComponentPropsWithoutRef<"dialog">, "open" | "title" | "onClose" | "onCancel"> {
  open: boolean;
  title: string;
  /** Supporting copy stays with the title above the scrolling body. */
  description?: string;
  closeLabel: string;
  onClose: () => void;
  /** A child view replaces Close with Back; Escape also returns to its parent. */
  back?: { label: string; onClick: () => void };
  size?: "content" | "full";
  contentPadding?: "default" | "compact" | "none";
  /** Drawer uses the same modal behavior with a desktop edge presentation. */
  desktopPlacement?: "center" | "right";
  /** Remains outside the scrolling content. The caller owns its actions. */
  footer?: ReactNode;
  "data-slot"?: string;
}

export function Sheet({
  open, title, description, closeLabel, onClose, back, size = "content", contentPadding = "default", desktopPlacement = "center",
  footer, id: providedId, className, children, onClick, onKeyDown, "aria-describedby": ariaDescribedBy, "data-slot": slot = "sheet", ...rest
}: SheetProps) {
  const generatedId = useId();
  const id = providedId ?? `sheet-${generatedId}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigationRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasBack = Boolean(back);

  useLayoutEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current!;
    const opener = dialog.ownerDocument.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      queueMicrotask(() => {
        if (opener?.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
      });
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open && hasBack) {
      navigationRef.current?.focus({ preventScroll: true });
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [open, hasBack]);

  if (!open) return null;

  return (
    <dialog
      {...rest}
      ref={dialogRef}
      id={id}
      className={[styles.sheet, className].filter(Boolean).join(" ")}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={[ariaDescribedBy, description ? `${id}-description` : undefined].filter(Boolean).join(" ") || undefined}
      data-slot={slot}
      data-sheet=""
      data-size={size}
      data-desktop-placement={desktopPlacement}
      onClose={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget && !dialogRef.current?.open) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target === event.currentTarget) (back?.onClick ?? onClose)();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        event.stopPropagation();
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          event.preventDefault();
          (back?.onClick ?? onClose)();
        } else if (event.key === "Tab") {
          const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]")]
            .filter((control) => control.tabIndex >= 0 && !control.matches(":disabled") && control.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          const active = event.currentTarget.ownerDocument.activeElement;
          if (event.shiftKey && active === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <header className={styles.header} data-slot="sheet-header">
        <div className={styles.actions} data-back={hasBack || undefined}>
          <Button ref={navigationRef} className={styles.navigationButton} variant="tertiary" form="icon" size="sm" aria-label={back?.label ?? closeLabel} onClick={back?.onClick ?? onClose}>
            <img src={back ? backIcon : closeIcon} alt="" width={20} height={20} />
          </Button>
        </div>
        <h2 className={styles.title} id={`${id}-title`}>{title}</h2>
        {description && <p className={styles.description} id={`${id}-description`} data-slot="sheet-description">{description}</p>}
      </header>
      <div ref={contentRef} className={styles.content} data-slot={`${id}-content`} data-sheet-content="" data-padding={contentPadding}>
        {children}
      </div>
      {footer && <div className={styles.footer} data-slot="sheet-footer">{footer}</div>}
    </dialog>
  );
}
