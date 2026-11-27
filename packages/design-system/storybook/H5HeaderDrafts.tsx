'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import styles from './header-h5-v1/H5V1Preview.module.css'
import v2Styles from './header-h5-v2/H5V2Draft.module.css'
import { Drawer } from '../components/Drawer'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '../components/Popover'
import { HeaderSearch } from '../components/Header/HeaderSearch'
import { type HeaderLocale, headerStorefront } from '../components/Header/fixtures'

const cartIcon = new URL('../assets/icons/base/cart.svg', import.meta.url).href
const shareIcon = new URL('../assets/icons/action/share.svg', import.meta.url).href
const bestSellersIcon = new URL('../assets/icons/category/best-sellers.svg', import.meta.url).href
const chinaIcon = new URL('../assets/icons/area/china.svg', import.meta.url).href
const japanIcon = new URL('../assets/icons/area/japan.svg', import.meta.url).href
const koreaIcon = new URL('../assets/icons/area/korea.svg', import.meta.url).href
const flagIcon = new URL('../assets/icons/area/united-states-flag.svg', import.meta.url).href
const allArtwork = new URL('./header-h5-v1/assets/all.png', import.meta.url).href
const arrowIcon = new URL('./header-h5-v1/assets/arrow-right.svg', import.meta.url).href
const beautyArtwork = new URL('./header-h5-v1/assets/beauty.png', import.meta.url).href
const categoriesIcon = new URL('./header-h5-v1/assets/categories.svg', import.meta.url).href
const giftIcon = new URL('./header-h5-v1/assets/gift.svg', import.meta.url).href
const menuIcon = new URL('./header-h5-v1/assets/menu.svg', import.meta.url).href
const searchIcon = new URL('./header-h5-v1/assets/search.svg', import.meta.url).href
const southeastAsiaIcon = new URL('./header-h5-v1/assets/southeast-asia.png', import.meta.url).href
const zipcodeIcon = new URL('./header-h5-v1/assets/zipcode.svg', import.meta.url).href
const chevronIcon = new URL('./header-h5-v2/assets/chevron.svg', import.meta.url).href

export function H5HomeDraftHeader({ version, locale, categoryHref }: { version: 'v1' | 'v2'; locale: HeaderLocale; categoryHref?: string }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<'home' | 'listing'>('home')

  useLayoutEffect(() => {
    const node = wrapper.current
    if (!node) return
    const update = () => node.toggleAttribute('data-scrolled', window.scrollY > 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div ref={wrapper} className={styles.homeDraftHeader} data-slot="sticky-storefront-header">
      {version === 'v1'
        ? <H5V1Header layout="home" locale={locale} categoryHref={categoryHref} />
        : <H5V2Header layout={layout} locale={locale} onStorefrontChange={setLayout} />}
    </div>
  )
}

const storefronts = [
  { layout: 'home', artwork: allArtwork, en: ['All', 'Shop all categories in one go'], zh: ['全站', '一站逛遍全部品类'] },
  { layout: 'listing', artwork: beautyArtwork, en: ['Beauty', 'Get inspired by top beauty trends'], zh: ['美妆', '探索热门美妆趋势'] },
] as const

const shoppingEntries = (categoryHref?: string) => [
  { icon: categoriesIcon, en: 'Shop by Categories', zh: '按分类浏览', href: categoryHref },
  { icon: bestSellersIcon, en: 'Best Sellers', zh: '热销榜单' },
  { icon: giftIcon, en: 'Gifts', zh: '礼品' },
]

const regionEntries = [
  { icon: japanIcon, en: 'Japan', zh: '日本馆' },
  { icon: koreaIcon, en: 'Korea', zh: '韩国馆' },
  { icon: chinaIcon, en: 'Greater China Region', zh: '大中华馆' },
  { icon: southeastAsiaIcon, en: 'Southeast Asia', zh: '东南亚馆' },
]

function MobileLogo({ locale }: { locale: HeaderLocale }) {
  const { mobileLogo, darkMobileLogo } = headerStorefront[locale]
  return (
    <span className={styles.logo}>
      <img className={styles.logoLight} src={mobileLogo} alt="YAMI" width={84} height={32} />
      <img className={styles.logoDark} src={darkMobileLogo} alt="YAMI" width={84} height={32} />
    </span>
  )
}

function MenuEntries({ entries, locale }: { entries: { icon: string; en: string; zh: string; href?: string }[]; locale: HeaderLocale }) {
  return (
    <ul className={styles.menuList} role="list">
      {entries.map((entry) => {
        const content = <><img className={styles.icon} src={entry.icon} alt="" width={24} height={24} />{entry[locale]}</>
        return <li key={entry.en} className={entry.href ? undefined : styles.menuItem}>
          {entry.href ? <a href={entry.href} target="_self" className={styles.menuItem}>{content}</a> : content}
        </li>
      })}
    </ul>
  )
}

function HomeSearch({ locale }: { locale: HeaderLocale }) {
  const site = headerStorefront[locale]
  return (
    <div className={styles.searchRow}>
      <HeaderSearch
        variant="mobile"
        placeholder={site.searchPlaceholder}
        searchLabel={site.searchLabel}
        value={undefined}
        onValueChange={undefined}
        onSubmit={undefined}
      />
    </div>
  )
}

function StorefrontCard({ entry, locale, v1 }: { entry: typeof storefronts[number]; locale: HeaderLocale; v1?: boolean }) {
  const [title, description] = entry[locale]
  return (
    <>
      <span className={styles.storefrontText}>
        <span className={styles.storefrontTitle}>
          {v1 && entry.layout === 'home' && locale === 'en' ? 'ALL' : title}
          <img className={styles.icon} src={arrowIcon} alt="" width={14} height={14} />
        </span>
        <span className={styles.storefrontDescription}>{description}</span>
      </span>
      <img className={styles.artwork} src={entry.artwork} alt="" width={112} height={64} />
    </>
  )
}

export function H5V1Header({ layout, locale, categoryHref }: { layout: 'home' | 'beauty' | 'standard' | 'content'; locale: HeaderLocale; categoryHref?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const site = headerStorefront[locale]
  const zh = locale === 'zh'

  return (
    <>
      <header lang={locale} className={styles.header} aria-label={site.ariaLabel} data-layout={layout}>
        <div className={styles.bar}>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-label={zh ? '打开导航菜单' : 'Open navigation menu'}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen(true)}
          >
            <img className={styles.icon} src={menuIcon} alt="" width={24} height={24} />
          </button>
          <MobileLogo locale={locale} />
          <div className={styles.actions}>
            {layout !== 'content' && (
              <span className={styles.zipcode} aria-label={`${site.zipcode.label} ${site.zipcode.code}`} role="img">
                <img className={styles.icon} src={zipcodeIcon} alt="" width={24} height={24} />
                {site.zipcode.code}
              </span>
            )}
            {layout === 'home' && (
              <span className={styles.language} role="img" aria-label={site.localeName}>
                <img src={flagIcon} alt="" width={24} height={24} />
                {site.localeCode}
              </span>
            )}
            {(layout === 'beauty' || layout === 'standard') && (
              <span className={styles.action}>
                <img className={styles.icon} src={searchIcon} alt={site.searchLabel} width={24} height={24} />
              </span>
            )}
            {layout === 'content' && (
              <span className={styles.action}>
                <img className={styles.icon} src={shareIcon} alt={zh ? '分享' : 'Share'} width={24} height={24} />
              </span>
            )}
            {(layout === 'standard' || layout === 'content') && (
              <span className={styles.action}>
                <img className={styles.icon} src={cartIcon} alt={site.cart} width={24} height={24} />
              </span>
            )}
          </div>
        </div>
        {layout === 'home' && <HomeSearch locale={locale} />}
      </header>

      <Drawer
        id={menuId}
        className={styles.panel}
        data-slot="storefront-navigation-drawer"
        lang={locale}
        open={menuOpen}
        swipeDirection="left"
        title={zh ? '导航菜单' : 'Navigation menu'}
        titleContent={<MobileLogo locale={locale} />}
        closeLabel={zh ? '关闭导航菜单' : 'Close navigation menu'}
        onClose={() => setMenuOpen(false)}
        finalFocus={menuButton}
        contentPadding="none"
      >
        <div className={styles.panelContent}>
          <ul className={styles.storefronts} role="list">
            {storefronts.map((entry) => (
              <li className={styles.storefront} key={entry.layout}>
                <StorefrontCard entry={entry} locale={locale} v1 />
              </li>
            ))}
          </ul>
          <MenuEntries entries={shoppingEntries(categoryHref)} locale={locale} />
          <hr className={styles.divider} />
          <MenuEntries entries={regionEntries} locale={locale} />
        </div>
      </Drawer>
    </>
  )
}

export function H5V2Header({ layout, locale, onStorefrontChange }: {
  layout: 'home' | 'pdp' | 'scrolled' | 'listing'
  locale: HeaderLocale
  onStorefrontChange: (layout: (typeof storefronts)[number]['layout']) => void
}) {
  const headerBar = useRef<HTMLDivElement>(null)
  const usedSwitcher = useRef(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [showSwitcherHint, setShowSwitcherHint] = useState(false)
  const site = headerStorefront[locale]
  const zh = locale === 'zh'
  const switchLabel = zh ? '切换首页' : 'Switch storefront'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (usedSwitcher.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setShowSwitcherHint(true)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [])

  function onSwitcherOpenChange(open: boolean) {
    setSwitcherOpen(open)
    if (open) {
      usedSwitcher.current = true
      setShowSwitcherHint(false)
    }
  }

  return (
    <Popover open={switcherOpen} onOpenChange={onSwitcherOpenChange}>
      <header lang={locale} className={`${styles.header} ${v2Styles.header}`} aria-label={site.ariaLabel} data-layout={layout}
        data-phone-preview-extend-status={switcherOpen ? '' : undefined}>
        <div ref={headerBar} className={`${styles.bar} ${v2Styles.bar}`}>
          <div className={v2Styles.brand}>
            <MobileLogo locale={locale} />
            <PopoverTrigger className={v2Styles.trigger} aria-label={switchLabel}>
              <span className={v2Styles.arrow} data-show-hint={showSwitcherHint || undefined}>
                <img className={styles.icon} src={chevronIcon} alt="" width={14} height={14} onAnimationEnd={() => setShowSwitcherHint(false)} />
              </span>
            </PopoverTrigger>
          </div>
          <div className={styles.actions}>
            <span className={styles.zipcode} aria-label={`${site.zipcode.label} ${site.zipcode.code}`} role="img">
              <img className={styles.icon} src={zipcodeIcon} alt="" width={24} height={24} />
              {site.zipcode.code}
            </span>
            {layout === 'home' ? (
              <span className={styles.language} role="img" aria-label={site.localeName}>
                <img src={flagIcon} alt="" width={24} height={24} />
                {site.localeCode}
              </span>
            ) : (
              <span className={styles.action}>
                <img className={styles.icon} src={searchIcon} alt={site.searchLabel} width={24} height={24} />
              </span>
            )}
            {layout === 'pdp' && (
              <span className={styles.action}>
                <img className={styles.icon} src={cartIcon} alt={site.cart} width={24} height={24} />
              </span>
            )}
          </div>
        </div>
        {layout === 'home' && <HomeSearch locale={locale} />}
      </header>
      {switcherOpen && <div className={v2Styles.backdrop} aria-hidden="true" />}
      <PopoverContent
        className={v2Styles.switcher}
        aria-label={switchLabel}
        lang={locale}
        anchor={headerBar}
        side="bottom"
        align="center"
        sideOffset={0}
        collisionAvoidance={{ side: 'none', align: 'none', fallbackAxisSide: 'none' }}
      >
        {storefronts.map((entry) => (
          <PopoverClose
            key={entry.layout}
            className={`${styles.storefront} ${v2Styles.storefrontButton}`}
            onClick={() => onStorefrontChange(entry.layout)}
          >
            <StorefrontCard entry={entry} locale={locale} />
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  )
}
