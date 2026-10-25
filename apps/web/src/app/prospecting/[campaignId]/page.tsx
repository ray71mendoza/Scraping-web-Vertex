import CampaignLeadsClient from "./campaign-leads-client";

export function generateStaticParams() {
  return [{ campaignId: "default" }];
}

export default function Page() {
  return <CampaignLeadsClient />;
}
