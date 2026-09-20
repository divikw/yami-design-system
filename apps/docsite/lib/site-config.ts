import repositoryPackage from "../../../package.json";

export const siteUrl = (process.env.SITE_URL ?? "https://yds-docsite.vercel.app").replace(/\/$/, "");
export const githubUrl = "https://github.com/divikw/yami-design-system";
export const storybookUrl = "https://yds-storybook.vercel.app";
export const siteName = "YAMI Design System";
export const siteVersion = repositoryPackage.version;
