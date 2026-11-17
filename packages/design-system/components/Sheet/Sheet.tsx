"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "../Button";
import styles from "./Sheet.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;
const backIcon = new URL("../../assets/icons/action/arrow-left.svg", import.meta.url).href;

export interface SheetProps extends Omit<ComponentPropsWithoutRef<"div">, "open" | "title" | "onClose" | "onCancel"> {
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
  /** Desktop defaults to the right edge; center remains available for existing callers. */
  desktopPlacement?: "center" | "right";
  /** Remains outside the scrolling content. The caller owns its actions. */
  footer?: ReactNode;
  "data-slot"?: string;
}

export function Sheet({
  open, title, description, closeLabel, onClose, back, size = "content", contentPadding = "default", desktopPlacement = "right",
  footer, id: providedId, className, children, onClick, onKeyDown, "aria-describedby": ariaDescribedBy, "data-slot": slot = "sheet", ...rest
}: SheetProps) {
  const generatedId = useId();
  const id = providedId ?? `sheet-${generatedId}`;
  const navigationRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasBack = Boolean(back);

  useLayoutEffect(() => {
    if (open && hasBack) {
      navigationRef.current?.focus({ preventScroll: true });
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [open, hasBack]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen, details) => {
      if (nextOpen) return;
      if (back && details.reason === "escape-key") {
        details.cancel();
        back.onClick();
      } else onClose();
    }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={styles.backdrop} data-sheet-backdrop="" />
        <DialogPrimitive.Viewport className={styles.viewport} data-sheet-viewport="">
          <DialogPrimitive.Popup
            {...rest}
            id={id}
            className={[styles.sheet, className].filter(Boolean).join(" ")}
            initialFocus={navigationRef}
            aria-modal="true"
            aria-describedby={[ariaDescribedBy, description ? `${id}-description` : undefined].filter(Boolean).join(" ") || undefined}
            data-slot={slot}
            data-sheet=""
            data-size={size}
            data-desktop-placement={desktopPlacement}
            onClick={onClick}
            onKeyDown={onKeyDown}
          >
            <header className={styles.header} data-slot="sheet-header">
              <div className={styles.actions} data-back={hasBack || undefined}>
                <Button ref={navigationRef} className={styles.navigationButton} variant="tertiary" form="icon" size="sm" aria-label={back?.label ?? closeLabel} onClick={back?.onClick ?? onClose}>
                  <img src={back ? backIcon : closeIcon} alt="" width={back ? 20 : 24} height={back ? 20 : 24} />
                </Button>
              </div>
              <div className={styles.heading}>
                <DialogPrimitive.Title className={styles.title} id={`${id}-title`}>{title}</DialogPrimitive.Title>
                {description && <DialogPrimitive.Description className={styles.description} id={`${id}-description`} data-slot="sheet-description">{description}</DialogPrimitive.Description>}
              </div>
            </header>
            <div ref={contentRef} className={styles.content} data-slot={`${id}-content`} data-sheet-content="" data-padding={contentPadding}>
              {children}
            </div>
            {footer && <div className={styles.footer} data-slot="sheet-footer">{footer}</div>}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
