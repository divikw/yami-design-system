"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Sheet, type SheetProps } from "../Sheet";
import styles from "./Drawer.module.css";

export type DrawerProps = Omit<SheetProps, "desktopPlacement"> & {
  /** Runs after exit has released the modal; use when the original opener no longer exists. */
  onAfterClose?: () => void;
};

/** Right-side desktop drawer; mobile keeps Sheet's bottom presentation. */
export function Drawer({ open, onAfterClose, ...props }: DrawerProps) {
  const [present, setPresent] = useState(open);
  const [phase, setPhase] = useState("entering");
  const lastOpenProps = useRef(props);
  const wasPresent = useRef(present);

  useLayoutEffect(() => {
    if (wasPresent.current && !present) onAfterClose?.();
    wasPresent.current = present;
  }, [present, onAfterClose]);

  useLayoutEffect(() => {
    if (open) lastOpenProps.current = props;
  });

  useLayoutEffect(() => {
    if (open) {
      setPresent(true);
      setPhase("entering");
    } else if (present) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPresent(false);
        return;
      }
      setPhase("exiting");
      // Match the 200ms CSS exit; also release the modal if animations are disabled externally.
      const timeout = window.setTimeout(() => setPresent(false), 200);
      return () => window.clearTimeout(timeout);
    }
  }, [open, present]);

  const content = open ? props : lastOpenProps.current;
  const { size = "full", "data-slot": slot = "drawer", className, onAnimationEnd, ...sheetProps } = content;
  return <Sheet {...sheetProps} open={open || present} size={size} desktopPlacement="right" data-slot={slot}
    className={[styles.drawer, className].filter(Boolean).join(" ")} data-drawer-state={phase}
    onClose={() => { if (open) props.onClose(); }}
    onAnimationEnd={(event) => {
      onAnimationEnd?.(event);
      if (event.target !== event.currentTarget || event.nativeEvent.pseudoElement) return;
      if (open) setPhase("open");
      else setPresent(false);
    }} />;
}
