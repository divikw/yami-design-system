"use client";

import { useCallback, useMemo, useState } from "react";

import {
  FilterChip,
  FilterChipMenu,
  type FilterChipCategoryOption,
  type ProductListItem,
} from "@yami/design-system";

import {
  AllFiltersDialog,
  type AllFiltersSortValue,
} from "../SearchResultsPage/AllFiltersDialog";
import {
  ClearProductFiltersButton,
  ProductCategoryFilter,
  ProductFilterChevron,
  ProductFilterToolbar,
} from "../SearchResultsPage/ProductFilterToolbar";
import styles from "./TopicLandingPage.module.css";

const priceBands = [
  { value: "under-10", min: 0, max: 10, en: "Under $10", zh: "$10 以下" },
  { value: "10-25", min: 10, max: 25, en: "$10 to under $25", zh: "$10 至 $25 以下" },
  { value: "25-50", min: 25, max: 50, en: "$25 to under $50", zh: "$25 至 $50 以下" },
  { value: "50-plus", min: 50, max: Infinity, en: "$50 and above", zh: "$50 及以上" },
] as const;

const copy = {
  en: {
    category: "Category",
    inStock: "In Stock",
    price: "Price",
    filtersButton: "Filters",
    sortLabel: "Sort by",
    featured: "Featured",
    low: "Price: low to high",
    high: "Price: high to low",
    clearSelection: "Clear",
    clearFilters: "Clear all",
    apply: "Show products",
    empty: "No products match these filters.",
  },
  zh: {
    category: "分类",
    inStock: "仅看有货",
    price: "价格",
    filtersButton: "筛选",
    sortLabel: "排序方式",
    featured: "精选",
    low: "价格从低到高",
    high: "价格从高到低",
    clearSelection: "清除",
    clearFilters: "清除全部",
    apply: "查看商品",
    empty: "没有符合筛选条件的商品。",
  },
};

export interface CollectionProductFilterState {
  sort: AllFiltersSortValue;
  prices: string[];
  inStock: boolean;
}

function isInStock(product: ProductListItem) {
  return (product.availability ?? "available") === "available";
}

export function createCollectionProductFilters(
  products: readonly ProductListItem[] = [],
): CollectionProductFilterState {
  return {
    sort: "featured",
    prices: [],
    inStock: products.some((product) => !isInStock(product)),
  };
}

function priceOf(product: ProductListItem) {
  const price = product.priceCurrent;
  return typeof price === "string" || typeof price === "number"
    ? Number.parseFloat(String(price).replace(/[$,]/g, ""))
    : NaN;
}

export function filterCollectionProducts(
  products: ProductListItem[],
  { prices, sort, inStock }: CollectionProductFilterState,
) {
  const stockMatches = inStock ? products.filter(isInStock) : products;
  const bands = priceBands.filter(({ value }) => prices.includes(value));
  const filtered = bands.length ? stockMatches.filter((product) => {
    const price = priceOf(product);
    return bands.some(({ min, max }) => price >= min && price < max);
  }) : stockMatches;

  if (sort !== "price-low" && sort !== "price-high") {
    return inStock ? filtered : [
      ...filtered.filter(isInStock),
      ...filtered.filter((product) => !isInStock(product)),
    ];
  }
  return [...filtered].sort((left, right) => {
    const leftPrice = priceOf(left);
    const rightPrice = priceOf(right);
    if (!Number.isFinite(leftPrice)) return Number.isFinite(rightPrice) ? 1 : 0;
    if (!Number.isFinite(rightPrice)) return -1;
    return sort === "price-low" ? leftPrice - rightPrice : rightPrice - leftPrice;
  });
}

interface CollectionProductFiltersProps {
  locale: "en" | "zh";
  categories: FilterChipCategoryOption[];
  category: string;
  filters: CollectionProductFilterState;
  resultCount: number;
  onChange: (filters: CollectionProductFilterState, category: string) => void;
}

export function CollectionProductFilters({
  locale,
  categories,
  category,
  filters,
  resultCount,
  onChange,
}: CollectionProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const text = copy[locale];
  const { prices, sort, inStock } = filters;
  const dialogValues = useMemo(() => ({
    price: prices,
    inStock: inStock ? ["in-stock"] : [],
  }), [prices, inStock]);
  const closeDialog = useCallback(() => setOpen(false), []);
  const sortOptions = [
    { value: "featured", label: text.featured },
    { value: "price-low", label: text.low },
    { value: "price-high", label: text.high },
  ] as const;
  const priceOptions = priceBands.map((band) => ({ value: band.value, label: band[locale] }));
  const reset = () => onChange(createCollectionProductFilters(), "");

  return (
    <>
      <ProductFilterToolbar
        className={styles.collectionFilters}
        data-collection-product-filters="true"
        role="group"
        aria-label={text.filtersButton}
        filtersLabel={text.filtersButton}
        filtersOpen={open}
        onOpenFilters={() => setOpen(true)}
        sort={{
          label: text.sortLabel,
          value: sort,
          options: sortOptions,
          onValueChange: (value) => onChange({ ...filters, sort: value as AllFiltersSortValue }, category),
        }}
      >
        <ProductCategoryFilter
          label={text.category}
          options={categories}
          value={category}
          onValueChange={(value) => onChange(filters, value)}
          closeLabel={locale === "zh" ? "关闭分类" : "Close category"}
          clearLabel={text.clearSelection}
          applyLabel={text.apply}
        />
        <FilterChip
          selected={inStock}
          onClick={() => onChange({ ...filters, inStock: !inStock }, category)}
        >
          {text.inStock}
        </FilterChip>
        <FilterChipMenu
          label={text.price}
          selectionMode="multiple"
          value={prices}
          options={priceOptions}
          onValueChange={(value) => onChange({ ...filters, prices: value }, category)}
          closeLabel={locale === "zh" ? "关闭价格筛选" : "Close price filters"}
          clearLabel={text.clearSelection}
          applyLabel={text.apply}
          rightIcon={<ProductFilterChevron />}
        />
        {(category || prices.length > 0 || inStock || sort !== "featured") && (
          <ClearProductFiltersButton onClick={reset}>{text.clearFilters}</ClearProductFiltersButton>
        )}
      </ProductFilterToolbar>
      {resultCount === 0 && <p className={styles.collectionFilterStatus} role="status">{text.empty}</p>}
      <AllFiltersDialog
        open={open}
        locale={locale}
        copy={{
          ...text,
          categoryOptions: categories,
          showResults: () => text.apply,
        }}
        catalog={{
          categoryLabel: text.category,
          inStockLabel: text.inStock,
          priceLabel: text.price,
          priceOptions,
          sortOptions,
        }}
        resultCount={resultCount}
        sort={sort}
        category={category}
        fulfilled={false}
        menuValues={dialogValues}
        onClose={closeDialog}
        onClear={reset}
        onApply={({ sort, category, menuValues }) => {
          onChange({
            sort,
            prices: menuValues.price ?? [],
            inStock: menuValues.inStock?.includes("in-stock") ?? false,
          }, category);
          closeDialog();
        }}
      />
    </>
  );
}
