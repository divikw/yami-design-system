import type { ComponentPropsWithRef } from "react";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = ComponentPropsWithRef<"div">;

export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <div {...props} data-slot="empty-state"
    className={[styles.root, className].filter(Boolean).join(" ")} />;
}

export type EmptyStateHeaderProps = ComponentPropsWithRef<"div">;

export function EmptyStateHeader({ className, ...props }: EmptyStateHeaderProps) {
  return <div {...props} data-slot="empty-state-header"
    className={[styles.header, className].filter(Boolean).join(" ")} />;
}

export type EmptyStateMediaProps = ComponentPropsWithRef<"div"> & { variant?: "default" | "icon" };

export function EmptyStateMedia({ className, variant = "default", ...props }: EmptyStateMediaProps) {
  return <div {...props} data-slot="empty-state-media" data-variant={variant}
    className={[styles.media, className].filter(Boolean).join(" ")} />;
}

export type EmptyStateTitleProps = ComponentPropsWithRef<"h2">;

export function EmptyStateTitle({ className, ...props }: EmptyStateTitleProps) {
  return <h2 {...props} data-slot="empty-state-title"
    className={[styles.title, className].filter(Boolean).join(" ")} />;
}

export type EmptyStateDescriptionProps = ComponentPropsWithRef<"p">;

export function EmptyStateDescription({ className, ...props }: EmptyStateDescriptionProps) {
  return <p {...props} data-slot="empty-state-description"
    className={[styles.description, className].filter(Boolean).join(" ")} />;
}

export type EmptyStateContentProps = ComponentPropsWithRef<"div">;

export function EmptyStateContent({ className, ...props }: EmptyStateContentProps) {
  return <div {...props} data-slot="empty-state-content"
    className={[styles.content, className].filter(Boolean).join(" ")} />;
}
