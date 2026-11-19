import { getArgDescription, type DescriptionTranslations } from "./arg-descriptions";

interface PropContract {
  type: string;
  values?: (string | number | boolean)[];
  default?: unknown;
  required?: boolean | string;
  description?: string;
}

const dependencies = import.meta.glob<{ runtime: string[] }>(
  "../../../packages/design-system/components/*/meta.json",
  { eager: true, import: "dependencies" },
);

const props = import.meta.glob<Record<string, PropContract>>(
  "../../../packages/design-system/components/*/meta.json",
  { eager: true, import: "props" },
);

export function normalizeComponentName(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

const components = new Map(Object.entries(dependencies).map(([path, deps]) => [
  normalizeComponentName(path.split("/").at(-2) ?? ""),
  { usesBaseUI: deps.runtime.includes("@base-ui/react"), props: props[path] },
]));

export function usesBaseUI(component: string) {
  return components.get(normalizeComponentName(component))?.usesBaseUI ?? false;
}

export function componentApiRows(component: string, title: string, locale: "en" | "zh", translations?: DescriptionTranslations): [string, string][] {
  const contract = components.get(normalizeComponentName(component));
  return Object.entries(contract?.props ?? {}).map(([prop, spec]) => {
    const type = spec.values?.join(" | ") || spec.type;
    const description = getArgDescription(title, prop, locale, translations) ?? spec.description;
    const defaultValue = spec.default === undefined ? undefined : JSON.stringify(spec.default);
    const details = [
      type,
      spec.required === true && (locale === "zh" ? "必填" : "Required"),
      defaultValue && (locale === "zh" ? `默认值 ${defaultValue}` : `Default ${defaultValue}`),
      description,
    ];
    return [prop, details.filter(Boolean).join(" · ")];
  });
}
