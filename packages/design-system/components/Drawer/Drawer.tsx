"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { createChangeEventDetails } from "@base-ui/react/internals/createBaseUIEventDetails";
import { DrawerSurface, type DrawerSurfaceProps } from "./DrawerSurface";
import { useDesktopViewport } from "./useDesktopViewport";
import styles from "./Drawer.module.css";

type RootProps = DrawerPrimitive.Root.Props;
type SnapPoint = DrawerPrimitive.Root.SnapPoint;
export type DrawerProps = Omit<DrawerSurfaceProps, "size"> & Pick<RootProps,
  "swipeDirection" | "modal" | "disablePointerDismissal" | "snapPoints" | "snapPoint" |
  "defaultSnapPoint" | "onSnapPointChange" | "snapToSequentialPoints"
> & {
  showSwipeHandle?: boolean;
  size?: "full" | "content" | "half";
  /** Runs after exit has released the modal; use when the original opener no longer exists. */
  onAfterClose?: () => void;
};

const halfAndFull = [0.5, 1];
/** Mobile half-height drawers can snap to the available full height. */
export function Drawer({ open, onAfterClose, ...props }: DrawerProps) {
  const desktop = useDesktopViewport();
  const [localPoint, setLocalPoint] = useState<SnapPoint | null>(null);
  const [present, setPresent] = useState(open);
  const [phase, setPhase] = useState("entering");
  const lastOpenProps = useRef(props);
  const wasPresent = useRef(present);

  useLayoutEffect(() => {
    if (wasPresent.current && !present) {
      setLocalPoint(null);
      onAfterClose?.();
    }
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
  const {
    size = "full", swipeDirection, snapPoints, snapPoint, defaultSnapPoint, onSnapPointChange,
    snapToSequentialPoints = true, showSwipeHandle, modal = true, disablePointerDismissal,
    "data-slot": slot = "drawer", className, onAnimationEnd, ...surfaceProps
  } = content;
  const direction = swipeDirection ?? (desktop ? "right" : "down");
  const vertical = direction === "up" || direction === "down";
  const points = vertical ? snapPoints ?? (size === "half" ? halfAndFull : undefined) : undefined;
  const adjustable = Boolean(points?.length);
  const initialPoint = defaultSnapPoint ?? points?.[0];
  const activePoint = snapPoint === undefined
    ? (localPoint != null && points?.includes(localPoint) ? localPoint : initialPoint)
    : snapPoint;
  const zh = (content.lang ?? (typeof document === "undefined" ? "" : document.documentElement.lang)).startsWith("zh");
  function changeSnapPoint(point: SnapPoint | null, details: DrawerPrimitive.Root.SnapPointChangeEventDetails) {
    onSnapPointChange?.(point, details);
    if (!details.isCanceled) setLocalPoint(point);
  }

  function close() {
    if (open) props.onClose();
  }
  return (
    <DrawerPrimitive.Root open={open || present} swipeDirection={direction} modal={modal}
      disablePointerDismissal={disablePointerDismissal}
      snapToSequentialPoints={snapToSequentialPoints} snapPoints={points} snapPoint={adjustable ? activePoint ?? null : null}
      defaultSnapPoint={defaultSnapPoint}
      onSnapPointChange={changeSnapPoint}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen || !open) return;
        if (content.back && details.reason === "escape-key") {
          details.cancel();
          content.back.onClick();
        } else close();
      }}>
      <DrawerSurface {...surfaceProps} modal={modal} open={open || present} onClose={close}
        size={adjustable || size === "half" ? "full" : size} data-slot={slot}
        className={[styles.drawer, className].filter(Boolean).join(" ")} data-drawer-state={phase}
        data-snap-points={adjustable || undefined}
        handle={(showSwipeHandle ?? adjustable) && <SwipeHandle points={points} activePoint={activePoint}
          direction={direction} label={zh ? "面板高度" : "Panel height"} onChange={changeSnapPoint} />}
        onAnimationEnd={(event) => {
          onAnimationEnd?.(event);
          if (event.target !== event.currentTarget || event.nativeEvent.pseudoElement) return;
          if (open) setPhase("open");
          else setPresent(false);
        }} />
    </DrawerPrimitive.Root>
  );
}

function SwipeHandle({ points, activePoint, direction, label, onChange }: {
  points?: SnapPoint[];
  activePoint?: SnapPoint | null;
  direction: RootProps["swipeDirection"];
  label: string;
  onChange: NonNullable<RootProps["onSnapPointChange"]>;
}) {
  if (!points?.length) return <div className={styles.handle} aria-hidden="true" />;
  const index = points.findIndex(point => point === activePoint);
  const fractional = points.every((point) => typeof point === "number" && point >= 0 && point <= 1);
  const pointLabel = typeof activePoint === "number" && activePoint <= 1 ? `${activePoint * 100}%` :
    typeof activePoint === "number" ? `${activePoint}px` : activePoint ?? undefined;

  return <div className={styles.handle}
    role="slider" tabIndex={0} aria-label={label} aria-orientation="vertical"
    aria-valuemin={fractional ? Number(points[0]) * 100 : 1}
    aria-valuemax={fractional ? Number(points[points.length - 1]) * 100 : points.length}
    aria-valuenow={fractional ? Number(activePoint) * 100 : index + 1} aria-valuetext={pointLabel}
    onKeyDown={(event) => {
      const key = event.key;
      const step = direction === "up" ? -1 : 1;
      let next: number;
      if (key === "End") next = points.length - 1;
      else if (key === "Home") next = 0;
      else if (key === "ArrowUp" || key === "ArrowRight") next = index + step;
      else if (key === "ArrowDown" || key === "ArrowLeft") next = index - step;
      else return;
      event.preventDefault();
      const point = points[Math.max(0, Math.min(next, points.length - 1))];
      if (point !== activePoint) onChange(point, createChangeEventDetails("none", event.nativeEvent, event.currentTarget));
    }} />;
}
