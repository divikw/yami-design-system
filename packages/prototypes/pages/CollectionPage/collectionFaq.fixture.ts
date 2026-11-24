import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";

type LocalizedText = Record<TopicLandingPageLocale, string>;

interface Entry {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export type CollectionFaqEntries = [Entry, Entry, Entry, Entry, Entry];

export function createCollectionFaq(entries: CollectionFaqEntries) {
  function localize(locale: TopicLandingPageLocale) {
    return {
      title: locale === "zh" ? "常见问题" : "Frequently Asked Questions",
      items: entries.map(({ id, question, answer }) => ({ id, question: question[locale], answer: answer[locale] })),
    };
  }
  return { zh: localize("zh"), en: localize("en") };
}
