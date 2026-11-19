import { Tabs, TabsContent, TabsList, TabsTrigger } from "@yami/design-system";
const heart = <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M19.9582 5.07637C17.9068 2.99934 14.5849 2.99953 12.5337 5.07694C12.3928 5.21966 12.2006 5.29999 12 5.29999C11.7994 5.29999 11.6072 5.21966 11.4663 5.07694C10.4395 4.03704 9.0989 3.51999 7.75499 3.51999C6.41028 3.51999 5.06523 4.03757 4.04174 5.07637L4.0409 5.07722C1.98469 7.15755 1.98469 10.5324 4.0409 12.6128L12 20.6656L19.9582 12.6136C19.9583 12.6135 19.9584 12.6135 19.9585 12.6134C20.9844 11.572 21.5 10.2112 21.5 8.84499C21.5 7.47869 20.9843 6.11775 19.9582 5.07637ZM12 3.53645C14.6539 1.3619 18.5588 1.52409 21.0262 4.02304L21.0267 4.02361C22.3407 5.35722 23 7.10129 23 8.84499C23 10.5887 22.3407 12.3328 21.0267 13.6664L12.5334 22.2597C12.3925 22.4023 12.2004 22.4825 12 22.4825C11.7996 22.4825 11.6075 22.4023 11.4666 22.2597L2.97408 13.6672C2.97408 13.6672 2.97408 13.6672 2.97408 13.6672C0.340449 11.0027 0.340301 6.68788 2.97366 4.02318C4.29012 2.68726 6.02489 2.01999 7.75499 2.01999C9.26119 2.01999 10.7661 2.52565 12 3.53645Z" fill="currentColor"></path>
</svg>;
const cart = <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.4636 8H21.9509L20.5916 13.6748L19.1335 13.3252L20.0496 9.5H3.95093L6.20483 18.9248C6.24416 19.0884 6.33735 19.2346 6.46948 19.3389C6.60162 19.443 6.76508 19.4999 6.93335 19.5H13.9324V21H6.93237C6.42729 20.9996 5.93632 20.8295 5.53979 20.5166C5.14333 20.2038 4.86377 19.7664 4.74585 19.2754L2.04956 8H6.53687L9.03687 3H14.9636L17.4636 8ZM18.2498 16.75H20.9998V18.25H18.2498V21H16.7498V18.25H13.9998V16.75H16.7498V14H18.2498V16.75ZM8.21362 8H15.7869L14.0369 4.5H9.96362L8.21362 8Z" fill="currentColor"></path>
</svg>;

export function AccountTabs({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  return <Tabs defaultValue="saved">
    <TabsList variant="secondary" aria-label={zh ? "购物清单" : "Shopping lists"}>
      <TabsTrigger value="saved" leftIcon={heart}>{zh ? "收藏" : "Saved"}</TabsTrigger>
      <TabsTrigger value="cart" leftIcon={cart}>{zh ? "购物车" : "Cart"}</TabsTrigger>
    </TabsList>
    <div hidden>
      <TabsContent value="saved" />
      <TabsContent value="cart" />
    </div>
  </Tabs>;
}
