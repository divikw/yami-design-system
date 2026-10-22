"use client";

import { type ComponentPropsWithRef, type ReactNode, useId, useState } from "react";

import styles from "./Accordion.module.css";

export interface AccordionProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  label: ReactNode;
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function Accordion({
  id,
  label,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  headingLevel = 2,
  className,
  ...rest
}: AccordionProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded ?? internalExpanded;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <div
      {...rest}
      id={id}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-slot="accordion"
      data-expanded={expanded}
    >
      <Heading className={styles.heading}>
        <button
          id={triggerId}
          className={styles.trigger}
          type="button"
          disabled={disabled}
          aria-expanded={expanded}
          aria-controls={contentId}
          data-slot="accordion-trigger"
          onClick={() => {
            const next = !expanded;
            if (controlledExpanded === undefined) setInternalExpanded(next);
            onExpandedChange?.(next);
          }}
        >
          <span className={styles.label}>{label}</span>
          <span
            className={styles.icon}
            aria-hidden="true"
            data-slot="accordion-icon"
            data-direction={expanded ? "up" : "down"}
          />
        </button>
      </Heading>
      <div
        id={contentId}
        className={styles.content}
        hidden={!expanded}
        role="region"
        aria-labelledby={triggerId}
        data-slot="accordion-content"
      >
        {children}
      </div>
    </div>
  );
}
