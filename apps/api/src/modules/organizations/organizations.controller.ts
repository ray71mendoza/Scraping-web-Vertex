import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(@Param('id') id: string) {
    return this.orgsService.findById(id);
  }

  @Get(':id/quota')
  @ApiOperation({ summary: 'Get API quota usage for an organization' })
  async getQuota(@Param('id') id: string) {
    return this.orgsService.getQuotaUsage(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
  async update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.orgsService.update(id, body);
  }
}
