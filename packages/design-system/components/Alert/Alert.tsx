import type { ComponentPropsWithRef } from "react";
import styles from "./Alert.module.css";

type PartProps = ComponentPropsWithRef<"div">;
export type AlertProps = PartProps & { variant?: "default" | "destructive" };

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return <div role="alert" {...props} data-slot="alert" data-variant={variant}
    className={[styles.root, className].filter(Boolean).join(" ")} />;
}
export function AlertTitle({ className, ...props }: PartProps) {
  return <div {...props} data-slot="alert-title" className={[styles.title, className].filter(Boolean).join(" ")} />;
}
export function AlertDescription({ className, ...props }: PartProps) {
  return <div {...props} data-slot="alert-description" className={[styles.description, className].filter(Boolean).join(" ")} />;
}
export function AlertAction({ className, ...props }: PartProps) {
  return <div {...props} data-slot="alert-action" className={[styles.action, className].filter(Boolean).join(" ")} />;
}
