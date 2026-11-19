import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "./Popover";
import { Button } from "../Button";
import { useDesktopViewport } from "../Drawer/useDesktopViewport";
import styles from "./examples.module.css";

export function BasicPopover() {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  return <Popover>
    <PopoverTrigger render={<Button size={actionSize} variant="secondary" />}>配送说明 · Delivery details</PopoverTrigger>
    <PopoverContent>
      <div className={styles.body}>
        <PopoverTitle>Delivery details</PopoverTitle>
        <PopoverDescription>Shipping options appear at checkout.</PopoverDescription>
      </div>
    </PopoverContent>
  </Popover>;
}
