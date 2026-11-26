import { UserReviews as AppDownload, type UserReviewsProps } from "@yami/design-system";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";
import { jsxAttributes, type PropertiesDefinition } from "./component-properties";

type Values = Required<Pick<UserReviewsProps,
  "version" | "imageLayout" | "padding" | "locale" | "titleStyle" | "titleFontFamily" | "dividerPosition" | "dividerVariant"
>>;

export const appDownloadLayoutLabels = {
  zh: { balanced: "居中双栏", "image-first": "商品图优先", compact: "紧凑横幅" },
  en: { balanced: "Balanced columns", "image-first": "Image first", compact: "Compact banner" },
};

export const appDownloadProperties: PropertiesDefinition<Values> = {
  slug: "app-download",
  initialValues: locale => ({
    version: "v1", imageLayout: "balanced", padding: true, locale, titleStyle: "display", titleFontFamily: "sans", dividerPosition: "top", dividerVariant: "gray",
  }),
  fields: ({ version }, locale) => [
    { key: "version", kind: "select", options: ["v1", "v2"], optionLabels: locale === "zh"
      ? { v1: "V1 · 用户评价", v2: "V2 · 配图" }
      : { v1: "V1 · App reviews", v2: "V2 · Shopping image" } },
    ...(version === "v2" ? [{
      key: "imageLayout", kind: "select", options: ["balanced", "image-first", "compact"],
      optionLabels: appDownloadLayoutLabels[locale],
    }] as const : []),
    { key: "padding", kind: "switch" },
    { key: "locale", kind: "select", options: ["zh", "en"] },
    { key: "titleStyle", kind: "select", options: ["display", "section"] },
    { key: "titleFontFamily", kind: "select", options: ["sans", "serif"] },
    { key: "dividerPosition", kind: "select", options: ["top", "bottom", "none"] },
    { key: "dividerVariant", kind: "select", options: ["gray", "black"] },
  ],
  example(values) {
    const { download, reviewColumns } = userReviewsExamples[values.locale];
    const withReviews = values.version === "v1";
    return {
      preview: <AppDownload {...values} download={download} reviewColumns={withReviews ? reviewColumns : undefined} />,
      previewBackground: "var(--background-secondary)",
      fillContentWidth: true,
      code: `import { UserReviews as AppDownload } from "@yami/design-system";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";

const { download${withReviews ? ", reviewColumns" : ""} } = userReviewsExamples.${values.locale};

<AppDownload${jsxAttributes({ ...values, imageLayout: withReviews ? undefined : values.imageLayout })} download={download}${withReviews ? " reviewColumns={reviewColumns}" : ""} />`,
    };
  },
};
