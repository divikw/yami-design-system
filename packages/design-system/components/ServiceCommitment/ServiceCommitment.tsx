import { Divider } from "../Divider";

import styles from "./ServiceCommitment.module.css";

const icons = {
  shipping: new URL("./assets/shipping.svg", import.meta.url).href,
  us: new URL("./assets/us.svg", import.meta.url).href,
  sameDay: new URL("./assets/same-day.svg", import.meta.url).href,
  authentic: new URL("./assets/authentic.svg", import.meta.url).href,
  returns: new URL("./assets/returns.svg", import.meta.url).href,
};

const titles = { zh: "服务承诺", en: "Service commitments" };

const commitments = [
  { icon: "shipping", zh: "满$49免运费", en: "Free shipping from the US over $49" },
  { icon: "us", zh: "从美国发货", en: "Ships from the United States" },
  { icon: "sameDay", zh: "当日送达*", en: "Same-day delivery*" },
  { icon: "authentic", zh: "正品保证", en: "100% authentic ( & trendy! )" },
  { icon: "returns", zh: "无忧退换", en: "Worry-Free Returns" },
] as const;

export interface ServiceCommitmentProps {
  /** Language for the built-in service commitments. Defaults to zh. */
  locale?: "zh" | "en";
  /** Optional class for page layout. */
  className?: string;
}

export function ServiceCommitment({ locale = "zh", className }: ServiceCommitmentProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} lang={locale} data-slot="service-commitment">
      <div className={styles.container} data-slot="service-commitment-container">
        <ul className={styles.list} data-slot="service-commitment-list" role="list" aria-label={titles[locale]}>
          {commitments.map((commitment, index) => (
            <li className={styles.item} key={commitment.icon}>
              {index > 0 && <Divider className={styles.separator} orientation="vertical" />}
              <span className={styles.benefit}>
                <img className={styles.icon} src={icons[commitment.icon]} alt="" />
                <span>{commitment[locale]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
