"use client";

import { Select } from "@base-ui/react/select";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import styles from "./workbench-controls.module.css";

export function WorkbenchIcon({ size = 16, ...props }: HugeiconsIconProps) {
  return <HugeiconsIcon size={size} strokeWidth={1.5} aria-hidden="true" focusable="false" {...props} />;
}

export interface WorkbenchSelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface WorkbenchTextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hideLabel?: boolean;
  suffix?: ReactNode;
}

export function WorkbenchTextField({
  label,
  hideLabel = false,
  suffix,
  id,
  className,
  ...props
}: WorkbenchTextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputClassName = [styles.textInput, className].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <label
        className={hideLabel ? styles.visuallyHidden : styles.label}
        data-slot={hideLabel ? undefined : "workbench-field-label"}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className={styles.inputWrap} data-has-suffix={suffix ? true : undefined}>
        <input {...props} id={inputId} className={inputClassName} />
        {suffix && <span className={styles.inputSuffix} aria-hidden="true">{suffix}</span>}
      </div>
    </div>
  );
}

export interface WorkbenchSelectProps {
  label: ReactNode;
  options: readonly WorkbenchSelectOption[];
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  name?: string;
}

export function WorkbenchSelect({
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  name,
}: WorkbenchSelectProps) {
  return (
    <div className={styles.field}>
      <Select.Root
        items={options}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue);
        }}
        disabled={disabled}
        name={name}
      >
        <Select.Label className={styles.label} data-slot="workbench-field-label">
          {label}
        </Select.Label>
        <Select.Trigger
          className={styles.selectTrigger}
          data-slot="workbench-select-trigger"
          data-value={value}
        >
          <Select.Value className={styles.selectValue} />
          <Select.Icon className={styles.selectIcon}>
            <WorkbenchIcon
              icon={ArrowDown01Icon}
              data-slot="workbench-select-icon"
              size={12}
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className={styles.selectPositioner}
            sideOffset={4}
            align="start"
            alignItemWithTrigger={false}
          >
            <Select.Popup className={styles.selectPopup} data-slot="workbench-select-popup">
              <Select.List className={styles.selectList}>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={styles.selectItem}
                    data-value={option.value}
                  >
                    <Select.ItemText className={styles.selectItemText}>
                      {option.label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export type WorkbenchButtonVariant = "secondary" | "emphasis";
export type WorkbenchButtonSize = "compact" | "default";

export interface WorkbenchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: WorkbenchButtonVariant;
  size?: WorkbenchButtonSize;
}

export function WorkbenchButton({
  variant = "secondary",
  size = "compact",
  type = "button",
  className,
  ...props
}: WorkbenchButtonProps) {
  const buttonClassName = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <button {...props} type={type} className={buttonClassName} />;
}

export interface WorkbenchLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: WorkbenchButtonVariant;
  size?: WorkbenchButtonSize;
}

export function WorkbenchLink({
  variant = "secondary",
  size = "compact",
  className,
  ...props
}: WorkbenchLinkProps) {
  const linkClassName = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <a {...props} className={linkClassName} />;
}

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: ReactNode;
  children?: ReactNode;
  options: readonly SegmentedOption[];
  value: string;
  onValueChange(value: string): void;
  name?: string;
  disabled?: boolean;
}

export function SegmentedControl({
  label,
  children,
  options,
  value,
  onValueChange,
  name,
  disabled = false,
}: SegmentedControlProps) {
  const generatedName = useId();

  return (
    <div className={styles.segmentedField} role="group" aria-labelledby={`${generatedName}-label`} aria-disabled={disabled || undefined}>
      <div id={`${generatedName}-label`} className={styles.label} data-slot="workbench-field-label">{label}</div>
      <div className={styles.segmentedBody}>
        <div className={styles.segmentedOptions} data-slot="workbench-segmented-options">
          {options.map((option) => (
            <label className={styles.segmentedOption} key={option.value}>
              <input
                className={styles.segmentedInput}
                type="radio"
                disabled={disabled}
                name={name ?? generatedName}
                value={option.value}
                checked={value === option.value}
                onChange={() => onValueChange(option.value)}
              />
              <span className={styles.segmentedLabel}>{option.label}</span>
            </label>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
