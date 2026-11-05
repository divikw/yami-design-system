'use client'

import { useLayoutEffect, useRef } from 'react'

import { Header } from './Header'
import styles from './StickyStorefrontHeader.module.css'
import type { HeaderProps } from './Header.types'

/** Page chrome for a document-scrolling storefront. */
export function StickyStorefrontHeader(props: HeaderProps) {
  const wrapper = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = wrapper.current
    if (!node) return
    const update = () => node.toggleAttribute('data-scrolled', window.scrollY > 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div ref={wrapper} className={styles.root} data-slot="sticky-storefront-header">
      <Header {...props} />
    </div>
  )
}
