// apps/backend/src/domains/media/media.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { RegisterMediaByUrlDto } from './dto/register-media-by-url.dto';
import { Media, MediaUsage, MediaType } from './entities/media.entity';

import { Role } from '../auth/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const mediaFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new Error('Unsupported file type.'), false);
    return;
  }
  callback(null, true);
};

@Controller('media')
@UseGuards(ThrottlerGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
      fileFilter: mediaFileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.mediaService.uploadFile(file, dto.usage, dto.entityId, dto.alt);
  }

  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 10 },
      fileFilter: mediaFileFilter,
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }

    return this.mediaService.uploadMultiple(files, dto.usage, dto.entityId);
  }

  @Post('register-by-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async registerByUrl(@Body() dto: RegisterMediaByUrlDto): Promise<Media> {
    if (!dto.usage) {
      throw new BadRequestException('Media usage is required.');
    }

    return this.mediaService.registerByUrl(dto);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reorder(
    @Body('mediaIds') mediaIds: string[],
  ): Promise<{ message: string }> {
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      throw new BadRequestException('mediaIds must be a non-empty array.');
    }

    await this.mediaService.reorderMedia(mediaIds);

    return {
      message: 'Media reordered successfully',
    };
  }

  @Get()
  async findAll(
    @Query('usage') usage?: MediaUsage,
    @Query('entityId') entityId?: string,
    @Query('type') type?: MediaType,
  ): Promise<Media[]> {
    return this.mediaService.findAll({ usage, entityId, type });
  }

  @Get('entity/:usage/:entityId')
  async findByEntity(
    @Param('usage') usage: MediaUsage,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<Media[]> {
    return this.mediaService.findByEntity(usage, entityId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Media> {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMediaDto,
  ): Promise<Media> {
    return this.mediaService.updateMedia(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.mediaService.delete(id);

    return {
      message: 'Media deleted successfully',
    };
  }
}
