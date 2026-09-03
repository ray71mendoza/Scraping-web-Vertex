// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Discovery Queue
// ═══════════════════════════════════════════════════════════
// Manages the queue for processing Google Places API results
// into Lead records in the database.

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUE_NAMES, type DiscoveryJobData } from '../types/job-data.types';

let discoveryQueue: Queue<DiscoveryJobData> | null = null;

/**
 * Gets or creates the Discovery Queue instance.
 */
export function getDiscoveryQueue(redisUrl?: string): Queue<DiscoveryJobData> {
  if (discoveryQueue) return discoveryQueue;

  const connection = new IORedis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  discoveryQueue = new Queue<DiscoveryJobData>(QUEUE_NAMES.DISCOVERY, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  });

  return discoveryQueue;
}

/**
 * Adds a discovery job to process Google Places results.
 */
export async function addDiscoveryJob(data: DiscoveryJobData): Promise<string> {
  const queue = getDiscoveryQueue();
  const job = await queue.add('process-places', data, {
    jobId: `discovery-${data.campaignId}-${Date.now()}`,
  });
  return job.id || '';
}
