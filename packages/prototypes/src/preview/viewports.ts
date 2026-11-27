export const YAMI_VIEWPORTS = {
  yamiMobileSm: { name: "YAMI Mobile-sm (360)", styles: { width: "360px", height: "800px" }, type: "mobile" as const },
  yamiMobile: { name: "YAMI Mobile (375)", styles: { width: "375px", height: "812px" }, type: "mobile" as const },
  yamiMobileLg: { name: "YAMI Mobile-lg (402)", styles: { width: "402px", height: "844px" }, type: "mobile" as const },
  yamiMobileXl: { name: "YAMI Mobile-xl (480)", styles: { width: "480px", height: "900px" }, type: "mobile" as const },
  yamiTablet: { name: "YAMI Tablet (768)", styles: { width: "768px", height: "1024px" }, type: "tablet" as const },
  yamiDesktop: { name: "YAMI Desktop (1024)", styles: { width: "1024px", height: "768px" }, type: "desktop" as const },
  yamiDesktopMd: { name: "YAMI Desktop-md (1280)", styles: { width: "1280px", height: "800px" }, type: "desktop" as const },
  yamiDesktopLg: { name: "YAMI Desktop-lg (1440)", styles: { width: "1440px", height: "900px" }, type: "desktop" as const },
  yamiDesktopWide: { name: "YAMI Desktop-wide (1680)", styles: { width: "1680px", height: "1050px" }, type: "desktop" as const },
  yamiDesktopXl: { name: "YAMI Desktop-xl (1920)", styles: { width: "1920px", height: "1080px" }, type: "desktop" as const }
};

export function storybookViewportForWidth(width: number) {
  const preset = Object.entries(YAMI_VIEWPORTS).find(([, option]) => option.styles.width === `${width}px`);
  return preset?.[0] ?? `${width}-100pct`;
}
