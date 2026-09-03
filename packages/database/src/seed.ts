// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Database Seed Script
// ═══════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VERTEX Prospect database...');

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'VERTEX Demo Agency',
      apiQuotaLimit: 5000,
      apiQuotaUsed: 0,
    },
  });

  console.log(`  ✅ Organization: ${org.name}`);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'admin@vertex.com' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'admin@vertex.com',
      name: 'Admin VERTEX',
      passwordHash: '$2b$10$placeholder_hash_replace_in_production',
      role: 'admin',
    },
  });

  console.log(`  ✅ User: ${user.email}`);

  // Create demo campaign
  const campaign = await prisma.searchCampaign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      organizationId: org.id,
      queryTerm: 'Veterinarias',
      location: 'Bogotá, Colombia',
      radiusMeters: 15000,
      totalFound: 3,
      status: 'COMPLETED',
    },
  });

  console.log(`  ✅ Campaign: ${campaign.queryTerm} in ${campaign.location}`);

  // Create demo leads
  const leads = [
    {
      id: '00000000-0000-0000-0000-000000000100',
      campaignId: campaign.id,
      organizationId: org.id,
      googlePlaceId: 'ChIJdemo_lead_001',
      businessName: 'Clínica Veterinaria Happy Pets',
      formattedAddress: 'Cra 15 #85-10, Bogotá, Colombia',
      internationalPhone: '+5713001234567',
      websiteUrl: null,
      googleRating: 4.2,
      googleUserRatingsTotal: 45,
      hasWebsite: false,
      digitalScore: 25,
      opportunityScore: 75,
      opportunityTier: 'VERY_HIGH' as const,
      status: 'DISCOVERED' as const,
    },
    {
      id: '00000000-0000-0000-0000-000000000101',
      campaignId: campaign.id,
      organizationId: org.id,
      googlePlaceId: 'ChIJdemo_lead_002',
      businessName: 'Veterinaria El Refugio Animal',
      formattedAddress: 'Cl 100 #20-30, Bogotá, Colombia',
      internationalPhone: '+5713009876543',
      websiteUrl: 'https://refugioanimal.wixsite.com/vet',
      googleRating: 3.8,
      googleUserRatingsTotal: 12,
      hasWebsite: true,
      hasValidSsl: true,
      hasCustomDomain: false,
      digitalScore: 35,
      opportunityScore: 65,
      opportunityTier: 'HIGH' as const,
      status: 'QUALIFIED' as const,
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      campaignId: campaign.id,
      organizationId: org.id,
      googlePlaceId: 'ChIJdemo_lead_003',
      businessName: 'Centro Veterinario Dr. Martínez',
      formattedAddress: 'Av 68 #45-12, Bogotá, Colombia',
      internationalPhone: '+5713005551234',
      websiteUrl: 'https://www.drmartinezvet.com',
      googleRating: 4.7,
      googleUserRatingsTotal: 128,
      hasWebsite: true,
      hasValidSsl: true,
      hasCustomDomain: true,
      hasFacebook: true,
      hasInstagram: true,
      hasWhatsapp: true,
      isResponsive: true,
      hasMetaOg: true,
      digitalScore: 85,
      opportunityScore: 15,
      opportunityTier: 'LOW' as const,
      status: 'PROPOSAL_GENERATED' as const,
      aiDiagnosis: {
        digitalGapAnalysis: 'El negocio tiene una presencia digital sólida con web propia, redes activas y buena reputación. La oportunidad se centra en automatización y optimización avanzada.',
        highImpactServices: ['Sistema de Agendamiento Online', 'Chatbot con IA para WhatsApp'],
        outreachEmail: {
          subject: 'Dr. Martínez: optimice la gestión de citas de su veterinaria',
          body: 'Estimado Dr. Martínez...',
        },
        whatsappHook: '¡Hola Dr. Martínez! 👋 Soy de VERTEX. Vimos su excelente veterinaria en Google Maps...',
      },
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { googlePlaceId: lead.googlePlaceId },
      update: {},
      create: lead,
    });
    console.log(`  ✅ Lead: ${lead.businessName} (Score: ${lead.opportunityScore})`);
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
