"use client";

import type { ReactNode } from "react";

import {
  Button,
  FilterChip,
  FilterChipCategoryMenu,
  FilterChipGroup,
  FilterChipMenu,
  type FilterChipCategoryMenuProps,
  type FilterChipGroupProps,
  type FilterChipSingleMenuProps,
} from "@yami/design-system";

import styles from "./ProductFilterToolbar.module.css";

const filterIcon = new URL(
  "../../../design-system/assets/icons/action/filter.svg",
  import.meta.url,
).href;
const dropdownIcon = new URL(
  "../../../design-system/assets/icons/system/arrow-down.svg",
  import.meta.url,
).href;
const expandIcon = new URL(
  "../../../design-system/assets/icons/system/add.svg",
  import.meta.url,
).href;
const collapseIcon = new URL(
  "../../../design-system/assets/icons/system/minus.svg",
  import.meta.url,
).href;

export function ProductFilterChevron() {
  return <img data-slot="search-results-dropdown-icon" src={dropdownIcon} alt="" width={12} height={12} />;
}

export function ClearProductFiltersButton({
  className,
  children,
  ...props
}: {
  className?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      {...props}
      className={[styles.clearFilters, className].filter(Boolean).join(" ")}
      form="inline"
      variant="tertiary"
      size="sm"
    >
      {children}
    </Button>
  );
}

export function ProductCategoryFilter(props: FilterChipCategoryMenuProps) {
  return (
    <FilterChipCategoryMenu
      {...props}
      rightIcon={<ProductFilterChevron />}
      expandIcon={<img src={expandIcon} alt="" />}
      collapseIcon={<img src={collapseIcon} alt="" />}
    />
  );
}

interface ProductFilterToolbarProps extends FilterChipGroupProps {
  filtersLabel: string;
  filtersOpen: boolean;
  onOpenFilters?: () => void;
  filterButtonClassName?: string;
  filterMaskClassName?: string;
  sort: Omit<FilterChipSingleMenuProps, "selectionMode" | "rightIcon">;
  children: ReactNode;
}

export function ProductFilterToolbar({
  filtersLabel,
  filtersOpen,
  onOpenFilters,
  filterButtonClassName,
  filterMaskClassName,
  sort,
  children,
  ...rest
}: ProductFilterToolbarProps) {
  return (
    <FilterChipGroup {...rest}>
      {onOpenFilters && <div className={filterMaskClassName}>
        <FilterChip
          className={filterButtonClassName}
          data-search-results-filter-button="true"
          aria-label={filtersLabel}
          aria-haspopup="dialog"
          aria-controls={filtersOpen ? "all-filters" : undefined}
          selected={filtersOpen}
          leftIcon={<img src={filterIcon} alt="" width={16} height={16} />}
          onClick={onOpenFilters}
        >
          {filtersLabel}
        </FilterChip>
      </div>}
      <FilterChipMenu {...sort} selectionMode="single" rightIcon={<ProductFilterChevron />} />
      {children}
    </FilterChipGroup>
  );
}
