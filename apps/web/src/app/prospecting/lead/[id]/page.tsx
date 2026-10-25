import LeadDetailClient from "./lead-detail-client";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default function Page() {
  return <LeadDetailClient />;
}
