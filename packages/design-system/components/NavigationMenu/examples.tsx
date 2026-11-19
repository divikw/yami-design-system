import {
  NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger,
} from "@yami/design-system";

export function ShopNavigation({ en = false }: { en?: boolean }) {
  const home = `https://www.yami.com/us/${en ? "en" : "zh"}`;
  const beauty = `${home}/c/beauty/2`;
  const masks = `${home}/c/masks/59`;
  return <NavigationMenu aria-label={en ? "Shop navigation" : "商城导航"}>
    <NavigationMenuList>
      <NavigationMenuItem value="departments">
        <NavigationMenuTrigger>{en ? "Departments" : "商品分类"}</NavigationMenuTrigger>
        <NavigationMenuIndicator />
        <NavigationMenuContent>
          <NavigationMenuLink href={beauty}>{en ? "Beauty & skincare" : "美妆护肤"}</NavigationMenuLink>
          <NavigationMenuLink href={masks}>{en ? "Sheet masks" : "面膜"}</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="featured">
        <NavigationMenuTrigger>{en ? "Featured" : "精选"}</NavigationMenuTrigger>
        <NavigationMenuIndicator />
        <NavigationMenuContent>
          <NavigationMenuLink href={masks}>
            <span>
              {en ? "Mask collection" : "面膜专区"}
              <small style={{ display: "block", color: "var(--text-secondary)", fontSize: "var(--font-size-caption-sm)", lineHeight: "var(--line-height-caption-sm)", fontWeight: "var(--font-weight-normal)" }}>
                {en ? "Browse sheet masks for your daily routine" : "选购适合日常护肤的面膜"}
              </small>
            </span>
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem><NavigationMenuLink href={home}>{en ? "Home" : "首页"}</NavigationMenuLink></NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>;
}
