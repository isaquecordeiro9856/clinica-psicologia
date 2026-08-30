import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service implements OnModuleInit {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  private region: string;

  onModuleInit() {
    this.endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';
    this.region = process.env.S3_REGION ?? 'sa-east-1';
    this.bucket = process.env.S3_BUCKET ?? 'clinica-documentos';

    this.client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | ReadableStream,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body as any,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async downloadFile(key: string): Promise<{ body: ReadableStream; contentType: string; contentLength: number }> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return {
      body: response.Body as ReadableStream,
      contentType: response.ContentType ?? 'application/octet-stream',
      contentLength: response.ContentLength ?? 0,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getFileMetadata(key: string): Promise<{ contentType: string; contentLength: number } | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return {
        contentType: response.ContentType ?? 'application/octet-stream',
        contentLength: response.ContentLength ?? 0,
      };
    } catch {
      return null;
    }
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  generateKey(patientId: string, fileName: string): string {
    const ext = fileName.split('.').pop() ?? '';
    const uniqueId = uuidv4();
    return `patients/${patientId}/${uniqueId}.${ext}`;
  }

  validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return allowedTypes.includes(mimeType);
  }

  validateFileSize(sizeBytes: number): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return sizeBytes <= maxSize;
  }
}