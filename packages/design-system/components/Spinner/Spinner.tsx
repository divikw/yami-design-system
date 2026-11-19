import type { ComponentPropsWithRef } from "react";
import styles from "./Spinner.module.css";

export type SpinnerProps = Omit<ComponentPropsWithRef<"span">, "children">;

export function Spinner({ className, ...props }: SpinnerProps) {
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);
  return <span role={labelled ? "status" : undefined} aria-hidden={labelled ? undefined : true}
    {...props} data-slot="spinner" className={[styles.root, className].filter(Boolean).join(" ")} />;
}
