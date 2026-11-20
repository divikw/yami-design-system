import type { CSSProperties } from "react";
import { Input, type InputDensity, type InputProps } from "./Input";

export const shellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-500)",
  width: "min(760px, 100%)",
  fontFamily: "var(--font-family-ios)",
}

export const groupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-200)",
  minWidth: 0,
  maxWidth: "100%",
}

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-200)",
  alignItems: "flex-start",
}

export const labelStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-secondary)",
  fontSize: "var(--font-size-body-md)",
  lineHeight: "var(--line-height-body-md)",
  fontWeight: "var(--font-weight-normal)",
}

// Search icon from packages/design-system/assets/icons/action/search.svg.
// Inlined as a component so Storybook renders the canonical currentColor SVG
// path without depending on bundler-specific SVG imports.
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5001 3C14.6422 3 18.0001 6.35786 18.0001 10.5C18.0001 12.3009 17.3637 13.9522 16.3058 15.2451L21.088 20.0273L20.0274 21.0879L15.2452 16.3057C13.9523 17.3636 12.301 18 10.5001 18C6.35796 18 3.0001 14.6421 3.0001 10.5C3.0001 6.35786 6.35796 3 10.5001 3ZM10.5001 4.60742C7.24556 4.60742 4.60752 7.24546 4.60752 10.5C4.60752 13.7545 7.24556 16.3926 10.5001 16.3926C13.7546 16.3926 16.3927 13.7545 16.3927 10.5C16.3927 7.24546 13.7546 4.60742 10.5001 4.60742Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StateExample({ title, english, ...props }: InputProps & { title: string; english: boolean }) {
  return (
    <div style={groupStyle}>
      <p style={labelStyle}>{title}</p>
      <Input label={english ? "Label" : "标签"} {...props} />
    </div>
  );
}

export function InputDensityStates({ density, english = false }: { density: InputDensity; english?: boolean }) {
  const value = english ? "Input" : "输入内容";
  const promoError = english ? "Check your promo code." : "请检查折扣码后重试。";
  const message = `https://example.com/${"a".repeat(100)}`;
  const stateProps = { density, english };

  return (
    <section data-input-state-density={density} style={shellStyle}>
      <div style={rowStyle}>
        <StateExample {...stateProps} title={english ? "Default" : "默认"} state="default" />
        <StateExample {...stateProps} title={english ? "Focused" : "聚焦"} state="focused" />
        <StateExample {...stateProps} title={english ? "Typing" : "输入中"} state="typing" defaultValue={value} clearable />
        <StateExample {...stateProps} title={english ? "Complete" : "已填写"} state="complete" defaultValue={value} />
        <StateExample {...stateProps} title={english ? "Disabled filled" : "禁用 · 已填写"} state="disabled-filled" defaultValue={value} />
        <StateExample {...stateProps} title={english ? "Disabled empty" : "禁用 · 空值"} state="disabled-empty" />
        <StateExample {...stateProps} title={english ? "Read-only" : "只读"} readOnly defaultValue={value} />
        <StateExample {...stateProps} title={english ? "Error" : "错误"} label={english ? "Email" : "邮箱"} type="email" defaultValue="bob@"
          error={english ? "Enter a valid email address." : "请输入有效的邮箱地址。"} />
      </div>

      {density === "compact" && <div style={groupStyle}>
        <p style={labelStyle}>{english ? "Search with leading icon" : "带图标的搜索框"}</p>
        <Input density={density} aria-label={english ? "Product search" : "商品搜索"}
          placeholder={english ? "Search YAMI products" : "搜索 YAMI 商品"} leadingIcon={<SearchIcon />} fullWidth />
      </div>}

      <div data-input-boundaries style={groupStyle}>
        <p style={labelStyle}>{english ? "Validation edges" : "边界情况"}</p>
        <div style={rowStyle}>
          <Input density={density} label={english ? "Clearable input" : "可清空输入"} state="typing" defaultValue="SAVE10" clearable />
          <Input density={density} label={english ? "Disabled with error" : "禁用与错误组合"} defaultValue="BAD" disabled error={promoError} />
        </div>
        <div style={rowStyle}>
          <Input density={density} label={english ? "Long helper text" : "长辅助说明"} helperText={english ? `Help page: ${message}` : `帮助页面：${message}`} />
          <Input density={density} label={english ? "Long error text" : "长错误提示"} error={english ? `Unsupported URL: ${message}` : `不支持此网址：${message}`} />
        </div>
      </div>
    </section>
  );
}
