"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Drawer, type DrawerProps } from "@yami/design-system";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { brandIcon } from "./assets";
import styles from "./NavigationDrawer.module.css";

export function NavigationDrawer({ open, onClose, title, closeLabel, homeHref, children, finalFocus }: {
  finalFocus: DrawerProps["finalFocus"];
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  homeHref: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <Drawer
      initialFocus={closeRef}
      finalFocus={finalFocus}
      open={open}
      swipeDirection="right"
      onClose={onClose}
      title={title}
      closeLabel={closeLabel}
      size="full"
      contentPadding="none"
      className={styles.drawer}
      data-slot="docsite-menu"
    >
      <div className={styles.panel} data-navigation-panel>
        <div className={styles.header}>
          <Link className={styles.brand} href={homeHref} aria-label="YAMI Design System" onClick={onClose}>
            <img src={brandIcon} width={24} height={24} alt="YAMI" />
          </Link>
          <Button
            className={styles.close}
            variant="tertiary"
            form="icon"
            size="sm"
            aria-label={closeLabel}
            ref={closeRef}
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
        <div className={styles.content} data-navigation-content>{children}</div>
      </div>
    </Drawer>
  );
}
