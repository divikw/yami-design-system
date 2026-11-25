import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";

type LocalizedText = Record<TopicLandingPageLocale, string>;

interface Entry {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export type CollectionFaqEntries = [Entry, Entry, Entry, Entry, Entry];

export function createCollectionFaq(subject: LocalizedText, entries: CollectionFaqEntries) {
  const chineseSubject = /^[A-Za-z0-9]/.test(subject.zh) ? ` ${subject.zh}` : subject.zh;

  function localize(locale: TopicLandingPageLocale) {
    return {
      title: locale === "zh" ? "常见问题" : "Frequently Asked Questions",
      description: locale === "zh"
        ? `关于在线选购${chineseSubject}，你想知道的，我们都为你解答。`
        : `We answer everything you want to know about shopping for ${subject.en} online.`,
      items: entries.map(({ id, question, answer }) => ({ id, question: question[locale], answer: answer[locale] })),
    };
  }
  return { zh: localize("zh"), en: localize("en") };
}
