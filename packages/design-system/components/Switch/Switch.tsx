"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { forwardRef, type ReactNode } from "react";
import styles from "./Switch.module.css";

export type SwitchProps = Omit<SwitchPrimitive.Root.Props, "children" | "className"> & {
  /** Optional visible label inside the clickable row. */
  children?: ReactNode;
  className?: string;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ className, children, ...props }, ref) {
  return <SwitchPrimitive.Root render={<button />} nativeButton {...props} ref={ref} className={[styles.root, className].filter(Boolean).join(" ")}>
    {children}
    <span className={styles.track} aria-hidden="true"><SwitchPrimitive.Thumb className={styles.thumb} /></span>
  </SwitchPrimitive.Root>;
});
