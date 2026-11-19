"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { Ref } from "react";
import styles from "./Slider.module.css";

export type SliderProps<Value extends number | readonly number[] = number | readonly number[]> =
  Omit<BaseSlider.Root.Props<Value>, "children" | "className"> &
  Pick<BaseSlider.Thumb.Props, "getAriaLabel" | "getAriaValueText"> & {
    className?: string;
    ref?: Ref<HTMLDivElement>;
  };

export function Slider<Value extends number | readonly number[]>({
  className, value, defaultValue, getAriaLabel, getAriaValueText,
  "aria-label": label, "aria-labelledby": labelledBy, "aria-describedby": describedBy, ...props
}: SliderProps<Value>) {
  const current = value ?? defaultValue;
  const count = Array.isArray(current) ? current.length : 1;
  return (
    <BaseSlider.Root {...props} value={value} defaultValue={defaultValue} aria-label={label}
      aria-labelledby={labelledBy} data-slot="slider" className={[styles.root, className].filter(Boolean).join(" ")}>
      <BaseSlider.Control className={styles.control}>
        <BaseSlider.Track className={styles.track}>
          <BaseSlider.Indicator className={styles.indicator} />
          {Array.from({ length: count }, (_, index) => (
            <BaseSlider.Thumb key={index} index={index} className={styles.thumb}
              aria-label={label} aria-labelledby={getAriaLabel ? undefined : labelledBy}
              aria-describedby={describedBy} getAriaLabel={getAriaLabel} getAriaValueText={getAriaValueText} />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
