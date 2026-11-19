import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "./Popover";
import { Button } from "../Button";
import styles from "./examples.module.css";

export const BasicPopover = () => <Popover>
  <PopoverTrigger render={<Button variant="secondary" />}>配送说明 · Delivery details</PopoverTrigger>
  <PopoverContent>
    <div className={styles.body}>
      <PopoverTitle>Delivery details</PopoverTitle>
      <PopoverDescription>Shipping options appear at checkout.</PopoverDescription>
    </div>
  </PopoverContent>
</Popover>;
