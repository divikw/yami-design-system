import type { ComponentPropsWithRef } from "react";
import styles from "./Skeleton.module.css";

export type SkeletonProps = Omit<ComponentPropsWithRef<"span">, "children">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <span {...props} data-slot="skeleton" aria-hidden="true"
    className={[styles.root, className].filter(Boolean).join(" ")} />;
}
