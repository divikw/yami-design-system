"use client";

import type { ComponentPropsWithRef } from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { Button, type ButtonProps } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import styles from "./AlertDialog.module.css";

export type AlertDialogProps = AlertDialogPrimitive.Root.Props;
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, "className"> &
  Pick<AlertDialogPrimitive.Portal.Props, "container" | "keepMounted"> & { className?: string };

export function AlertDialogContent({ container, keepMounted, className, ...props }: AlertDialogContentProps) {
  return <AlertDialogPrimitive.Portal container={container ?? undefined} keepMounted={keepMounted}>
    <AlertDialogPrimitive.Backdrop className={styles.backdrop} />
    <AlertDialogPrimitive.Viewport className={styles.viewport}>
      <AlertDialogPrimitive.Popup {...props} data-slot="alert-dialog-content" className={[styles.content, className].filter(Boolean).join(" ")} />
    </AlertDialogPrimitive.Viewport>
  </AlertDialogPrimitive.Portal>;
}

export function AlertDialogHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="alert-dialog-header" className={[styles.header, className].filter(Boolean).join(" ")} />;
}

export function AlertDialogTitle({ className, ...props }: Omit<AlertDialogPrimitive.Title.Props, "className"> & { className?: string }) {
  return <AlertDialogPrimitive.Title {...props} className={[styles.title, className].filter(Boolean).join(" ")} />;
}

export function AlertDialogDescription({ className, ...props }: Omit<AlertDialogPrimitive.Description.Props, "className"> & { className?: string }) {
  return <AlertDialogPrimitive.Description {...props} className={[styles.description, className].filter(Boolean).join(" ")} />;
}

export function AlertDialogFooter({ className, children, "aria-label": label = "Confirmation actions", ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="alert-dialog-footer" className={[styles.footer, className].filter(Boolean).join(" ")}>
    <ButtonGroup aria-label={label} className={styles.actions}>{children}</ButtonGroup>
  </div>;
}

export type AlertDialogActionProps = AlertDialogPrimitive.Close.Props & Pick<ButtonProps, "variant" | "size">;

/** Synchronous confirmation closes the dialog. Hosts own asynchronous work and controlled state. */
export function AlertDialogAction({ variant = "primary", size = "md", render = <Button variant={variant} size={size} className={styles.action} />, ...props }: AlertDialogActionProps) {
  return <AlertDialogPrimitive.Close {...props} render={render} />;
}

export function AlertDialogCancel({ variant = "secondary", ...props }: AlertDialogActionProps) {
  return <AlertDialogAction {...props} variant={variant} />;
}
