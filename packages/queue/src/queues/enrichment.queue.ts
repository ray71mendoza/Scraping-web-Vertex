// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Enrichment Queue
// ═══════════════════════════════════════════════════════════
// Manages the queue for web scraping and digital maturity
// enrichment of discovered leads.

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUE_NAMES, type EnrichmentJobData } from '../types/job-data.types';

let enrichmentQueue: Queue<EnrichmentJobData> | null = null;

/**
 * Gets or creates the Enrichment Queue instance.
 */
export function getEnrichmentQueue(redisUrl?: string): Queue<EnrichmentJobData> {
  if (enrichmentQueue) return enrichmentQueue;

  const connection = new IORedis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  enrichmentQueue = new Queue<EnrichmentJobData>(QUEUE_NAMES.ENRICHMENT, {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  });

  return enrichmentQueue;
}

/**
 * Adds an enrichment job to scrape and analyze a lead's website.
 */
export async function addEnrichmentJob(data: EnrichmentJobData): Promise<string> {
  const queue = getEnrichmentQueue();
  const job = await queue.add('enrich-lead', data, {
    jobId: `enrich-${data.leadId}-${Date.now()}`,
  });
  return job.id || '';
}
