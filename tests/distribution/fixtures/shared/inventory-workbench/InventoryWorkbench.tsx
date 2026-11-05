'use client'

import { useId, useRef, useState } from 'react'
import { Button, ButtonLink } from '@yami/design-system/components/Button'
import { Card } from '@yami/design-system/components/Card'
import { Input } from '@yami/design-system/components/Input'
import './inventory-workbench.css'

const inventory = [
  { sku: 'TEA-01', name: '茉莉绿茶', pack: '24 瓶 / 箱', stock: 3, reorderAt: 6, target: 12, cents: 2390 },
  { sku: 'NUT-02', name: '海盐烘烤腰果', pack: '12 袋 / 箱', stock: 4, reorderAt: 4, target: 10, cents: 2480 },
  { sku: 'OAT-03', name: '原味燕麦饮', pack: '6 盒 / 箱', stock: 11, reorderAt: 4, target: 12, cents: 1650 },
  { sku: 'CRK-04', name: '紫菜糙米脆饼分享装', pack: '10 袋 / 箱', stock: 8, reorderAt: 3, target: 12, cents: 1820 },
  { sku: 'COF-05', name: '深烘挂耳咖啡', pack: '20 包 / 盒', stock: 7, reorderAt: 5, target: 14, cents: 1260 },
]

type Item = (typeof inventory)[number]
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const formatPrice = (cents: number) => money.format(cents / 100)

export function InventoryWorkbench() {
  const inventoryTitle = useId()
  const draftTitle = useId()
  const draftHeading = useRef<HTMLHeadingElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [notice, setNotice] = useState('')

  const search = query.trim().toLowerCase()
  const visible = inventory.filter((item) => `${item.name} ${item.sku} ${item.pack}`.toLowerCase().includes(search))
  const lowStock = visible.filter((item) => item.stock <= item.reorderAt).length
  const lines = inventory.filter((item) => draft[item.sku] > 0)
  const total = lines.reduce((sum, item) => sum + item.cents * draft[item.sku], 0)
  const units = lines.reduce((sum, item) => sum + draft[item.sku], 0)
  const csv = [
    'SKU,商品,数量,单价USD',
    ...lines.map((item) => `${item.sku},${item.name},${draft[item.sku]},${(item.cents / 100).toFixed(2)}`),
  ].join('\r\n')

  function setQuantity(item: Item, quantity: number) {
    setDraft((current) => ({ ...current, [item.sku]: quantity }))
    setNotice(quantity > 0 ? `${item.name}，清单中 ${quantity} 件` : `已移除${item.name}`)
  }

  return (
    <main className="inventory-workbench" lang="zh">
      <header className="inventory-workbench__header">
        <div>
          <h1>库存与补货</h1>
          <p>核对库存余量，按建议数量整理本次采购。</p>
        </div>
        <ButtonLink variant="secondary" href={`#${draftTitle}`}>查看采购清单</ButtonLink>
      </header>

      <div className="inventory-workbench__layout">
        <section aria-labelledby={inventoryTitle}>
          <div className="inventory-workbench__heading">
            <h2 id={inventoryTitle} tabIndex={-1}>商品库存</h2>
            <p>{visible.length} 款商品{lowStock > 0 && <> · <strong>{lowStock} 款待补货</strong></>}</p>
          </div>
          <div className="inventory-workbench__search">
            <Input
              ref={searchInput}
              density="compact"
              type="search"
              aria-label="搜索商品"
              placeholder="搜索商品名称、SKU 或规格"
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {visible.length === 0 ? (
            <div className="inventory-workbench__empty">
              <p>没有符合条件的商品。</p>
              <Button variant="secondary" onClick={() => { setQuery(''); searchInput.current?.focus() }}>清除搜索</Button>
            </div>
          ) : (
            // Keep table roles when CSS reflows the rows on narrow screens.
            <table className="inventory-workbench__table" role="table" aria-label="库存明细">
              <thead role="rowgroup">
                <tr role="row">
                  <th scope="col" role="columnheader">商品</th>
                  <th scope="col" role="columnheader">现有库存</th>
                  <th scope="col" role="columnheader">补货线</th>
                  <th scope="col" role="columnheader">单价</th>
                  <th scope="col" role="columnheader">加入清单</th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {visible.map((item) => {
                  const low = item.stock <= item.reorderAt
                  const planned = draft[item.sku] ?? 0
                  const suggested = low ? item.target - item.stock : 1
                  const label = planned > 0 ? '再加 1 件' : `加入 ${suggested} 件`
                  return (
                    <tr key={item.sku} role="row">
                      <th scope="row" role="rowheader">
                        <div className="inventory-workbench__name">
                          {item.name}
                          {low && <span className="inventory-workbench__low">待补货</span>}
                        </div>
                        <span className="inventory-workbench__meta">{item.sku} · {item.pack}</span>
                      </th>
                      <td role="cell"><span className="inventory-workbench__mobile-label" aria-hidden="true">现有库存</span><strong>{item.stock}</strong></td>
                      <td role="cell"><span className="inventory-workbench__mobile-label" aria-hidden="true">补货线</span>{item.reorderAt}</td>
                      <td role="cell"><span className="inventory-workbench__mobile-label" aria-hidden="true">单价</span>{formatPrice(item.cents)}</td>
                      <td role="cell">
                        <Button variant={low ? 'secondary' : 'tertiary'} aria-label={`${label}，${item.name}`} onClick={() => setQuantity(item, planned > 0 ? planned + 1 : suggested)}>
                          {label}
                        </Button>
                        {planned > 0 && <span className="inventory-workbench__meta">已选 {planned} 件</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside aria-labelledby={draftTitle}>
          <Card surface="secondary" padding="lg">
            <div className="inventory-workbench__heading">
              <h2 id={draftTitle} ref={draftHeading} tabIndex={-1}>采购清单</h2>
              <p>{lines.length} 款 · {units} 件</p>
            </div>
            {lines.length === 0 ? (
              <div className="inventory-workbench__empty">
                <p><strong>清单还没有商品。</strong></p>
                <p>加入商品后，可以调整数量并导出。</p>
                <ButtonLink variant="secondary" href={`#${inventoryTitle}`}>选择商品</ButtonLink>
              </div>
            ) : (
              <ul className="inventory-workbench__lines" role="list" aria-label="待采购商品">
                {lines.map((item) => (
                  <li key={item.sku}>
                    <div className="inventory-workbench__amount">
                      <strong>{item.name}</strong><span>{formatPrice(item.cents * draft[item.sku])}</span>
                    </div>
                    <div className="inventory-workbench__quantity" role="group" aria-label={`${item.name}数量`}>
                      <Button form="icon" size="lg" variant="secondary" aria-label={`减少${item.name}数量`} disabled={draft[item.sku] === 1} onClick={() => setQuantity(item, draft[item.sku] - 1)}>−</Button>
                      <span>{draft[item.sku]}</span>
                      <Button form="icon" size="lg" variant="secondary" aria-label={`增加${item.name}数量`} onClick={() => setQuantity(item, draft[item.sku] + 1)}>+</Button>
                      <Button variant="tertiary" aria-label={`移除${item.name}`} onClick={() => { draftHeading.current?.focus(); setQuantity(item, 0) }}>移除</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="inventory-workbench__total inventory-workbench__amount">
              <span>采购预估</span><strong>{formatPrice(total)}</strong>
            </div>
            {lines.length > 0 && (
              <ButtonLink form="full" size="lg" variant="emphasis" download="restock.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`}>
                导出采购清单
              </ButtonLink>
            )}
          </Card>
        </aside>
      </div>
      <p className="inventory-workbench__footnote">样例库存 · 金额以美元计算</p>
      <span className="inventory-workbench__sr-only" role="status">{notice}</span>
    </main>
  )
}
