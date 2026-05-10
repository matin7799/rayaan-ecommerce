// apps/backend/src/shared/storage/liara-storage.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';

export interface StorageUploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface StorageUploadResult {
  url: string;
  filename: string;
  key: string;
  size?: number;
  mimetype?: string;
}

@Injectable()
export class LiaraStorageService {
  private readonly logger = new Logger(LiaraStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.getOrThrow<string>('LIARA_BUCKET_NAME');
    this.endpoint = this.configService.getOrThrow<string>('LIARA_ENDPOINT');

    const accessKeyId =
      this.configService.getOrThrow<string>('LIARA_ACCESS_KEY');
    const secretAccessKey =
      this.configService.getOrThrow<string>('LIARA_SECRET_KEY');

    this.publicUrl =
      this.configService.get<string>('LIARA_PUBLIC_URL') ||
      `${this.normalizeBaseUrl(this.endpoint)}/${this.bucketName}`;

    this.s3Client = new S3Client({
      region: 'default',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload file object to Liara object storage
   */
  async uploadFile(
    file: StorageUploadFile,
    folder = 'uploads',
  ): Promise<StorageUploadResult> {
    this.validateFile(file);

    try {
      const ext = path.extname(file.originalname);
      const safeFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      const key = this.buildKey(folder, safeFilename);

      await this.putObject({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });

      const url = this.getPublicUrl(key);

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        url,
        filename: safeFilename,
        key,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading file to Liara: ${file.originalname}`,
        error,
      );
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload buffer to Liara object storage
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<StorageUploadResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Buffer is required');
    }

    if (!filename?.trim()) {
      throw new BadRequestException('Filename is required');
    }

    if (!mimeType?.trim()) {
      throw new BadRequestException('MIME type is required');
    }

    try {
      const key = this.buildKey(folder, filename);

      await this.putObject({
        key,
        body: buffer,
        contentType: mimeType,
      });

      const url = this.getPublicUrl(key);

      this.logger.log(`Buffer uploaded successfully: ${key}`);

      return {
        url,
        filename,
        key,
        size: buffer.length,
        mimetype: mimeType,
      };
    } catch (error) {
      this.logger.error(`Error uploading buffer to Liara: ${filename}`, error);
      throw new InternalServerErrorException('Failed to upload buffer');
    }
  }

  /**
   * Delete file from Liara object storage
   */
  async deleteFile(key: string): Promise<void> {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from Liara: ${key}`, error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Generate signed URL for private file access
   */
  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating signed URL for: ${key}`, error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  /**
   * Get public URL for a file key
   */
  getPublicUrl(key: string): string {
    return `${this.normalizeBaseUrl(this.publicUrl)}/${this.normalizeKey(key)}`;
  }

  /**
   * Extract object key from a public URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.replace(/^\/+/, '');

      if (pathname.startsWith(`${this.bucketName}/`)) {
        return pathname.slice(this.bucketName.length + 1);
      }

      const publicBasePath = new URL(this.publicUrl).pathname.replace(
        /^\/+/,
        '',
      );
      if (publicBasePath && pathname.startsWith(`${publicBasePath}/`)) {
        return pathname.slice(publicBasePath.length + 1);
      }

      return pathname || null;
    } catch (error) {
      this.logger.error(`Error extracting key from URL: ${url}`, error);
      return null;
    }
  }

  private async putObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    });

    await this.s3Client.send(command);
  }

  private validateFile(file: StorageUploadFile): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    if (!file.originalname?.trim()) {
      throw new BadRequestException('File originalname is required');
    }

    if (!file.mimetype?.trim()) {
      throw new BadRequestException('File mimetype is required');
    }
  }

  private buildKey(folder: string, filename: string): string {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const cleanFilename = filename.replace(/^\/+/, '');
    return cleanFolder ? `${cleanFolder}/${cleanFilename}` : cleanFilename;
  }

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  private normalizeKey(key: string): string {
    return key.replace(/^\/+/, '');
  }
}
