"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Select } from "@base-ui/react/select";
import styles from "./QuantitySelect.module.css";

const warningIcon = new URL("../../assets/icons/base/warning-fill.svg", import.meta.url).href;
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
  const selectRef = useRef<HTMLButtonElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const skipCommitRef = useRef(false);
  const returnFocusRef = useRef(false);
  const [draft, setDraft] = useState(String(value));
  const [limitToast, setLimitToast] = useState(0);
  const unavailable = disabled || loading;
  const message = error;
  const zh = locale === "zh";
  const showInput = editing || value >= 10;
  const limitMessage = zh ? `已达到数量上限 ${max}` : `Maximum quantity is ${max}`;

  useEffect(() => { if (unavailable) setOpen(false); }, [unavailable]);

  useEffect(() => {
    const ownerDocument = selectRef.current!.ownerDocument;
    const onKeyDown = () => setKeyboardFocus(true);
    const onPointerDown = () => setKeyboardFocus(false);
    ownerDocument.addEventListener("keydown", onKeyDown, true);
    ownerDocument.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      ownerDocument.removeEventListener("keydown", onKeyDown, true);
      ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  useEffect(() => {
    if (!limitToast) return;
    const timeout = window.setTimeout(() => setLimitToast(0), 2500);
    return () => window.clearTimeout(timeout);
  }, [limitToast]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      setDraft(String(value));
      if (returnFocusRef.current && value < 10) selectRef.current?.focus({ preventScroll: true });
      returnFocusRef.current = false;
    }
  }, [editing, value]);

  function commit() {
    setEditing(false);
    if (skipCommitRef.current || unavailable) {
      skipCommitRef.current = false;
      setDraft(String(value));
      return;
    }
    const entered = Number(draft);
    const next = Math.max(1, Math.min(max, entered));
    setDraft(String(next));
    if (entered > max) setLimitToast((count) => count + 1);
    if (next !== value) onValueChange(next);
  }

  return <div className={styles.root} lang={locale} data-slot="quantity-select" data-keyboard-focus={keyboardFocus || undefined} aria-busy={loading || undefined}>
    <span className={styles.control} hidden={showInput} data-slot="quantity-select-control">
      <Select.Root value={value >= 10 ? "custom" : String(value)} open={open && !unavailable} onOpenChange={setOpen} disabled={unavailable} modal={false}
        onValueChange={(next) => {
          if (next === null) return;
          setOpen(false);
          if (next === "custom") {
            setDraft(String(value >= 10 ? value : Math.min(10, max)));
            setEditing(true);
          } else {
            setEditing(false);
            onValueChange(Number(next));
          }
        }}>
        <Select.Trigger ref={selectRef} hidden={showInput} className={styles.select} aria-label={label} aria-describedby={message ? `${id}-error` : loading ? `${id}-status` : undefined}
          aria-invalid={!editing && Boolean(message) || undefined}>
          <span ref={displayRef} className={styles.display} data-slot="quantity-select-display" aria-hidden="true">
            <span className={styles.value}>{value}</span><span className={styles.arrow} style={{ maskImage: `url("${arrowIcon}")` }} />
          </span>
        </Select.Trigger>
        <Select.Portal container={selectRef.current?.closest("dialog") ?? undefined}>
          <Select.Positioner className={styles.positioner} anchor={displayRef} align="start" alignItemWithTrigger={false} sideOffset={-12} collisionPadding={8}>
            <Select.Popup className={styles.popup} data-slot="quantity-select-popup" finalFocus={editing ? inputRef : true}>
              <Select.List className={styles.list}>
                {[...Array.from({ length: Math.min(9, max) }, (_, index) => ({ value: String(index + 1), label: String(index + 1) })), ...(max >= 10 ? [{ value: "custom", label: value >= 10 ? String(value) : "10+" }] : [])].map((option) =>
                  <Select.Item className={styles.option} key={option.value} value={option.value}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className={styles.check}>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Select.ItemIndicator>
                  </Select.Item>)}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </span>
    {showInput && <label className={styles.inputTarget} htmlFor={`${id}-input`}>
      <input ref={inputRef} id={`${id}-input`} className={styles.input} data-slot="quantity-select-input" type="text" inputMode="numeric" autoComplete="off"
        value={draft} disabled={unavailable} aria-label={zh ? `${label}：输入数量` : `${label}: enter quantity`}
        aria-invalid={Boolean(message) || undefined} aria-describedby={message ? `${id}-error` : loading ? `${id}-status` : undefined}
        onFocus={() => setEditing(true)} onBlur={commit}
        onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            returnFocusRef.current = true;
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            skipCommitRef.current = true;
            returnFocusRef.current = true;
            setDraft(String(value));
            event.currentTarget.blur();
          }
        }} />
    </label>}
    {limitToast > 0 && createPortal(<div key={limitToast} className={styles.toast} data-slot="quantity-limit-toast" role="alert" lang={locale}>
      <span className={styles.toastIcon} style={{ maskImage: `url("${warningIcon}")` }} aria-hidden="true" />
      <p>{limitMessage}</p>
    </div>, inputRef.current?.closest("dialog") ?? document.body)}
    {message && <p id={`${id}-error`} className={styles.error} role="alert">{message}</p>}
    {loading && <span id={`${id}-status`} className={styles.hint} role="status">{zh ? "正在更新数量…" : "Updating quantity…"}</span>}
  </div>;
}
