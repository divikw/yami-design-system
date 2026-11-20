import campaignMeta, {
  Pc as CampaignPc,
  Mobile as CampaignMobile,
} from "../TopicLandingPage/TopicLandingPage.campaign.stories";

export default {
  ...campaignMeta,
  id: "yami-pages-landing-page-collection-page-campaign",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Campaign",
};

export const Pc = { ...CampaignPc, name: "Campaign — PC", play: CampaignPc.play };
export const Mobile = { ...CampaignMobile, name: "Campaign — Mobile", play: CampaignMobile.play };
