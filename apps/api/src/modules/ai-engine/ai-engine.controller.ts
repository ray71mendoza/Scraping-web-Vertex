import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiEngineService } from './ai-engine.service';

@ApiTags('AI Engine')
@Controller('ai')
export class AiEngineController {
  constructor(private readonly aiService: AiEngineService) {}

  @Post('generate-proposal/:leadId')
  @ApiOperation({ summary: 'Generate AI-powered commercial proposal for a lead' })
  async generateProposal(@Param('leadId') leadId: string) {
    return this.aiService.generateProposal(leadId);
  }
}
