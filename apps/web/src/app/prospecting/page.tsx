"use client";

import React, { Suspense } from "react";
import CampaignLeadsClient from "./[campaignId]/campaign-leads-client";

export default function ProspectingIndexPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Cargando prospectos...</div>}>
      <CampaignLeadsClient />
    </Suspense>
  );
}
