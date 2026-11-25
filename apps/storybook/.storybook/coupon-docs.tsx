import { useState } from "react";
import { Coupon, type CouponProps } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

type CouponContent = Pick<CouponProps, "title" | "description" | "validity">;

const previewWidth = { width: "min(100%, 416px)" };

function ClaimExample({ content, claimLabel, claimedLabel }: {
  content: CouponContent;
  claimLabel: string;
  claimedLabel: string;
}) {
  const [claimed, setClaimed] = useState(false);

  return <Coupon {...content} claim={{
    status: claimed ? "claimed" : "available",
    label: claimed ? claimedLabel : claimLabel,
    onClaim: () => setClaimed(true),
  }} />;
}

function SelectionExample({ content }: { content: CouponContent }) {
  const [selected, setSelected] = useState(false);

  return <Coupon {...content} selected={selected} onSelectedChange={setSelected} />;
}

export function CouponDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const content = zh ? {
    title: "立享 10% OFF",
    description: "亚米自营商品通用，特殊商品除外",
    validity: "有效期至 01/01/2027 15:59",
  } : {
    title: "Save 10%",
    description: "Valid on Yami-fulfilled items. Exclusions apply.",
    validity: "Valid until 01/01/2027 15:59",
  };
  const claimLabel = zh ? "领取" : "Claim";
  const claimedLabel = zh ? "已领取" : "Claimed";
  const disabledReason = zh ? "未达到最低订单金额" : "Minimum order amount not met.";
  const importCoupon = 'import { Coupon } from "@yami/design-system";';
  const importState = `import { useState } from "react";\n${importCoupon}`;
  const contentProps = `title=${JSON.stringify(content.title)}\n      description=${JSON.stringify(content.description)}\n      validity=${JSON.stringify(content.validity)}`;
  const examples: GuideExample[] = [
    {
      id: "claim",
      title: zh ? "领取优惠券" : "Claim a coupon",
      description: zh ? "点击领取后，由业务方更新领取状态和按钮文案。" : "The host updates the claim status and action label after the customer claims the coupon.",
      code: `${importState}\n\nfunction ClaimExample() {\n  const [claimed, setClaimed] = useState(false);\n\n  return (\n    <Coupon\n      ${contentProps}\n      claim={{\n        status: claimed ? "claimed" : "available",\n        label: claimed ? ${JSON.stringify(claimedLabel)} : ${JSON.stringify(claimLabel)},\n        onClaim: () => setClaimed(true),\n      }}\n    />\n  );\n}`,
      preview: <div style={previewWidth}><ClaimExample content={content} claimLabel={claimLabel} claimedLabel={claimedLabel} /></div>,
    },
    {
      id: "selection",
      title: zh ? "结算时选券" : "Select at checkout",
      description: zh ? "点击卡片或按空格切换选中状态。调用方决定何时提交选择。" : "Click the card or press Space to toggle selection. The host decides when to commit it.",
      code: `${importState}\n\nfunction SelectionExample() {\n  const [selected, setSelected] = useState(false);\n\n  return (\n    <Coupon\n      ${contentProps}\n      selected={selected}\n      onSelectedChange={setSelected}\n    />\n  );\n}`,
      preview: <div style={previewWidth}><SelectionExample content={content} /></div>,
    },
    {
      id: "disabled",
      title: zh ? "不可用的优惠券" : "Unavailable coupon",
      description: zh ? "优惠券不可用时，在说明里写明原因。" : "Explain why the coupon is unavailable in its description.",
      code: `${importCoupon}\n\n<Coupon\n  title=${JSON.stringify(content.title)}\n  description=${JSON.stringify(disabledReason)}\n  selected={false}\n  onSelectedChange={() => {}}\n  disabled\n/>`,
      preview: <div style={previewWidth}><Coupon title={content.title} description={disabledReason} selected={false} onSelectedChange={() => {}} disabled /></div>,
    },
  ];

  return <ComponentGuide name="Coupon" slug="coupon" locale={locale}
    intro={zh ? "展示优惠内容、使用条件和有效期，支持领取或在结算时选券。" : "Show a coupon’s offer, conditions, and validity. Customers can claim it or select it at checkout."}
    previous={{ name: "BrandProductRail", path: "yami-components-commerce-brand-product-rail" }}
    next={{ name: "HeroBanner", path: "yami-components-commerce-hero-banner" }}
    legacyAnchors={{ usage: ["coupon--usage"], examples: ["component-playground", "component-specifications"] }}
    usageNote={zh ? "领取时传入 claim，选券时传入 selected 和 onSelectedChange。" : "Pass claim for a claim action. Pass selected and onSelectedChange for checkout selection."}
    composition={zh ? [["卡片顶部", "优惠标题与领取按钮或选择标记。最小高度为 56 px，左右内边距各为 16 px。"], ["卡片底部", "使用条件与可选的有效期。"]]
      : [["Header", "The offer title and a claim button or selection indicator. The minimum height is 56 px with 16 px of padding on each side."], ["Details", "Eligibility conditions and optional validity text."]]}
    examples={examples}
    apiNote={zh ? "业务方维护领取、选中状态及使用条件。" : "The host owns claim status, selection, and eligibility."}
    api={[
      ["title, description", zh ? "必填字符串。显示优惠标题与使用条件。" : "Required strings for the offer title and eligibility conditions."],
      ["validity", zh ? "可选字符串，传入完整的本地化有效期文案。" : "Optional localized validity text."],
      ["claim", zh ? "领取模式，传入 status、label 和 onClaim。状态为 available、claiming 或 claimed。领取成功后可提供 useLink，设置 href、label 和可选 target。" : "Claim mode takes status, label, and onClaim. Use available, claiming, or claimed. After claiming, useLink can provide an href, label, and optional target."],
      ["selected, onSelectedChange", zh ? "选券模式下的受控选中值与变更回调。" : "The controlled checked value and change callback in selection mode."],
      ["disabled", zh ? "禁用领取或选券，默认 false。" : "Disables claiming or selection. Defaults to false."],
      ["className", zh ? "添加到卡片根元素的类名。" : "Additional class on the coupon’s root element."],
    ]}
    accessibility={zh ? ["选券使用复选框语义，聚焦后按空格切换。", "领取使用按钮。已领取时显示状态文字，配置去使用时显示具有明确名称的链接。"]
      : ["Selection uses checkbox semantics and toggles with Space.", "Claiming uses a button. A claimed coupon shows status text or a redemption link with a clear label."]} />;
}
