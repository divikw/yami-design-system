"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import styles from "./Accordion.module.css";

export type AccordionProps<Value = string> = AccordionPrimitive.Root.Props<Value>;
export type AccordionItemProps = AccordionPrimitive.Item.Props;
export type AccordionTriggerProps = AccordionPrimitive.Trigger.Props;
export type AccordionContentProps = AccordionPrimitive.Panel.Props;

function partClassName<State>(base: string, className?: string | ((state: State) => string | undefined)) {
  const join = (custom?: string) => custom ? `${base} ${custom}` : base;
  return typeof className === "function" ? (state: State) => join(className(state)) : join(className);
}

export function Accordion<Value = string>({ className, ...props }: AccordionProps<Value>) {
  return <AccordionPrimitive.Root<Value> {...props} className={partClassName(styles.group, className)} data-slot="accordion" />;
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item {...props} className={partClassName(styles.root, className)} data-slot="accordion-item" />;
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className={styles.heading}>
      <AccordionPrimitive.Trigger {...props} className={partClassName(styles.trigger, className)} data-slot="accordion-trigger">
        <span className={styles.label}>{children}</span>
        <span className={styles.icon} aria-hidden="true" data-slot="accordion-icon" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, ...props }: AccordionContentProps) {
  return <AccordionPrimitive.Panel {...props} className={partClassName(styles.content, className)} data-slot="accordion-content" />;
}
