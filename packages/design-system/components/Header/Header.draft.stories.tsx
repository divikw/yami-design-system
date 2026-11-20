import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'

import cartIcon from '../../assets/icons/base/cart.svg'
import { H5V1Header, H5V2Header } from '../../storybook/H5HeaderDrafts'
import styles from '../../storybook/header-h5-v1/H5V1Preview.module.css'
import accountIcon from '../../storybook/header-h5-v2/assets/account.svg'
import homeIcon from '../../storybook/header-h5-v2/assets/home.svg'
import lessIcon from '../../storybook/header-h5-v2/assets/less.svg'
import plusIcon from '../../storybook/header-h5-v2/assets/plus.svg'
import shopIcon from '../../storybook/header-h5-v2/assets/shop.svg'
import v2Styles from '../../storybook/header-h5-v2/H5V2Draft.module.css'
import { Button } from '../Button'
import { TabBar } from '../TabBar'
import type { HeaderLocale } from './fixtures'

const layouts = {
  home: 'Home',
  beauty: 'Beauty Home',
  standard: 'Standard Page',
  content: 'Content Page',
}

type H5V1Args = { h5Layout: keyof typeof layouts }

const v2Layouts = {
  home: 'Home',
  pdp: 'PDP',
  scrolled: 'PDP (Scrolled)',
  listing: 'Beauty / Listing / Content',
}

type H5V2Args = { h5V2Layout: keyof typeof v2Layouts }

const listingDestinations = [
  { value: 'discover', en: 'Discover', zh: '发现', icon: homeIcon },
  { value: 'shop', en: 'Shop', zh: '分类', icon: shopIcon },
  { value: 'cart', en: 'Cart', zh: '购物车', icon: cartIcon },
  { value: 'account', en: 'Account', zh: '我的', icon: accountIcon },
]

function ListingNavigation({ locale, onHome }: { locale: HeaderLocale; onHome: () => void }) {
  const [destination, setDestination] = useState('')
  return (
    <TabBar
      className={v2Styles.bottom}
      aria-label={locale === 'zh' ? '底部导航' : 'Bottom navigation'}
      value={destination}
      items={listingDestinations.map(({ value, icon, ...labels }) => ({
        value,
        label: labels[locale],
        icon: <img className={styles.icon} src={icon} alt="" width={24} height={24} />,
        onClick: value === 'discover' ? onHome : () => setDestination(value),
      }))}
    />
  )
}

function PdpNavigation({ locale, onHome }: { locale: HeaderLocale; onHome: () => void }) {
  const [quantity, setQuantity] = useState(1)
  const zh = locale === 'zh'
  return (
    <div className={`${v2Styles.bottom} ${v2Styles.purchaseBar}`}>
      <button className={v2Styles.homeShortcut} type="button" onClick={onHome}>
        <img className={styles.icon} src={homeIcon} alt="" width={24} height={24} />
        {zh ? '首页' : 'Home'}
      </button>
      <div className={v2Styles.quantity} role="group" aria-label={zh ? '数量' : 'Quantity'}>
        <button type="button" aria-label={zh ? '减少数量' : 'Decrease quantity'} disabled={quantity === 1} onClick={() => setQuantity(quantity - 1)}>
          <img src={lessIcon} alt="" width={24} height={24} />
        </button>
        <span aria-live="polite">{quantity}</span>
        <button type="button" aria-label={zh ? '增加数量' : 'Increase quantity'} onClick={() => setQuantity(quantity + 1)}>
          <img src={plusIcon} alt="" width={24} height={24} />
        </button>
      </div>
      <Button variant="emphasis" form="full" size="lg">{zh ? '加入购物车' : 'Add to Cart'}</Button>
    </div>
  )
}

const meta = {
  id: 'yami-components-navigation-header-draft',
  title: 'YAMI/Modules/Global/Header/Draft',
  tags: ['draft', '!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

export const H5V1: StoryObj<H5V1Args> = {
  name: 'H5 V1',
  tags: ['component-device', 'dev', 'draft', '!autodocs', '!test'],
  globals: { viewport: { value: 'yamiMobile', isRotated: false } },
  parameters: { controls: { include: ['H5 layout'] } },
  args: { h5Layout: 'home' },
  argTypes: {
    h5Layout: {
      name: 'H5 layout',
      options: Object.keys(layouts),
      control: { type: 'inline-radio', labels: layouts },
    },
  },
  render: ({ h5Layout }, { globals }) => {
    const locale = globals.locale === 'en' ? 'en' : 'zh'
    return (
      <div className={styles.canvas} lang={locale}>
        <H5V1Header layout={h5Layout} locale={locale} />
      </div>
    )
  },
}

export const H5V2: StoryObj<H5V2Args> = {
  name: 'H5 V2',
  tags: ['component-device', 'dev', 'draft', '!autodocs', '!test'],
  globals: { viewport: { value: 'yamiMobile', isRotated: false } },
  parameters: { controls: { include: ['H5 layout'] } },
  args: { h5V2Layout: 'home' },
  argTypes: {
    h5V2Layout: {
      name: 'H5 layout',
      options: Object.keys(v2Layouts),
      control: { type: 'inline-radio', labels: v2Layouts },
    },
  },
  render: function Preview({ h5V2Layout: layout }, { globals }) {
    const [, updateArgs] = useArgs<H5V2Args>()
    const locale = globals.locale === 'en' ? 'en' : 'zh'
    const showHome = () => updateArgs({ h5V2Layout: 'home' })
    return (
      <div className={styles.canvas} lang={locale}>
        <H5V2Header layout={layout} locale={locale}
          onStorefrontChange={(nextLayout) => updateArgs({ h5V2Layout: nextLayout })} />
        {layout === 'listing' && <ListingNavigation locale={locale} onHome={showHome} />}
        {(layout === 'pdp' || layout === 'scrolled') && <PdpNavigation locale={locale} onHome={showHome} />}
      </div>
    )
  },
}
