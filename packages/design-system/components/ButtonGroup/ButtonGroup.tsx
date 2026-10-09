import type { ComponentPropsWithRef } from "react";
import styles from "./ButtonGroup.module.css";

export interface ButtonGroupProps extends ComponentPropsWithRef<"div"> {
  /** Fill the available width with equal-width buttons, up to 480px. */
  full?: boolean;
  /** Accessible name describing the related actions. */
  "aria-label": string;
}

/** Groups related Buttons without changing their appearance or behavior. */
export function ButtonGroup({ full = false, className, ...props }: ButtonGroupProps) {
  return <div {...props} role="group" data-slot="button-group" data-full={full}
    className={[styles.group, className].filter(Boolean).join(" ")} />;
}
