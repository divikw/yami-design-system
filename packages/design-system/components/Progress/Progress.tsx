"use client";

import { Progress as Base } from "@base-ui/react/progress";
import type { ComponentPropsWithRef } from "react";
import styles from "./Progress.module.css";

type Styled<Props> = Omit<Props, "className"> & { className?: string };
export type ProgressProps = Styled<ComponentPropsWithRef<typeof Base.Root>>;

export function Progress({ children, className, ...props }: ProgressProps) {
  return <Base.Root {...props} data-slot="progress" className={[styles.root, className].filter(Boolean).join(" ")}>
    {children}
    <ProgressTrack><ProgressIndicator /></ProgressTrack>
  </Base.Root>;
}

export function ProgressLabel({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Label>>) {
  return <Base.Label {...props} data-slot="progress-label" className={[styles.label, className].filter(Boolean).join(" ")} />;
}

export function ProgressValue({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Value>>) {
  return <Base.Value {...props} data-slot="progress-value" className={[styles.value, className].filter(Boolean).join(" ")} />;
}

export function ProgressTrack({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Track>>) {
  return <Base.Track {...props} data-slot="progress-track" className={[styles.track, className].filter(Boolean).join(" ")} />;
}

export function ProgressIndicator({ className, ...props }: Styled<ComponentPropsWithRef<typeof Base.Indicator>>) {
  return <Base.Indicator {...props} data-slot="progress-indicator" className={[styles.indicator, className].filter(Boolean).join(" ")} />;
}
