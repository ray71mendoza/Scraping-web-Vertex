// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — App Module (Root)
// ═══════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { LeadsModule } from './modules/leads/leads.module';
import { GooglePlacesModule } from './modules/google-places/google-places.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
import { OutreachModule } from './modules/outreach/outreach.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    AuthModule,
    OrganizationsModule,
    CampaignsModule,
    LeadsModule,
    GooglePlacesModule,
    ScoringModule,
    AiEngineModule,
    OutreachModule,
  ],
})
export class AppModule {}
