import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from "./Popover";
import { Button } from "../Button";
import styles from "./examples.module.css";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;

export const BasicPopover = () => <Popover>
  <PopoverTrigger render={<Button variant="secondary" />}>配送说明 · Delivery details</PopoverTrigger>
  <PopoverContent>
    <div className={styles.body}>
      <header className={styles.header}>
        <PopoverTitle>Delivery details</PopoverTitle>
        <PopoverClose render={<Button variant="tertiary" form="icon" className={styles.close} aria-label="Close" />}>
          <span className={styles.closeIcon} style={{ maskImage: `url("${closeIcon}")` }} aria-hidden="true" />
        </PopoverClose>
      </header>
      <PopoverDescription>Shipping options appear at checkout.</PopoverDescription>
    </div>
  </PopoverContent>
</Popover>;
