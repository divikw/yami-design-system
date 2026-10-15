"use client";

import { useId, useState } from "react";
import { Button, ButtonGroup, ButtonLink, Checkbox, Input, QuantitySelect } from "@yami/design-system";
import type { CartCoupon, CartItemData, CartLocale, CartMerchant } from "./CartPage.types";
import { formatCartMoney as money } from "./cart-totals";
import { cartGuarantees, cartPaymentMarks, cartProtectionDetails, cartSecurityCertifications } from "./fixtures";
import { text } from "./CartPage.copy";
import styles from "./CartPage.module.css";

const deliveryIcon = new URL("../../../design-system/assets/icons/system/delivery-line.png", import.meta.url).href;
const qualifiedShippingIcon = new URL("../../../design-system/assets/icons/system/shipping-qualified.png", import.meta.url).href;

export function CouponCodeForm({ locale, onRedeem }: { locale: CartLocale; onRedeem: (code: string) => string }) {
  const t = text[locale];
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const codeId = useId();
  return <form className={styles.couponForm} noValidate onSubmit={(event) => { event.preventDefault(); setError(code.trim() ? onRedeem(code.trim()) : t.codeRequired); }}>
    <label htmlFor={codeId}>{t.code}</label>
    <Input id={codeId} density="compact" fullWidth value={code} error={error} onChange={(event) => { setCode(event.target.value); setError(""); }} />
    <Button className={`${styles.actionLink} ${styles.couponAction}`} size="md" variant="tertiary" htmlType="submit">{t.redeem}</Button>
  </form>;
}

export function CartRow({ item, locale, onSelect, onQuantity, onRemove, onSave, onNotify, notified = false }: {
  item: CartItemData; locale: CartLocale; onSelect?: (checked: boolean) => void; onQuantity?: (value: number) => void;
  onRemove: () => void; onSave?: () => void; onNotify?: () => void; notified?: boolean;
}) {
  const t = text[locale];
  const available = item.availability === "available";
  const price = <>
    {item.originalPriceCents && item.originalPriceCents > item.priceCents ? <del>{money(item.originalPriceCents * item.quantity)}</del> : null}
    <strong data-discounted={Boolean(item.originalPriceCents && item.originalPriceCents > item.priceCents)}>{money(item.priceCents * item.quantity)}</strong>
  </>;
  return <li className={styles.item} data-slot="cart-item" data-available={available}>
    {onSelect ? <label className={styles.itemCheck}><Checkbox checked={item.selected} onCheckedChange={onSelect} /><span className={styles.srOnly}>{t.select} {item.title}</span></label> : null}
    <div className={styles.rowContent}>
      <div className={styles.productGroup} data-slot="cart-product-group">
        {available ? <a className={styles.itemImage} href={item.href} aria-label={item.title}><img src={item.image} alt="" width={100} height={100} loading="lazy" /></a>
          : <div className={styles.itemImage}><img src={item.image} alt="" width={100} height={100} loading="lazy" /></div>}
        <div className={styles.productDetails} data-slot="cart-product-details">
          <div className={styles.itemInfo}>
            <h3>{available ? <a href={item.href}><span>{item.title}</span></a> : <span>{item.title}</span>}</h3>
            {item.attributes.map((attribute) => <p className={styles.attribute} key={attribute}>{attribute}</p>)}
            {item.lowStock && available ? <p className={`${styles.attention} ${styles.stockInfo}`}>{t.shortage}</p> : null}
          </div>
          <div className={styles.price}>
            {available ? price : <><div className={styles.unavailablePrices}>{price}</div><p className={styles.unavailableStatus}>{item.availability === "sold-out" ? t.soldOut : t.delisted}</p></>}
          </div>
          {available && onQuantity ? <div className={styles.quantity}>
            <QuantitySelect label={`${item.title} ${t.quantity}`} locale={locale} value={item.quantity} max={item.maxQuantity} onValueChange={onQuantity} />
            {item.lowStock ? <p className={`${styles.attention} ${styles.stockQuantity}`}>{t.shortage}</p> : null}
          </div> : null}
          <ButtonGroup className={styles.rowActions} aria-label={`${item.title} · ${locale === "zh" ? "商品操作" : "Item actions"}`}>
            <Button className={styles.actionLink} variant="tertiary" size="sm" aria-label={`${t.remove} ${item.title}`} onClick={onRemove}>{t.remove}</Button>
            {onSave ? <Button className={styles.actionLink} variant="tertiary" size="sm" aria-label={`${t.save} ${item.title}`} onClick={onSave}>{t.save}</Button> : null}
            {onNotify ? <Button className={styles.actionLink} variant="tertiary" size="sm" aria-label={`${notified ? t.notified : t.notify} ${item.title}`} disabled={notified} onClick={onNotify}>{notified ? t.notified : t.notify}</Button> : null}
          </ButtonGroup>
        </div>
      </div>
    </div>
  </li>;
}

export function CartMerchantHeader({ merchant, locale, subtotal, checked, onCheckedChange }: {
  merchant: CartMerchant; locale: CartLocale; subtotal: number; checked: boolean; onCheckedChange: (checked: boolean) => void;
}) {
  const t = text[locale];
  const remaining = Math.max(0, merchant.freeShippingCents - subtotal);
  return <header className={styles.merchantHeader}>
    <div className={styles.merchantIdentity}><label className={styles.selectionControl}><Checkbox checked={checked}
      onCheckedChange={onCheckedChange} /><span className={styles.srOnly}>{merchant.title} {merchant.origin}</span></label>
      <h2 className={styles.merchantHeading}><a className={styles.merchantName} id={`merchant-${merchant.id}`} href={merchant.href}>{merchant.title}</a><small className={styles.merchantOrigin}>{merchant.origin}</small></h2>
      <span className={styles.mobileShipping}><img src={deliveryIcon} alt="" width={16} height={16} />{remaining === 0 ? t.free : `${t.shipping} ${money(merchant.shippingCents)}`}</span>
    </div>
    <div className={styles.shippingActions}><div className={styles.shipping} data-slot="cart-shipping" data-qualified={remaining === 0}>
      <p><img className={styles.shippingIcon} src={remaining === 0 ? qualifiedShippingIcon : deliveryIcon} alt="" width={16} height={16} /><span>{remaining === 0 ? <>{t.freeEarned}<strong>{locale === "zh" ? t.free : ` ${t.free.toLowerCase()}`}</strong></> : <><span className={styles.shippingFee}>{t.shipping} {money(merchant.shippingCents)} · </span>{locale === "zh" ? "再加" : "Add"} <span className={`${styles.attention} ${styles.shippingPhrase}`}>{money(remaining)}</span> <span className={styles.shippingPhrase}>{locale === "zh" ? "可享免运费" : "for free shipping"}</span></>}</span></p>
      <progress max={merchant.freeShippingCents} value={Math.min(subtotal, merchant.freeShippingCents)} aria-label={`${merchant.title} ${t.free}`}
        aria-valuetext={remaining === 0 ? t.free : locale === "zh" ? `还差 ${money(remaining)} 可享免运费` : `${money(remaining)} away from free shipping`} />
    </div>
    <ButtonLink className={styles.addMore} form="full" size="sm" href={merchant.href} rightIcon={<span className={styles.chevron} aria-hidden="true" />}>{t.more}</ButtonLink></div>
  </header>;
}

export function CartSecurityCarousel({ locale }: { locale: CartLocale }) {
  return <div className={styles.securityCarousel} data-slot="cart-security-carousel" aria-hidden="true">
    <div className={styles.securityTrack} data-slot="cart-security-track">
      {[...cartGuarantees, cartGuarantees[0]].map((guarantee, index) => <div className={styles.securitySlide} key={index}>
        <img src={`https://cdn.yamibuy.net/mkt/${guarantee.image}_0x0.png`} alt="" width={20} height={20} /><span>{guarantee[locale]}</span>
      </div>)}
    </div>
  </div>;
}

export function CartCoupons({ locale, coupons, couponId, subtotalCents, quantity, onRedeem, onApply }: {
  locale: CartLocale; coupons: CartCoupon[]; couponId: string | null; subtotalCents: number; quantity: number;
  onRedeem: (code: string) => string; onApply: (id: string | null) => void;
}) {
  const t = text[locale];
  return <><p>{t.couponHint}</p><CouponCodeForm locale={locale} onRedeem={onRedeem} />
    {coupons.length === 0 ? <p className={styles.drawerEmpty}>{t.noCoupons}</p> : <ul className={styles.couponList}>{coupons.map((entry) => <li key={entry.id}>
      <h3 className={styles.couponTitle}>{entry.title}</h3><p>{entry.description}</p><p className={styles.muted}>{entry.code}</p>
      {subtotalCents < entry.minSubtotalCents ? <p className={styles.attention}>{t.condition}</p> : null}
      <Button size="sm" aria-pressed={couponId === entry.id} disabled={couponId !== entry.id && (quantity === 0 || subtotalCents < entry.minSubtotalCents)} onClick={() => onApply(couponId === entry.id ? null : entry.id)}>{couponId === entry.id ? t.unused : t.use}</Button>
    </li>)}</ul>}{couponId ? <Button variant="tertiary" onClick={() => onApply(null)}>{t.noCoupon}</Button> : null}
  </>;
}

export function CartProtectionDetails({ locale }: { locale: CartLocale }) {
  return <div className={styles.guaranteeDetails}>{cartProtectionDetails.map((detail, index) => <section className={styles.guaranteeSection} key={detail.guarantee.en}>
    <div className={styles.guaranteeIntro}>
      <h3><img src={`https://cdn.yamibuy.net/mkt/${detail.guarantee.image}_0x0.png`} alt="" width={20} height={20} /><span>{detail.guarantee[locale]}</span></h3>
      {detail.body ? <p>{detail.body[locale]}</p> : null}
    </div>
    {index === 0 ? <div className={styles.paymentDetails}>
      <ul className={styles.paymentMarks} aria-label={locale === "zh" ? "支付方式" : "Payment methods"}>{cartPaymentMarks.map((mark) => <li key={mark.name}><img src={mark.src} alt={mark.name} width={52} height={32} /></li>)}</ul>
      <div className={styles.certificationGroup}>
        <p>{locale === "zh" ? "支付安全认证" : "Payment security certifications"}</p>
        <ul className={styles.certificationMarks} aria-label={locale === "zh" ? "支付安全认证" : "Payment security certifications"}>{cartSecurityCertifications.map((mark) => <li key={mark.name}><img src={mark.src} alt={mark.name} height={30} /></li>)}</ul>
      </div>
    </div> : null}
    {detail.items ? <ul className={styles.guaranteeItems}>{detail.items[locale].map((item) => <li key={item}><img src="https://cdn.yamibuy.net/mkt/a659b0fb424ac2894890d7210cbca240_0x0.png" alt="" width={20} height={20} /><span>{item}</span></li>)}</ul> : null}
  </section>)}</div>;
}
