"use client";

import { useSyncExternalStore } from "react";

const desktopQuery = "(min-width: 1024px)";
function subscribeDesktop(notify: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const isDesktop = () => window.matchMedia(desktopQuery).matches;
const serverDesktop = () => false;

export function useDesktopViewport() {
  return useSyncExternalStore(subscribeDesktop, isDesktop, serverDesktop);
}
