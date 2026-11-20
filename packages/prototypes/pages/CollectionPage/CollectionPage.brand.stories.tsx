import brandMeta, {
  Pc as BrandPc,
  Mobile as BrandMobile,
  Chinese as BrandChinese,
  ChineseMobile as BrandChineseMobile,
  CustomContentWidth as BrandCustomContentWidth,
  SansTitles as BrandSansTitles,
} from "../TopicLandingPage/TopicLandingPage.stories";

export default {
  ...brandMeta,
  id: "yami-pages-landing-page-collection-page-brand",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Brand",
};

export const Pc = { ...BrandPc, name: "Brand — PC", play: BrandPc.play };
export const Mobile = { ...BrandMobile, name: "Brand — Mobile", play: BrandMobile.play };

export const Chinese = {
  ...BrandChinese,
  name: "中文",
  tags: ["!dev", "!autodocs"],
  play: BrandChinese.play,
};

export const ChineseMobile = {
  ...BrandChineseMobile,
  name: "中文 Mobile",
  tags: ["!dev", "!autodocs"],
  play: BrandChineseMobile.play,
};

export const CustomContentWidth = {
  ...BrandCustomContentWidth,
  name: "Custom Content Width",
  tags: ["!dev", "!autodocs"],
  play: BrandCustomContentWidth.play,
};

export const SansTitles = {
  ...BrandSansTitles,
  name: "Sans Titles",
  tags: ["!dev", "!autodocs"],
  play: BrandSansTitles.play,
};
