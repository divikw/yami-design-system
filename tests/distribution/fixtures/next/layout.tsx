import type { ReactNode } from "react";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import "./host.css";

export const metadata = { title: "YAMI candidate · Next.js" };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
