import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Drawer } from "@yami/design-system";
import { CartCoupons, CartMerchantHeader, CartProtectionDetails, CartRow, CartSecurityCarousel } from "./CartPage.components";
import { text } from "./CartPage.copy";
import { createCartPageFixture } from "./fixtures";
import type { CartLocale } from "./CartPage.types";
import styles from "./CartPage.module.css";

type ComponentName = "row" | "merchant" | "coupons" | "unavailable" | "protection" | "security";
type ComponentArgs = { state: string };

function ComponentDemo({ component, locale, state }: { component: ComponentName; locale: CartLocale; state: string }) {
  const t = text[locale];
  const fixture = createCartPageFixture(locale);
  const [item, setItem] = useState({ ...fixture.initialItems[0], selected: state === "selected" });
  const [items, setItems] = useState(fixture.initialItems.filter((entry) => entry.availability !== "available" && (state === "default" || state === entry.availability)));
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(true);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const merchant = fixture.merchants[0];
  const subtotal = state === "qualified" ? merchant.freeShippingCents : state === "partial" ? Math.floor(merchant.freeShippingCents / 2) : 0;
  const coupons = state === "empty" ? [] : fixture.coupons;
  const couponSubtotal = state === "ineligible" ? 0 : 30000;
  const title = component === "coupons" ? t.coupons : component === "unavailable" ? t.unavailable : t.protection;
  function applyCoupon(id: string | null) { setCouponId(id); setNotice(id ? t.couponApplied : t.couponRemoved); }
  function removeUnavailable(id: string, message: string) { setItems((current) => current.filter((entry) => entry.id !== id)); setNotice(message); }

  return <div className={styles.page} lang={locale} style={{ minHeight: "100dvh", padding: "var(--space-300)", boxSizing: "border-box" }}>
    {component === "row" ? <section className={styles.merchant}>
      {notice ? <p role="status">{notice}</p> : <ul className={styles.itemList}><CartRow item={item} locale={locale} onSelect={(selected) => setItem({ ...item, selected })}
        onQuantity={(quantity) => setItem({ ...item, quantity })} onRemove={() => setNotice(t.removed)} onSave={() => setNotice(t.saved)} /></ul>}
    </section> : null}
    {component === "merchant" ? <section className={styles.merchant}><CartMerchantHeader merchant={merchant} locale={locale} subtotal={subtotal} checked={checked} onCheckedChange={setChecked} /></section> : null}
    {component === "security" ? <CartSecurityCarousel locale={locale} /> : null}
    {component === "coupons" || component === "unavailable" || component === "protection" ? <>
      <Button onClick={() => setOpen(true)}>{title}</Button>
      <Drawer className={`${styles.cartDrawer} ${component === "protection" ? styles.protectionDrawer : component === "unavailable" ? styles.unavailableDrawer : ""}`}
        open={open} title={title} closeLabel={t.close} onClose={() => setOpen(false)}
        footer={component === "coupons" ? <div className={styles.drawerFooter}><Button size="lg" form="full" onClick={() => setOpen(false)}>{t.done}</Button></div> : undefined}>
        {notice ? <div className={styles.drawerNotice}><p role="status">{notice}</p></div> : null}
        {component === "coupons" ? <CartCoupons locale={locale} coupons={coupons} couponId={couponId} subtotalCents={couponSubtotal} quantity={state === "ineligible" ? 0 : 1}
          onApply={applyCoupon} onRedeem={(code) => {
            const coupon = coupons.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
            if (!coupon) return t.couponInvalid;
            if (couponSubtotal < coupon.minSubtotalCents) return t.condition;
            applyCoupon(coupon.id); return "";
          }} /> : null}
        {component === "unavailable" ? items.length === 0 ? <p className={styles.drawerEmpty}>{t.unavailableEmpty}</p> : <ul className={styles.itemList}>{items.map((entry) => <CartRow key={entry.id} item={entry} locale={locale}
          onRemove={() => removeUnavailable(entry.id, t.removed)} onSave={() => removeUnavailable(entry.id, t.saved)}
          notified={notifications.includes(entry.id)} onNotify={entry.notifyAvailable ? () => { setNotifications((current) => [...current, entry.id]); setNotice(t.notified); } : undefined} />)}</ul> : null}
        {component === "protection" ? <CartProtectionDetails locale={locale} /> : null}
      </Drawer>
    </> : null}
  </div>;
}

const meta = {
  title: "YAMI/Pages/Cart/Components",
  tags: ["!autodocs", "draft"],
  parameters: { layout: "fullscreen", controls: { include: ["state"] } },
  globals: { theme: "light", viewport: { value: "yamiDesktopLg", isRotated: false } },
  args: { state: "default" },
  argTypes: { state: { control: "select", options: ["default"] } },
} satisfies Meta<ComponentArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
function renderComponent(component: ComponentName): NonNullable<Story["render"]> {
  return ({ state }, { globals }) => <ComponentDemo key={`${globals.locale}-${component}-${state}`} component={component} locale={globals.locale === "en" ? "en" : "zh"} state={state} />;
}

export const CartRowPreview: Story = { name: "Cart Row", render: renderComponent("row"), argTypes: { state: { options: ["default", "selected"] } } };
export const MerchantHeader: Story = { render: renderComponent("merchant"), argTypes: { state: { options: ["default", "partial", "qualified"] } } };
export const CouponDrawer: Story = { render: renderComponent("coupons"), argTypes: { state: { options: ["default", "empty", "ineligible"] } } };
export const UnavailableDrawer: Story = { render: renderComponent("unavailable"), argTypes: { state: { options: ["default", "sold-out", "delisted", "empty"] } } };
export const ProtectionDrawer: Story = { render: renderComponent("protection"), parameters: { controls: { disable: true } } };
export const SecurityCarousel: Story = { render: renderComponent("security"), parameters: { controls: { disable: true } } };
