// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Worker Startup Script
// ═══════════════════════════════════════════════════════════

import { createDiscoveryWorker } from './workers/discovery.worker';
import { createEnrichmentWorker } from './workers/enrichment.worker';

async function main() {
  console.log('🚀 Starting VERTEX Prospect Workers...\n');

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const discoveryWorker = createDiscoveryWorker(redisUrl);
  console.log('  ✅ Discovery Worker started');

  const enrichmentWorker = createEnrichmentWorker(redisUrl);
  console.log('  ✅ Enrichment Worker started');

  console.log('\n📡 Workers are listening for jobs...\n');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down workers...');
    await discoveryWorker.close();
    await enrichmentWorker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('❌ Worker startup failed:', err);
  process.exit(1);
});
