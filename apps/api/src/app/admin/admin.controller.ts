import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { RejectDto } from './dto/reject.dto';
import { AccountStatus } from '../auth/auth.types';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/registrations')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Kayıtları listele (status ile filtrelenebilir)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  list(@Query('status') status?: AccountStatus) {
    return this.admin.listRegistrations(status);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Kaydı onayla' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { adminUser: { id: string } },
  ) {
    return this.admin.approve(id, req.adminUser.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Kaydı reddet (sebep ile)' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectDto,
    @Req() req: { adminUser: { id: string } },
  ) {
    return this.admin.reject(id, req.adminUser.id, dto.reason);
  }
}
