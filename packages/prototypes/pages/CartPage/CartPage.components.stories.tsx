import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useState } from "react";
import { Button, Drawer } from "@yami/design-system";
import { CartAddNotice, CartCouponActions, CartCoupons, CartMerchantHeader, CartProtectionDetails, CartRow, CartSecurityCarousel } from "./CartPage.components";
import { text } from "./CartPage.copy";
import { createCartPageFixture } from "./fixtures";
import type { CartLocale } from "./CartPage.types";
import styles from "./CartPage.module.css";
import previewStyles from "./CartPage.components.module.css";

type ComponentName = "row" | "merchant" | "coupons" | "unavailable" | "protection" | "security" | "add-notice";
type ComponentArgs = { state: string };

function ComponentDemo({ component, locale, state }: { component: ComponentName; locale: CartLocale; state: string }) {
  const t = text[locale];
  const [mobile, setMobile] = useState(false);
  useLayoutEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const fixture = createCartPageFixture(locale);
  const initialItem = { ...(state === "low-stock" ? fixture.initialItems.find((entry) => entry.lowStock)! : fixture.initialItems[0]),
    selected: state === "selected", quantity: state === "quantity-10" ? 10 : 1 };
  if (state === "long-title") initialItem.title = locale === "zh"
    ? "日本 SK-II 青春露／神仙水 230ml 强屏障抗氧化 深层修护毛孔 改善暗沉与肤色不均 清爽易吸收 适合日常护肤 新旧包装随机发货"
    : "SK-II Facial Treatment Essence, 230ml, daily brightening and hydrating skincare for a smoother-looking complexion, assorted packaging";
  const [item, setItem] = useState(initialItem);
  const [feedback, setFeedback] = useState<"removed" | "saved" | null>(null);
  const [items, setItems] = useState(fixture.initialItems.filter((entry) => entry.availability !== "available" && (state === "default" || state === entry.availability)));
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(true);
  const [couponId, setCouponId] = useState<string | null>(state === "applied" ? fixture.coupons[0].id : null);
  const [draftCouponId, setDraftCouponId] = useState(couponId);
  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const merchant = fixture.merchants[0];
  const subtotal = state === "qualified" ? merchant.freeShippingCents : state === "partial" ? Math.floor(merchant.freeShippingCents / 2) : 0;
  const coupons = state === "empty" ? [] : fixture.coupons;
  const couponSubtotal = state === "ineligible" ? 0 : 30000;
  const title = component === "coupons" ? t.coupons : component === "unavailable" ? t.unavailable : t.protection;
  function applyCoupon(id: string | null) { setCouponId(id); }
  function removeUnavailable(id: string, message: string) { setItems((current) => current.filter((entry) => entry.id !== id)); setNotice(message); }

  return <div className={`${styles.page} ${previewStyles.preview}`} lang={locale} data-cart-component={component}>
    {component === "add-notice" ? <>
      <p className={previewStyles.hint}>{locale === "zh" ? "加购成功提示，预览保持显示，方便调整样式。页面中显示于右上角购物车入口下方，3 秒后自动消失。" : "Added-item feedback stays visible here for styling. On the page it appears below the cart entry and dismisses after 3 seconds."}</p>
      <div className={previewStyles.noticePreview}>{open ? <CartAddNotice item={fixture.recommendations[0]} locale={locale} onClose={() => setOpen(false)} /> : <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>{locale === "zh" ? "重新显示提示" : "Show notification"}</Button>}</div>
    </> : null}
    {component === "row" ? <section className={`${styles.merchant} ${previewStyles.component}`}>
      <ul className={styles.itemList}>{feedback ? <li className={styles.itemFeedback} data-slot="cart-item-feedback" data-action={feedback}>
        <img src={item.image} alt={item.title} width={40} height={40} />
        <p role="status" tabIndex={-1} ref={(node) => { node?.focus({ preventScroll: true }); }}>{t[feedback]}</p>
      </li> : <CartRow item={item} locale={locale} onSelect={(selected) => setItem({ ...item, selected })}
        onQuantity={(quantity) => setItem({ ...item, quantity })} onRemove={() => setFeedback("removed")} onSave={() => setFeedback("saved")} />}</ul>
      <div className={previewStyles.reset}><Button variant="secondary" size="sm" onClick={() => { setItem(initialItem); setFeedback(null); }}>{locale === "zh" ? "重置示例" : "Reset example"}</Button></div>
    </section> : null}
    {component === "merchant" ? <section className={`${styles.merchant} ${previewStyles.component}`}><CartMerchantHeader merchant={merchant} locale={locale} subtotal={subtotal} checked={checked} onCheckedChange={setChecked} /></section> : null}
    {component === "security" ? <>
      <p className={previewStyles.hint}>{locale === "zh" ? "用于 PC 购物车标题旁，每 3.5 秒切换一项；悬停暂停。移动端不展示轮播。" : "Shown beside the PC cart title. Advances every 3.5 seconds; hover to pause. The carousel is hidden on mobile."}</p>
      <section className={`${styles.overview} ${previewStyles.component}`}><div className={styles.titleRow}><h1>{t.cart}</h1><CartSecurityCarousel locale={locale} /></div></section>
    </> : null}
    {component === "coupons" || component === "unavailable" || component === "protection" ? <>
      <Button onClick={() => { setDraftCouponId(couponId); setOpen(true); }}>{title}</Button>
      <Drawer className={`${styles.cartDrawer} ${component === "protection" ? styles.protectionDrawer : component === "unavailable" ? styles.unavailableDrawer : styles.couponDrawer}`}
        open={open} title={title} closeLabel={t.close} onClose={() => setOpen(false)}
        description={mobile && component === "coupons" ? t.couponHint : undefined}
        footer={component === "coupons" ? <CartCouponActions locale={locale} onSave={() => { applyCoupon(draftCouponId); setOpen(false); }} /> : undefined}>
        {notice ? <div className={styles.drawerNotice}><p role="status">{notice}</p></div> : null}
        {component === "coupons" ? <CartCoupons locale={locale} coupons={coupons} couponId={draftCouponId} subtotalCents={couponSubtotal} quantity={state === "ineligible" ? 0 : 1} mobile={mobile}
          onSelect={setDraftCouponId} onRedeem={(code) => {
            const coupon = coupons.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
            if (!coupon) return t.couponInvalid;
            if (couponSubtotal < coupon.minSubtotalCents) return t.condition;
            setDraftCouponId(coupon.id); return "";
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
  globals: { theme: "light" },
  args: { state: "default" },
  argTypes: { state: { control: "select", options: ["default"], description: "切换状态会重置本地操作；使用工具栏切换 PC / Mobile 视口。 / Changing state resets local interactions; use the toolbar to switch PC / Mobile viewports." } },
} satisfies Meta<ComponentArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
function renderComponent(component: ComponentName): NonNullable<Story["render"]> {
  return ({ state }, { globals }) => <ComponentDemo key={`${globals.locale}-${component}-${state}`} component={component} locale={globals.locale === "en" ? "en" : "zh"} state={state} />;
}

export const CartRowPreview: Story = { name: "Cart Row", render: renderComponent("row"), argTypes: { state: { options: ["default", "selected", "low-stock", "long-title", "quantity-10"] } } };
export const MerchantHeader: Story = { render: renderComponent("merchant"), argTypes: { state: { options: ["default", "partial", "qualified"] } } };
export const CouponDrawer: Story = { render: renderComponent("coupons"), argTypes: { state: { options: ["default", "empty", "ineligible", "applied"] } } };
export const UnavailableDrawer: Story = { render: renderComponent("unavailable"), argTypes: { state: { options: ["default", "sold-out", "delisted", "empty"] } } };
export const ProtectionDrawer: Story = { render: renderComponent("protection"), parameters: { controls: { disable: true } } };
export const AddToCartNotice: Story = { name: "Add To Cart Notice", render: renderComponent("add-notice"), parameters: { controls: { disable: true } } };
export const SecurityCarousel: Story = { render: renderComponent("security"), parameters: { controls: { disable: true } } };
