import topicMeta, {
  Pc as TopicPc,
  Mobile as TopicMobile,
} from "../TopicLandingPage/TopicLandingPage.topic.stories";

export default {
  ...topicMeta,
  id: "yami-pages-landing-page-collection-page-topic",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Topic",
};

export const Pc = { ...TopicPc, name: "Topic — PC", play: TopicPc.play };
export const Mobile = { ...TopicMobile, name: "Topic — Mobile", play: TopicMobile.play };
