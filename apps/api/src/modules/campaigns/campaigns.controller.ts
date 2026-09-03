import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

class CreateCampaignDto {
  @IsString()
  organizationId!: string;

  @IsString()
  queryTerm!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(1000)
  @Max(50000)
  @IsOptional()
  radiusMeters: number = 10000;
}

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new search campaign and launch discovery' })
  async create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns for an organization' })
  async findAll(@Query('organizationId') organizationId: string) {
    return this.campaignsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign statistics (lead distribution)' })
  async getStats(@Param('id') id: string) {
    return this.campaignsService.getStats(id);
  }
}
