"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Drawer as Parts } from "@base-ui/react/drawer";
import { Button } from "../Button";
import styles from "./DrawerSurface.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;
const backIcon = new URL("../../assets/icons/action/arrow-left.svg", import.meta.url).href;

export interface DrawerSurfaceProps extends Omit<ComponentPropsWithoutRef<"div">, "open" | "title" | "onClose" | "onCancel"> {
  /** Override focus targets when a consumer replaces the built-in header or uses a shortcut. */
  initialFocus?: Parts.Popup.Props["initialFocus"];
  finalFocus?: Parts.Popup.Props["finalFocus"];
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
  /** Remains outside the scrolling content. The caller owns its actions. */
  footer?: ReactNode;
  "data-slot"?: string;
}

export function DrawerSurface({
  handle, modal = true,
  open, title, description, closeLabel, onClose, back, size = "content", contentPadding = "default",
  initialFocus, finalFocus, footer, id: providedId, className, children, onClick, onKeyDown, "aria-describedby": ariaDescribedBy, "data-slot": slot = "drawer", ...rest
}: DrawerSurfaceProps & { handle?: ReactNode; modal?: boolean | "trap-focus" }) {
  const generatedId = useId();
  const id = providedId ?? `drawer-${generatedId}`;
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
    <Parts.Portal>
      {modal === true && <Parts.Backdrop className={styles.backdrop} data-drawer-backdrop="" />}
      <Parts.Viewport className={styles.viewport} data-drawer-viewport="" style={modal === true ? undefined : { pointerEvents: "none" }}>
        <Parts.Popup
          {...rest}
          id={id}
          className={[styles.surface, className].filter(Boolean).join(" ")}
          initialFocus={initialFocus ?? navigationRef}
          finalFocus={finalFocus}
          aria-modal={modal === true || undefined}
          aria-describedby={[ariaDescribedBy, description ? `${id}-description` : undefined].filter(Boolean).join(" ") || undefined}
          data-slot={slot}
          data-drawer=""
          data-size={size}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          {handle}
          <header className={styles.header} data-slot="drawer-header">
            <div className={styles.actions} data-back={hasBack || undefined}>
              <Button ref={navigationRef} className={styles.navigationButton} variant="tertiary" form="icon" size="sm" aria-label={back?.label ?? closeLabel} onClick={back?.onClick ?? onClose}>
                <img src={back ? backIcon : closeIcon} alt="" width={back ? 20 : 24} height={back ? 20 : 24} />
              </Button>
            </div>
            <div className={styles.heading}>
              <Parts.Title className={styles.title} id={`${id}-title`}>{title}</Parts.Title>
              {description && <Parts.Description className={styles.description} id={`${id}-description`} data-slot="drawer-description">{description}</Parts.Description>}
            </div>
          </header>
          <Parts.Content ref={contentRef} className={styles.content} data-base-ui-swipe-ignore={handle ? "" : undefined} data-slot={`${id}-content`} data-padding={contentPadding}>
            {children}
          </Parts.Content>
          {footer && <div className={styles.footer} data-base-ui-swipe-ignore={handle ? "" : undefined} data-slot="drawer-footer">{footer}</div>}
        </Parts.Popup>
      </Parts.Viewport>
    </Parts.Portal>
  );
}
