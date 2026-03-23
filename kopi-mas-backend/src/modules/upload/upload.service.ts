import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly baseUrl: string;
  private bucketInitialized = false;

  constructor(private configService: ConfigService) {
    const minioConfig = this.configService.get('minio');
    this.bucketName = minioConfig?.bucket || 'kopi-mas';
    this.baseUrl = minioConfig?.url || 'http://localhost:9000';

    this.minioClient = new Minio.Client({
      endPoint: minioConfig?.endpoint || 'localhost',
      port: minioConfig?.port || 9000,
      useSSL: false,
      accessKey: minioConfig?.accessKey || 'minioadmin',
      secretKey: minioConfig?.secretKey || 'minioadmin',
    });
  }

  async onModuleInit() {
    await this.initBucket();
  }

  private async initBucket() {
    if (this.bucketInitialized) return;
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket ${this.bucketName} created`);
      }
      
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`]
          }
        ]
      });
      
      await this.minioClient.setBucketPolicy(this.bucketName, policy);
      console.log(`Bucket policy set for ${this.bucketName}`);
      
      this.bucketInitialized = true;
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    await this.initBucket();
    
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${originalName}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );

    const url = `${this.baseUrl}/${this.bucketName}/${fileName}`;
    return { url, key: fileName };
  }

  async deleteFile(key: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, key);
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${this.bucketName}/${key}`;
  }
}
