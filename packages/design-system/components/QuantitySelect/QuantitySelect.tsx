"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ButtonGroup } from "../ButtonGroup";
import { Button } from "../Button";
import { Input } from "../Input";
import styles from "./QuantitySelect.module.css";

const arrowIcon = new URL("../../assets/icons/action/arrow-down.svg", import.meta.url).href;

export interface QuantitySelectProps {
  value: number;
  /** Positive stock/purchase limit supplied by the host. */
  max: number;
  onValueChange: (value: number) => void;
  /** Include the product name when multiple selectors appear together. */
  label: string;
  locale?: "zh" | "en";
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}

export function QuantitySelect({ value, max, onValueChange, label, locale = "zh", disabled = false, loading = false, error }: QuantitySelectProps) {
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [validation, setValidation] = useState("");
  const unavailable = disabled || loading;
  const message = validation || error;
  const zh = locale === "zh";
  const range = zh ? `请输入 1–${max} 之间的整数` : `Enter a whole number from 1 to ${max}`;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function finish() {
    selectRef.current?.focus({ preventScroll: true });
    setEditing(false);
    setValidation("");
  }

  return <div className={styles.root} lang={locale} data-slot="quantity-select" aria-busy={loading || undefined}>
    <span className={styles.control} data-slot="quantity-select-control">
    <select ref={selectRef} className={styles.select} aria-label={label} aria-describedby={message ? `${id}-error` : loading ? `${id}-status` : undefined}
      aria-invalid={!editing && Boolean(message) || undefined} value={value >= 10 ? "custom" : String(value)} disabled={unavailable}
      onChange={(event) => {
        setValidation("");
        if (event.target.value === "custom") {
          setDraft(String(value >= 10 ? value : Math.min(10, max)));
          setEditing(true);
        } else {
          setEditing(false);
          onValueChange(Number(event.target.value));
        }
      }}>
      {Array.from({ length: Math.min(9, max) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
      {max >= 10 && <option value="custom">{value >= 10 ? value : "10+"}</option>}
    </select>
    <span className={styles.display} data-slot="quantity-select-display" aria-hidden="true">
      <span>{value}</span><span className={styles.arrow} style={{ maskImage: `url("${arrowIcon}")` }} />
    </span>
    </span>
    {value >= 10 && !editing && <Button size="sm" variant="tertiary" disabled={unavailable} aria-label={zh ? `修改${label}` : `Edit ${label}`} onClick={() => { setDraft(String(value)); setEditing(true); }}>{zh ? "修改" : "Edit"}</Button>}
    {editing && <form className={styles.editor} noValidate onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finish(); }
    }} onSubmit={(event) => {
      event.preventDefault();
      if (unavailable) return;
      const next = Number(draft);
      if (!/^\d+$/.test(draft) || !Number.isSafeInteger(next) || next < 1 || next > max) {
        setValidation(range);
        inputRef.current?.focus();
        return;
      }
      onValueChange(next);
      finish();
    }}>
      <Input ref={inputRef} fullWidth value={draft} label={zh ? "数量" : "Quantity"} aria-label={zh ? `${label}：输入数量` : `${label}: enter quantity`} inputMode="numeric" disabled={unavailable}
        state={message ? "error" : undefined} aria-describedby={validation ? `${id}-error` : `${id}-hint${error ? ` ${id}-error` : ""}`}
        onChange={(event) => { setDraft(event.target.value); setValidation(""); }} />
      {!validation && <p id={`${id}-hint`} className={styles.hint}>{range}</p>}
      {message && <p id={`${id}-error`} className={styles.error} role="alert">{message}</p>}
      <ButtonGroup className={styles.actions} aria-label={zh ? `修改${label}` : `Edit ${label}`}>
        <Button size="sm" htmlType="submit" loading={loading} disabled={disabled}>{zh ? "确认" : "Apply"}</Button>
        <Button size="sm" variant="tertiary" onClick={finish}>{zh ? "取消" : "Cancel"}</Button>
      </ButtonGroup>
    </form>}
    {!editing && message && <p id={`${id}-error`} className={styles.error} role="alert">{message}</p>}
    {loading && <span id={`${id}-status`} className={styles.hint} role="status">{zh ? "正在更新数量…" : "Updating quantity…"}</span>}
  </div>;
}
