"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import type { ComponentPropsWithRef } from "react";
import { Divider } from "../Divider";
import { FieldDensityContext, type FieldDensity } from "./density";
import styles from "./Field.module.css";

export type FieldProps = Omit<FieldPrimitive.Root.Props, "className"> & {
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  density?: FieldDensity;
};
export type FieldLabelProps = Omit<FieldPrimitive.Label.Props, "className"> & { className?: string };
export type FieldDescriptionProps = Omit<FieldPrimitive.Description.Props, "className"> & { className?: string };
export type FieldErrorProps = Omit<FieldPrimitive.Error.Props, "className"> & {
  className?: string;
  errors?: ReadonlyArray<{ message?: string } | undefined>;
};

export function Field({ className, orientation = "vertical", density, ...props }: FieldProps) {
  return <FieldDensityContext.Provider value={density}>
    <FieldPrimitive.Root role="group" data-slot="field" data-orientation={orientation} data-density={density} {...props}
      className={[styles.root, className].filter(Boolean).join(" ")} />
  </FieldDensityContext.Provider>;
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <FieldPrimitive.Label data-slot="field-label" {...props} className={[styles.label, className].filter(Boolean).join(" ")} />;
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <FieldPrimitive.Description data-slot="field-description" {...props} className={[styles.description, className].filter(Boolean).join(" ")} />;
}

export function FieldError({ className, errors, children, match, ...props }: FieldErrorProps) {
  if (errors) match ??= true;
  if (errors && children == null) {
    const messages = [...new Set(errors.map(error => error?.message).filter(Boolean))];
    if (!messages.length) return null;
    children = messages.length === 1 ? messages[0] : <ul role="list">{messages.map(message => <li key={message}>{message}</li>)}</ul>;
  }
  return <FieldPrimitive.Error data-slot="field-error" role="alert" match={match} {...(children != null && { children })} {...props} className={[styles.error, className].filter(Boolean).join(" ")} />;
}

export function FieldSet({ className, ...props }: Omit<Fieldset.Root.Props, "className"> & { className?: string }) {
  return <Fieldset.Root data-slot="field-set" {...props} className={[styles.set, className].filter(Boolean).join(" ")} />;
}

export function FieldLegend({ className, variant = "legend", ...props }: Omit<Fieldset.Legend.Props, "className"> & { className?: string; variant?: "legend" | "label" }) {
  return <Fieldset.Legend render={<legend />} data-variant={variant} data-slot="field-legend" {...props} className={[styles.legend, className].filter(Boolean).join(" ")} />;
}

export function FieldGroup({ className, layout = "stack", ...props }: ComponentPropsWithRef<"div"> & { layout?: "stack" | "responsive" }) {
  return <div data-slot="field-group" data-layout={layout} {...props} className={[styles.group, className].filter(Boolean).join(" ")} />;
}

export function FieldContent({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div data-slot="field-content" {...props} className={[styles.content, className].filter(Boolean).join(" ")} />;
}

export function FieldTitle({ className, ...props }: ComponentPropsWithRef<"span">) {
  return <span data-slot="field-title" {...props} className={[styles.label, className].filter(Boolean).join(" ")} />;
}

export function FieldSeparator({ className, children, ...props }: ComponentPropsWithRef<"div">) {
  return <div data-slot="field-separator" {...props} className={[styles.separator, className].filter(Boolean).join(" ")}>
    <Divider />
    {children != null && <><span>{children}</span><Divider aria-hidden="true" /></>}
  </div>;
}
