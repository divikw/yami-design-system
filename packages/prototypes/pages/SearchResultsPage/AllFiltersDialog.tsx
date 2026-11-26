"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  Dialog,
  Drawer,
  useDesktopViewport,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  type FilterChipMenuOption,
} from "@yami/design-system";

import styles from "./AllFiltersDialog.module.css";
import { ClearProductFiltersButton } from "./ProductFilterToolbar";
import type {
  SearchResultsCategoryOption,
  SearchResultsCopy,
  SearchResultsLocale,
  SearchResultsSort,
} from "./SearchResultsPage.types";

const addIcon = new URL(
  "../../../design-system/assets/icons/system/add.svg",
  import.meta.url
).href;
const minusIcon = new URL(
  "../../../design-system/assets/icons/system/minus.svg",
  import.meta.url
).href;
const arrowRightIcon = new URL(
  "../../../design-system/assets/icons/system/arrow-right.svg",
  import.meta.url
).href;
const tagCloseIcon = new URL(
  "../../../design-system/assets/icons/system/close.svg",
  import.meta.url
).href;
const fulfilledIcon = new URL(
  "../../../design-system/assets/logos/yami-icon-fill.svg",
  import.meta.url
).href;

export type AllFiltersSortValue = SearchResultsSort;

const collectionFilterSnapPoints = [0.6, 1];

type ExpandableFilterSection =
  | "sort"
  | "category"
  | "offers"
  | "brand"
  | "region"
  | "price"
  | "tags"
  | "seller";

type AllFiltersDialogProps = {
  open: boolean;
  locale: SearchResultsLocale;
  resultCount: number;
  sort: AllFiltersSortValue;
  category: string;
  fulfilled: boolean;
  menuValues: Record<string, string[]>;
  onClose: () => void;
  onApply: (value: {
    sort: AllFiltersSortValue;
    category: string;
    fulfilled: boolean;
    menuValues: Record<string, string[]>;
  }) => void;
  onClear: () => void;
} & (
  | { copy: SearchResultsCopy; catalog?: undefined }
  | {
      copy: Pick<SearchResultsCopy, "categoryOptions" | "clearFilters" | "filtersButton" | "showResults" | "sortLabel">;
      catalog: {
        categoryLabel: string;
        inStockLabel: string;
        priceLabel: string;
        priceOptions: readonly FilterChipMenuOption[];
        sortOptions: readonly (FilterChipMenuOption & { value: AllFiltersSortValue })[];
      };
    }
);

const searchSortLabels = [
  ["featured", "sortFeatured"],
  ["best-seller", "sortBestSeller"],
  ["popularity", "sortPopularity"],
  ["most-reviews", "sortMostReviews"],
  ["most-ratings", "sortMostRatings"],
  ["newest", "sortNewest"],
  ["price-high", "sortPriceHigh"],
  ["price-low", "sortPriceLow"],
] as const;

function findCategoryLabel(
  options: readonly SearchResultsCategoryOption[],
  value: string
): string | undefined {
  for (const option of options) {
    if (option.value === value) return option.label;
    const childLabel = findCategoryLabel(option.children ?? [], value);
    if (childLabel) return childLabel;
  }
  return undefined;
}

function SectionToggle({ expanded }: { expanded: boolean }) {
  return (
    <>
      <img
        className={styles.desktopSectionIcon}
        src={expanded ? minusIcon : addIcon}
        alt=""
        width={16}
        height={16}
      />
      <img
        className={styles.mobileSectionIcon}
        src={arrowRightIcon}
        alt=""
        width={16}
        height={16}
      />
    </>
  );
}

function CategoryTree({
  options,
  expanded,
  value,
  depth = 0,
  onExpand,
  onValueChange,
}: {
  options: readonly SearchResultsCategoryOption[];
  expanded: ReadonlySet<string>;
  value: string;
  depth?: number;
  onExpand: (value: string) => void;
  onValueChange: (value: string) => void;
}) {
  return options.map((option) => {
    const hasChildren = Boolean(option.children?.length);
    const isExpanded = expanded.has(option.value);
    return (
      <div key={option.value} className={styles.categoryBranch}>
        <div
          className={styles.categoryRow}
          style={{ "--category-depth": depth } as React.CSSProperties}
        >
          <label className={styles.categoryChoice}>
            <RadioGroupItem value={option.value} />
            <span>{option.label}</span>
          </label>
          {hasChildren && (
            <button
              className={styles.expandButton}
              type="button"
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
                option.label
              }`}
              aria-expanded={isExpanded}
              onClick={() => onExpand(option.value)}
            >
              <SectionToggle expanded={isExpanded} />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <CategoryTree
            options={option.children ?? []}
            expanded={expanded}
            value={value}
            depth={depth + 1}
            onExpand={onExpand}
            onValueChange={onValueChange}
          />
        )}
      </div>
    );
  });
}

export function AllFiltersDialog(props: AllFiltersDialogProps) {
  const {
    open, locale, copy, catalog, resultCount, sort, category, fulfilled,
    menuValues, onClose, onApply, onClear,
  } = props;
  const searchCopy = props.catalog ? undefined : props.copy;
  const filterMenus = searchCopy?.filterMenus;
  const desktop = useDesktopViewport();
  const Panel = desktop ? Dialog : Drawer;
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionTrigger = useRef<HTMLButtonElement | null>(null);
  const mainScroll = useRef(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [draftSort, setDraftSort] = useState(sort);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftFulfilled, setDraftFulfilled] = useState(fulfilled);
  const [draftMenuValues, setDraftMenuValues] = useState(menuValues);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [mobileSection, setMobileSection] = useState<
    ExpandableFilterSection | null
  >(null);

  const labels = useMemo(() => {
    const [
      categoryLabel,
      offersLabel,
      inStockLabel,
      brandLabel,
      regionLabel,
      priceLabel,
      tagsLabel,
      sellerLabel,
    ] = filterMenus ?? [];
    return {
      category: catalog?.categoryLabel ?? categoryLabel ?? "Category",
      offers: offersLabel ?? "Offers",
      inStock: catalog?.inStockLabel ?? inStockLabel ?? "In Stock",
      brand: brandLabel ?? "Brand",
      region: regionLabel ?? "Region",
      price: catalog?.priceLabel ?? priceLabel ?? "Price",
      tags: tagsLabel ?? "Tags",
      seller: sellerLabel ?? "Seller",
    };
  }, [catalog?.categoryLabel, catalog?.inStockLabel, catalog?.priceLabel, filterMenus]);
  const inStockKey = catalog ? "inStock" : labels.inStock;

  const sortOptions = catalog?.sortOptions ?? searchSortLabels.map(([value, key]) => ({
    value,
    label: searchCopy?.[key] ?? "",
  }));
  const draftSortLabel = sortOptions.find((option) => option.value === draftSort)?.label;

  useEffect(() => {
    if (!open) return;
    setDraftSort(sort);
    setDraftCategory(category);
    setDraftFulfilled(fulfilled);
    setDraftMenuValues(menuValues);
    setMinimumPrice("");
    setMaximumPrice("");
    setExpanded(new Set());
    setExpandedCategories(new Set());
    setMobileSection(null);
  }, [category, fulfilled, menuValues, onClose, open, sort]);

  useLayoutEffect(() => {
    if (!mobileSection && sectionTrigger.current) {
      const content = mainRef.current?.parentElement;
      if (content) content.scrollTop = mainScroll.current;
      sectionTrigger.current.focus({ preventScroll: true });
      sectionTrigger.current = null;
    }
  }, [mobileSection]);

  useEffect(() => {
    if (desktop) setMobileSection(null);
  }, [desktop]);

  if (!open) return null;

  function clearFilters() {
    setDraftSort("featured");
    setDraftCategory("");
    setDraftFulfilled(false);
    setDraftMenuValues({});
    setMinimumPrice("");
    setMaximumPrice("");
    onClear();
  }

  function toggleSection(section: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function toggleMultiple(label: string, option: string, checked: boolean) {
    setDraftMenuValues((current) => {
      const values = current[label] ?? [];
      return {
        ...current,
        [label]: checked
          ? [...values, option]
          : values.filter((value) => value !== option),
      };
    });
  }

  const selectedTags = [
    ...(sort !== draftSort
      ? [
          {
            key: "sort",
            label: draftSortLabel ?? draftSort,
            onRemove: () => setDraftSort(sort),
          },
        ]
      : []),
    ...(draftCategory
      ? [
          {
            key: "category",
            label:
              findCategoryLabel(copy.categoryOptions, draftCategory) ??
              draftCategory,
            onRemove: () => setDraftCategory(""),
          },
        ]
      : []),
    ...Object.entries(draftMenuValues).flatMap(([label, values]) =>
      values.map((option) => ({
        key: `${label}-${option}`,
        label: catalog && label === "price"
          ? catalog.priceOptions.find(({ value }) => value === option)?.label ?? option
          : (catalog && label === inStockKey ? labels.inStock : option),
        onRemove: () => toggleMultiple(label, option, false),
      }))
    ),
  ];

  function getSectionLabel(section: ExpandableFilterSection) {
    if (section === "sort") return copy.sortLabel;
    return labels[section];
  }

  function renderMultipleOptions(
    label: string,
    options: readonly FilterChipMenuOption[] = (searchCopy?.filterMenuOptions[label] ?? []).map(
      (option) => ({ label: option, value: option }),
    ),
    valueKey = label,
  ) {
    return (
      <div className={styles.optionGrid} role="group" aria-label={label}>
        {options.map((option) => {
          const checked = draftMenuValues[valueKey]?.includes(option.value) ?? false;
          return (
            <label className={styles.optionRow} key={option.value}>
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) =>
                  toggleMultiple(valueKey, option.value, Boolean(nextChecked))
                }
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderSectionContent(section: ExpandableFilterSection) {
    if (section === "sort") {
      return (
        <RadioGroup
          className={styles.optionGrid}
          value={draftSort}
          onValueChange={(value) =>
            setDraftSort(value as AllFiltersSortValue)
          }
          aria-label={copy.sortLabel}
        >
          {sortOptions.map((option) => (
            <label className={styles.optionRow} key={option.value}>
              <RadioGroupItem value={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      );
    }

    if (section === "category") {
      return (
        <RadioGroup
          className={styles.categoryList}
          value={draftCategory}
          onValueChange={(value) => {
            const nextValue = String(value);
            setDraftCategory(nextValue);
            const optionStack = [...copy.categoryOptions];
            while (optionStack.length) {
              const option = optionStack.shift();
              if (!option) break;
              if (option.value === nextValue && option.children?.length) {
                setExpandedCategories((current) =>
                  new Set(current).add(nextValue)
                );
                break;
              }
              optionStack.push(...(option.children ?? []));
            }
          }}
          aria-label={labels.category}
        >
          <CategoryTree
            options={copy.categoryOptions}
            expanded={expandedCategories}
            value={draftCategory}
            onExpand={(value) =>
              setExpandedCategories((current) => {
                const next = new Set(current);
                if (next.has(value)) next.delete(value);
                else next.add(value);
                return next;
              })
            }
            onValueChange={setDraftCategory}
          />
        </RadioGroup>
      );
    }

    if (section === "price") {
      if (catalog) return renderMultipleOptions(labels.price, catalog.priceOptions, "price");
      return (
        <div className={styles.priceFields}>
          <input
            inputMode="decimal"
            aria-label={locale === "zh" ? "最低价格" : "Minimum price"}
            placeholder="0"
            value={minimumPrice}
            onChange={(event) => setMinimumPrice(event.target.value)}
          />
          <span>{locale === "zh" ? "至" : "to"}</span>
          <input
            inputMode="decimal"
            aria-label={locale === "zh" ? "最高价格" : "Maximum price"}
            placeholder="0"
            value={maximumPrice}
            onChange={(event) => setMaximumPrice(event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (!minimumPrice && !maximumPrice) return;
              setDraftMenuValues((current) => ({
                ...current,
                [labels.price]: [
                  `${minimumPrice || "0"} ${
                    locale === "zh" ? "至" : "to"
                  } ${maximumPrice || "∞"}`,
                ],
              }));
            }}
          >
            {locale === "zh" ? "应用" : "Apply"}
          </button>
        </div>
      );
    }

    return renderMultipleOptions(getSectionLabel(section));
  }

  function renderSection(
    section: ExpandableFilterSection,
    summary: string | undefined
  ) {
    const label = getSectionLabel(section);
    const isExpanded = expanded.has(section);
    return (
      <section className={styles.section} key={label}>
        <button
          className={styles.sectionHeader}
          type="button"
          aria-expanded={isExpanded}
          onClick={(event) => {
            if (!desktop) {
              sectionTrigger.current = event.currentTarget;
              mainScroll.current = mainRef.current?.parentElement?.scrollTop ?? 0;
              setMobileSection(section);
              return;
            }
            toggleSection(section);
          }}
        >
          <strong>{label}</strong>
          {!isExpanded && summary && (
            <span className={styles.summary}>{summary}</span>
          )}
          <span className={styles.sectionIcon} aria-hidden="true">
            <SectionToggle expanded={isExpanded} />
          </span>
        </button>
        {isExpanded && (
          <div className={styles.sectionContent}>
            {renderSectionContent(section)}
          </div>
        )}
      </section>
    );
  }

  return (
    <Panel
      className={styles.panel}
      open={open}
      lang={locale}
      id="all-filters"
      data-slot="all-filters-dialog"
      title={mobileSection ? getSectionLabel(mobileSection) : copy.filtersButton}
      closeLabel={locale === "zh" ? "关闭筛选" : "Close filters"}
      onClose={onClose}
      {...(!desktop && {
        ...(catalog ? { snapPoints: collectionFilterSnapPoints } : { size: "content" as const }),
        contentPadding: "none" as const,
        back: mobileSection ? {
          label: locale === "zh" ? "返回全部筛选" : "Back to all filters",
          onClick: () => setMobileSection(null),
        } : undefined,
      })}
      footer={
        <>
          {!mobileSection && selectedTags.length > 0 && (
            <div
              className={styles.selectedTags}
              aria-label={locale === "zh" ? "已选筛选" : "Selected filters"}
            >
              {selectedTags.map((tag) => (
                <span className={styles.selectedTag} key={tag.key}>
                  <span>{tag.label}</span>
                  <button
                    className={styles.removeTagButton}
                    type="button"
                    aria-label={
                      locale === "zh"
                        ? `移除${tag.label}筛选`
                        : `Remove ${tag.label} filter`
                    }
                    onClick={tag.onRemove}
                  >
                    <img src={tagCloseIcon} alt="" width={16} height={16} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <footer className={styles.footer}>
            <ClearProductFiltersButton className={styles.clearButton} onClick={clearFilters}>{copy.clearFilters}</ClearProductFiltersButton>
            <Button
              className={styles.applyButton}
              variant="primary"
              size="md"
              onClick={() =>
                onApply({
                  sort: draftSort,
                  category: draftCategory,
                  fulfilled: draftFulfilled,
                  menuValues: draftMenuValues,
                })
              }
            >
              {copy.showResults(resultCount)}
            </Button>
          </footer>
        </>
      }
    >
      {mobileSection && (
        <div
          className={styles.mobileSectionContent}
          data-slot="all-filters-subdialog"
          data-section={mobileSection}
        >
          {renderSectionContent(mobileSection)}
        </div>
      )}
      <div ref={mainRef} hidden={Boolean(mobileSection)}>
        {renderSection("sort", draftSortLabel)}

        {renderSection(
          "category",
          findCategoryLabel(copy.categoryOptions, draftCategory)
        )}

        {!catalog && (
          <section className={styles.section}>
            <Switch className={styles.switchRow} checked={draftFulfilled} onCheckedChange={setDraftFulfilled}>
              <strong className={styles.fulfilledLabel}>
                <img src={fulfilledIcon} alt="" width={24} height={24} />
                {searchCopy?.fulfilledByYami}
              </strong>
            </Switch>
          </section>
        )}

        <section className={styles.section}>
          <Switch className={styles.switchRow}
            checked={draftMenuValues[inStockKey]?.includes("in-stock") ?? false}
            onCheckedChange={(checked) => setDraftMenuValues((current) => ({
              ...current, [inStockKey]: checked ? ["in-stock"] : [],
            }))}
          >
            <strong>{labels.inStock}</strong>
          </Switch>
        </section>

        {catalog ? renderSection(
          "price",
          catalog.priceOptions.filter(({ value }) => draftMenuValues.price?.includes(value))
            .map(({ label }) => label).join(", "),
        ) : (
          <>
            {(
              ["offers", "brand", "region"] as const
            ).map((section) =>
              renderSection(
                section,
                draftMenuValues[getSectionLabel(section)]?.join(", ")
              )
            )}

            {renderSection(
              "price",
              draftMenuValues[labels.price]?.join(", ")
            )}

            {(["tags", "seller"] as const).map((section) =>
              renderSection(
                section,
                draftMenuValues[getSectionLabel(section)]?.join(", ")
              )
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
