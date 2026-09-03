// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Discovery Worker
// ═══════════════════════════════════════════════════════════
// Processes Google Places results → creates Lead records
// in PostgreSQL → enqueues enrichment for leads with websites.

import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@vertex/database';
import { QUEUE_NAMES, type DiscoveryJobData } from '../types/job-data.types';
import { addEnrichmentJob } from '../queues/enrichment.queue';

/**
 * Creates and starts the Discovery Worker.
 * Processes batches of Google Places results into Lead records.
 */
export function createDiscoveryWorker(redisUrl?: string): Worker<DiscoveryJobData> {
  const connection = new IORedis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  const concurrency = parseInt(process.env.DISCOVERY_QUEUE_CONCURRENCY || '5', 10);

  const worker = new Worker<DiscoveryJobData>(
    QUEUE_NAMES.DISCOVERY,
    async (job: Job<DiscoveryJobData>) => {
      const { campaignId, organizationId, places } = job.data;

      console.log(
        `[DiscoveryWorker] Processing ${places.length} places for campaign ${campaignId}`,
      );

      let processedCount = 0;
      let enrichmentCount = 0;

      for (const place of places) {
        try {
          // Upsert the lead (skip if google_place_id already exists)
          const lead = await prisma.lead.upsert({
            where: { googlePlaceId: place.placeId },
            update: {
              // Update if the place already exists from another campaign
              businessName: place.displayName,
              formattedAddress: place.formattedAddress,
              internationalPhone: place.internationalPhoneNumber || place.nationalPhoneNumber,
              websiteUrl: place.websiteUri,
              googleRating: place.rating,
              googleUserRatingsTotal: place.userRatingCount,
              googleMapsUrl: place.googleMapsUri,
              businessTypes: place.types || [],
            },
            create: {
              campaignId,
              organizationId,
              googlePlaceId: place.placeId,
              businessName: place.displayName,
              formattedAddress: place.formattedAddress,
              internationalPhone: place.internationalPhoneNumber || place.nationalPhoneNumber,
              websiteUrl: place.websiteUri,
              googleRating: place.rating,
              googleUserRatingsTotal: place.userRatingCount,
              googleMapsUrl: place.googleMapsUri,
              businessTypes: place.types || [],
              hasWebsite: !!place.websiteUri,
              // If no website, give a base reduced score
              digitalScore: place.websiteUri ? 0 : 0,
              opportunityScore: place.websiteUri ? 100 : 100,
              opportunityTier: 'VERY_HIGH',
              status: 'DISCOVERED',
            },
          });

          processedCount++;

          // If the lead has a website, enqueue for enrichment
          if (place.websiteUri) {
            await addEnrichmentJob({
              leadId: lead.id,
              websiteUrl: place.websiteUri,
              businessName: place.displayName,
            });
            enrichmentCount++;
          } else {
            // No website → calculate basic score from Google data only
            let basicScore = 0;
            if (place.rating && place.rating > 4.0) basicScore += 10;
            if (place.userRatingCount && place.userRatingCount > 20) basicScore += 15;
            if (place.nationalPhoneNumber || place.internationalPhoneNumber) basicScore += 5;

            await prisma.lead.update({
              where: { id: lead.id },
              data: {
                digitalScore: basicScore,
                opportunityScore: 100 - basicScore,
                opportunityTier:
                  100 - basicScore >= 80
                    ? 'VERY_HIGH'
                    : 100 - basicScore >= 60
                      ? 'HIGH'
                      : 100 - basicScore >= 40
                        ? 'MEDIUM'
                        : 'LOW',
                status: 'QUALIFIED',
              },
            });
          }

          // Update job progress
          await job.updateProgress(
            Math.round((processedCount / places.length) * 100),
          );
        } catch (err) {
          console.error(
            `[DiscoveryWorker] Error processing place ${place.placeId}:`,
            err instanceof Error ? err.message : err,
          );
          // Continue processing remaining places
        }
      }

      // Update campaign total
      await prisma.searchCampaign.update({
        where: { id: campaignId },
        data: {
          totalFound: processedCount,
          status: 'COMPLETED',
        },
      });

      console.log(
        `[DiscoveryWorker] Done: ${processedCount} leads created, ${enrichmentCount} queued for enrichment`,
      );

      return { processedCount, enrichmentCount };
    },
    {
      connection,
      concurrency,
    },
  );

  worker.on('completed', (job) => {
    console.log(`[DiscoveryWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[DiscoveryWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
