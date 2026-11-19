"use client";

import { Toast as Base } from "@base-ui/react/toast";
import { Button } from "../Button";
import { Spinner } from "../Spinner";
import styles from "./Toast.module.css";

export const createToastManager = Base.createToastManager;
export const useToastManager = Base.useToastManager;
export const toast = createToastManager();
export const ToastProvider = Base.Provider;
export const ToastPortal = Base.Portal;

type Styled<P> = Omit<P, "className"> & { className?: string };
export type ToastProps = Styled<Base.Root.Props>;

export function Toast({ className, ...props }: ToastProps) {
  return <Base.Root {...props} data-slot="toast" className={[styles.root, className].filter(Boolean).join(" ")} />;
}
export function ToastViewport({ className, ...props }: Styled<Base.Viewport.Props>) {
  return <Base.Viewport {...props} data-slot="toast-viewport" className={[styles.viewport, className].filter(Boolean).join(" ")} />;
}
export function ToastContent({ className, ...props }: Styled<Base.Content.Props>) {
  return <Base.Content {...props} data-slot="toast-content" className={[styles.content, className].filter(Boolean).join(" ")} />;
}
export function ToastTitle({ className, ...props }: Styled<Base.Title.Props>) {
  return <Base.Title {...props} data-slot="toast-title" className={[styles.title, className].filter(Boolean).join(" ")} />;
}
export function ToastDescription({ className, ...props }: Styled<Base.Description.Props>) {
  return <Base.Description {...props} data-slot="toast-description" className={[styles.description, className].filter(Boolean).join(" ")} />;
}
export function ToastAction(props: Base.Action.Props) {
  return <Base.Action render={<Button variant="secondary" size="sm" />} {...props} data-slot="toast-action" />;
}
export function ToastClose({ children, ...props }: Base.Close.Props) {
  return <Base.Close aria-label="Close notification" render={<Button form="icon" size="sm" variant="tertiary" />}
    {...props} data-slot="toast-close">{children ?? <span aria-hidden="true" className={styles.closeIcon} />}</Base.Close>;
}

function StatusIcon({ type }: { type?: string }) {
  if (type === "loading") return <Spinner />;
  if (!type || !["success", "info", "warning", "error"].includes(type)) return null;
  return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "warning" ? <path d="M12 3 22 21H2Z" /> : <circle cx="12" cy="12" r="9" />}
    {type === "success" && <path d="m7.5 12 3 3 6-6" />}
    {type === "info" && <path d="M12 11v5m0-9v.1" />}
    {type === "warning" && <path d="M12 9v5m0 3v.1" />}
    {type === "error" && <path d="m9 9 6 6m0-6-6 6" />}
  </svg>;
}

export type ToastPosition = `${"top" | "bottom"}-${"left" | "center" | "right"}`;

function ToastList({ closeLabel, viewportLabel, position }: { closeLabel: string; viewportLabel: string; position?: ToastPosition }) {
  const { toasts } = useToastManager();
  const swipeDirection: Base.Root.Props["swipeDirection"] = position && [
    position.startsWith("top-") ? "up" : "down",
    position.endsWith("-left") ? "left" : "right",
  ];
  return toasts.map(item => <Toast toast={item} key={item.id} swipeDirection={swipeDirection} aria-label={item.title ? undefined : viewportLabel}>
    <ToastContent>
      <StatusIcon type={item.type} />
      <div className={styles.message}><ToastTitle /><ToastDescription /></div>
      <ToastAction /><ToastClose aria-label={closeLabel} />
    </ToastContent>
  </Toast>);
}

export type ToasterProps = Base.Provider.Props & {
  position?: ToastPosition;
  closeLabel?: string;
  viewportLabel?: string;
  container?: Base.Portal.Props["container"];
};

export function Toaster({ children, toastManager = toast, closeLabel = "Close notification",
  viewportLabel = "Notifications", container, position, ...props }: ToasterProps) {
  return <ToastProvider {...props} toastManager={toastManager}>
    {children}
    <ToastPortal container={container}>
      <ToastViewport aria-label={viewportLabel} data-position={position}>
        <ToastList closeLabel={closeLabel} viewportLabel={viewportLabel} position={position} />
      </ToastViewport>
    </ToastPortal>
  </ToastProvider>;
}
