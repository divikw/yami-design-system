"use client";

import { type ComponentPropsWithRef, type ComponentPropsWithoutRef, type ReactNode, type Ref, useId, useRef } from "react";
import { Dialog as Parts } from "@base-ui/react/dialog";
import { Button } from "../Button";
import styles from "./Dialog.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;

export const DialogPortal = Parts.Portal;
export const DialogTrigger = Parts.Trigger;
export const DialogClose = Parts.Close;

export type DialogRootProps = Pick<Parts.Root.Props, "children" | "open" | "defaultOpen" | "onOpenChange" | "onOpenChangeComplete">;
export type DialogContentProps = Omit<Parts.Popup.Props, "className"> & {
  className?: string;
  showCloseButton?: boolean;
  closeLabel?: string;
  "data-slot"?: string;
};

export function DialogOverlay({ className, ...props }: Omit<Parts.Backdrop.Props, "className"> & { className?: string }) {
  return <Parts.Backdrop {...props} data-slot="dialog-overlay" className={[styles.backdrop, className].filter(Boolean).join(" ")} />;
}

function CornerClose({ label, buttonRef }: { label: string; buttonRef: Ref<HTMLButtonElement> }) {
  return <DialogClose render={<Button ref={buttonRef} className={styles.closeButton} variant="tertiary" form="icon" size="sm" aria-label={label} />}>
    <img src={closeIcon} alt="" width={24} height={24} />
  </DialogClose>;
}

export function DialogContent({ className, children, showCloseButton = true, closeLabel = "Close", initialFocus, ...props }: DialogContentProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <DialogPortal>
      <DialogOverlay />
      <Parts.Viewport className={styles.viewport}>
        <Parts.Popup data-dialog="" data-slot="dialog" data-variant="default" {...props} aria-modal="true"
          className={[styles.dialog, className].filter(Boolean).join(" ")}
          initialFocus={initialFocus ?? (showCloseButton ? closeRef : true)}>
          {showCloseButton && <div className={styles.closeRow}><CornerClose label={closeLabel} buttonRef={closeRef} /></div>}
          {children}
        </Parts.Popup>
      </Parts.Viewport>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: ComponentPropsWithRef<"header">) {
  return <header {...props} data-slot="dialog-header" className={[styles.header, className].filter(Boolean).join(" ")} />;
}

export function DialogTitle({ className, ...props }: Omit<Parts.Title.Props, "className"> & { className?: string }) {
  return <Parts.Title data-slot="dialog-title" {...props} className={[styles.title, className].filter(Boolean).join(" ")} />;
}

export function DialogDescription({ className, ...props }: Omit<Parts.Description.Props, "className"> & { className?: string }) {
  return <Parts.Description data-slot="dialog-description" {...props} className={[styles.description, className].filter(Boolean).join(" ")} />;
}

export function DialogBody({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-dialog-content="" className={[styles.content, className].filter(Boolean).join(" ")} />;
}

export function DialogFooter({ className, children, showCloseButton = false, closeLabel = "Close", ...props }:
  ComponentPropsWithRef<"div"> & { showCloseButton?: boolean; closeLabel?: string }) {
  return <div {...props} data-slot="dialog-footer" className={[styles.footer, className].filter(Boolean).join(" ")}>
    {children}
    {showCloseButton && <DialogClose render={<Button variant="secondary" />}>{closeLabel}</DialogClose>}
  </div>;
}

interface DialogBaseProps extends Omit<ComponentPropsWithoutRef<"div">, "title" | "onClose" | "role"> {
  initialFocus?: Parts.Popup.Props["initialFocus"];
  finalFocus?: Parts.Popup.Props["finalFocus"];
  open: boolean;
  title: string;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  footer?: ReactNode;
  "data-slot"?: string;
}

export type DialogProps = DialogBaseProps & (
  | { variant?: "default"; showCloseButton?: boolean; closeLabel: string }
  | { variant?: "default"; showCloseButton: false; closeLabel?: string }
  | { variant: "confirmation"; showCloseButton?: false; closeLabel?: never }
);

function ControlledDialog({
  open, title, closeLabel, onClose, role = "dialog", variant = "default", showCloseButton = variant !== "confirmation",
  footer, initialFocus, id: providedId, children, ...props
}: DialogProps) {
  const generatedId = useId();
  const id = providedId ?? `dialog-${generatedId}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  return <Parts.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
    <DialogContent {...props} id={id} role={role} data-variant={variant} showCloseButton={false}
      initialFocus={initialFocus ?? (showCloseButton ? closeRef : true)}>
      <div className={styles.body} data-slot="dialog-body">
        <DialogHeader>
          {showCloseButton && <CornerClose label={closeLabel ?? "Close"} buttonRef={closeRef} />}
          <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody data-slot={`${id}-content`}>{children}</DialogBody>
      </div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Parts.Root>;
}

export function Dialog(props: DialogProps | DialogRootProps) {
  return "title" in props ? <ControlledDialog {...props} /> : <Parts.Root {...props} />;
}
