import { FilterChip, FilterChipDropdownIcon, FilterChipGroup } from "./FilterChip";

export function FilterChipExample() {
  return (
    <FilterChipGroup aria-label="Popular filters">
      <FilterChip variant="filled" selected>
        Hot
      </FilterChip>
      <FilterChip variant="filled">Tea Drinks</FilterChip>
      <FilterChip rightIcon={<FilterChipDropdownIcon />}>
        Category
      </FilterChip>
    </FilterChipGroup>
  );
}
