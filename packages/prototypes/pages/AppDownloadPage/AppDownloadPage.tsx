"use client";

import { AppDownloadPageV2, type AppDownloadPageV2Props } from "../AppDownloadPageV2/AppDownloadPageV2";

export type AppDownloadPageProps = Omit<AppDownloadPageV2Props, "variant">;

/** V1 keeps the core campaign modules and shares V2's presentation and behavior. */
export function AppDownloadPage(props: AppDownloadPageProps) {
  return <AppDownloadPageV2 {...props} variant="compact" />;
}
