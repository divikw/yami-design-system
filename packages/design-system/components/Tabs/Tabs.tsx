"use client"

import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react"

import styles from "./Tabs.module.css"

export type TabsValue = string
export type TabsOrientation = "horizontal" | "vertical"
export type TabsActivationMode = "automatic" | "manual"
export type TabsVariant = "primary" | "secondary" | "tertiary"
export type TabsStyleVariant = "a" | "b"

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: TabsValue
  defaultValue?: TabsValue
  onValueChange?: (value: TabsValue) => void
  orientation?: TabsOrientation
  activationMode?: TabsActivationMode
  children?: ReactNode
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  activateOnFocus?: boolean
  loopFocus?: boolean
  centerActiveTab?: boolean
  align?: "start" | "center"
  edgePadding?: boolean
  variant?: TabsVariant | "default" | "line"
  styleVariant?: TabsStyleVariant
  inverse?: boolean
  fullWidth?: boolean
  skeleton?: boolean
  skeletonCount?: number
  children?: ReactNode
}

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  value: TabsValue
  controls?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: TabsValue
  keepMounted?: boolean
  children?: ReactNode
}

interface TabsContextValue {
  value: TabsValue | undefined
  setValue: (value: TabsValue) => void
  orientation: TabsOrientation
  activationMode: TabsActivationMode
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function useTabsContext(component: string) {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error(`${component} must be rendered inside <Tabs>.`)
  }

  return context
}

function toIdPart(value: TabsValue) {
  return encodeURIComponent(value)
}

function getTabId(baseId: string, value: TabsValue) {
  return `${baseId}-tab-${toIdPart(value)}`
}

function getPanelId(baseId: string, value: TabsValue) {
  return `${baseId}-panel-${toIdPart(value)}`
}

function revealTab(tab: HTMLButtonElement, orientation: TabsOrientation) {
  const list = tab.closest<HTMLElement>('[role="tablist"]')
  if (!list) return

  const tabRect = tab.getBoundingClientRect()
  const listRect = list.getBoundingClientRect()

  if (orientation === "vertical") {
    if (tabRect.top < listRect.top) {
      list.scrollTop += tabRect.top - listRect.top
    } else if (tabRect.bottom > listRect.bottom) {
      list.scrollTop += tabRect.bottom - listRect.bottom
    }
    return
  }

  if (list.scrollWidth <= list.clientWidth) return

  const tabCenter = tabRect.left + tabRect.width / 2
  const listCenter = listRect.left + listRect.width / 2
  const prefersReducedMotion =
    tab.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)")
      .matches ?? false

  list.scrollTo({
    left: list.scrollLeft + tabCenter - listCenter,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  })
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    className,
    id,
    children,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const [internalValue, setInternalValue] = useState<TabsValue | undefined>(defaultValue)
  const selectedValue = value ?? internalValue
  const baseId = id ?? generatedId

  const context = useMemo<TabsContextValue>(
    () => ({
      value: selectedValue,
      orientation,
      activationMode,
      baseId,
      setValue: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue)
        }

        onValueChange?.(nextValue)
      },
    }),
    [activationMode, baseId, onValueChange, orientation, selectedValue, value],
  )

  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        {...rest}
        ref={ref}
        id={id}
        className={cx(styles.root, className)}
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        value={selectedValue ?? null}
        onValueChange={(next) => context.setValue(next)}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  )
})

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  {
    variant: variantProp = "primary",
    styleVariant: styleVariantProp,
    inverse = false,
    fullWidth = false,
    skeleton = false,
    skeletonCount = 4,
    centerActiveTab = false,
    activateOnFocus,
    loopFocus,
    align = "start",
    edgePadding = false,
    className,
    children,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const context = useTabsContext("TabsList")
  const variant = variantProp === "default" || variantProp === "line" ? "primary" : variantProp
  const styleVariant = styleVariantProp ?? (variantProp === "default" ? "b" : "a")
  const isSegmented = variant === "primary" && styleVariant === "b"
  const listRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    if (!centerActiveTab || skeleton) return
    const frame = requestAnimationFrame(() => {
      const active = listRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')
      if (active) revealTab(active, context.orientation)
    })
    return () => cancelAnimationFrame(frame)
  }, [centerActiveTab, skeleton, context.value, context.orientation])


  function handleKeyDown(event: Parameters<NonNullable<BaseTabs.List.Props["onKeyDown"]>>[0]) {
    onKeyDown?.(event)
    if (event.defaultPrevented) {
      event.preventBaseUIHandler()
      return
    }

    const navigationKeys = context.orientation === "horizontal"
      ? ["ArrowLeft", "ArrowRight", "Home", "End"]
      : ["ArrowUp", "ArrowDown", "Home", "End"]
    if (!navigationKeys.includes(event.key)) return

    // The composite schedules focus in a microtask after this handler.
    const list = event.currentTarget
    queueMicrotask(() => {
      if (!event.defaultPrevented) return
      queueMicrotask(() => {
        const focused = list.ownerDocument.activeElement as HTMLButtonElement | null
        if (focused?.closest('[role="tablist"]') !== list || focused.getAttribute("role") !== "tab") return
        if (activateOnFocus === undefined && context.activationMode === "automatic") focused.click()
        else revealTab(focused, context.orientation)
      })
    })
  }

  const listClassName = cx(styles.list, className)

  if (skeleton) {
    const skeletonItems = Array.from({ length: skeletonCount }, (_, index) => (
      <span
        key={index}
        className={cx(styles.skeletonItem, index === 0 && styles.skeletonItemWide)}
      />
    ))

    return (
      <div
        {...rest}
        ref={ref}
        className={listClassName}
        data-slot="tabs-list"
        data-variant={variant}
        data-style={styleVariant}
        data-inverse={inverse || undefined}
        data-full-width={fullWidth || undefined}
        data-skeleton="true"
        aria-hidden="true"
      >
        {isSegmented ? <div className={styles.track}>{skeletonItems}</div> : skeletonItems}
      </div>
    )
  }

  return (
    <BaseTabs.List
      {...rest}
      ref={(node) => {
        listRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      data-align={align}
      data-edge-padding={edgePadding || undefined}
      role="tablist"
      aria-orientation={context.orientation}
      className={listClassName}
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      data-slot="tabs-list"
      data-variant={variant}
      data-style={styleVariant}
      data-inverse={inverse || undefined}
      data-full-width={fullWidth || undefined}
      onKeyDown={handleKeyDown}
    >
      {isSegmented ? <div className={styles.track}>{children}</div> : children}
    </BaseTabs.List>
  )
})

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  {
    value,
    controls,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    children,
    onClick,
    onPointerDown,
    ...rest
  },
  ref,
) {
  const context = useTabsContext("TabsTrigger")
  const selectedOnPress = useRef<boolean | undefined>(undefined)
  const selected = context.value === value
  const tabId = getTabId(context.baseId, value)
  const panelId = getPanelId(context.baseId, value)
  const props = {
    ...rest,
    id: tabId,
    role: "tab",
    className: cx(styles.trigger, className),
    "data-slot": "tabs-trigger",
    "data-state": selected ? "active" : "inactive",
    children: <>
      {leftIcon && (
        <span className={styles.icon} data-position="start" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {rightIcon && (
        <span className={styles.icon} data-position="end" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>,
  }

  // Base UI includes disabled tabs in its roving focus order. YAMI skips them.
  if (disabled) {
    return <button {...props} ref={ref} type="button" aria-disabled="true" aria-selected={selected} aria-controls={controls ?? panelId} onPointerDown={onPointerDown}
      tabIndex={-1} data-disabled="true" onClick={(event) => event.preventDefault()} />
  }

  return (
    <BaseTabs.Tab
      {...props}
      ref={ref}
      type="button"
      value={value}
      render={(props) => (
        <button {...props} aria-controls={controls ?? (props["aria-controls"] ? panelId : undefined)} />
      )}
      onPointerDown={(event) => {
        selectedOnPress.current = selected
        onPointerDown?.(event)
      }}
      onClick={(event) => {
        onClick?.(event)

        if (event.defaultPrevented) {
          event.preventBaseUIHandler()
          return
        }
        // Base UI skips reselecting an active tab; YAMI consumers can use it to reveal a section again.
        // Focus can activate a new tab between pointerdown and click.
        if (selected && (event.detail === 0 || selectedOnPress.current !== false)) context.setValue(value)
        selectedOnPress.current = undefined
        const tab = event.currentTarget
        tab.ownerDocument.defaultView?.requestAnimationFrame(() => revealTab(tab, context.orientation))
      }}
    />
  )
})

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, className, children, keepMounted = true, ...rest },
  ref,
) {
  const context = useTabsContext("TabsContent")
  const selected = context.value === value
  const tabId = getTabId(context.baseId, value)
  const panelId = getPanelId(context.baseId, value)

  return (
    <BaseTabs.Panel
      {...rest}
      ref={ref}
      value={value}
      keepMounted={keepMounted}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!selected}
      tabIndex={0}
      className={cx(styles.content, className)}
      data-slot="tabs-content"
      data-state={selected ? "active" : "inactive"}
    >
      {children}
    </BaseTabs.Panel>
  )
})
