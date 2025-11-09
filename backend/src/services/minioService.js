const Minio = require('minio');
const { config } = require('../config/env');
const { logger } = require('../middleware/logger');
const crypto = require('crypto');

class MinioService {
  constructor() {
    if (!config.minio.accessKey || !config.minio.secretKey) {
      logger.warn('⚠️  MinIO credentials not configured. Image upload will be disabled.');
      this.client = null;
      return;
    }

    try {
      this.client = new Minio.Client({
        endPoint: config.minio.endpoint,
        port: config.minio.port,
        useSSL: config.minio.useSSL,
        accessKey: config.minio.accessKey,
        secretKey: config.minio.secretKey
      });

      this.bucketName = config.minio.bucketName;

      this.ensureBucket().catch(err => {
        logger.error('Failed to ensure MinIO bucket exists:', err);
      });

      logger.info('✅ MinIO client initialized');
    } catch (error) {
      logger.error('Failed to initialize MinIO client:', error);
      this.client = null;
    }
  }

  async ensureBucket() {
    if (!this.client) return;

    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        logger.info(`✅ Created MinIO bucket: ${this.bucketName}`);
      }

    } catch (error) {
      logger.error('Failed to ensure bucket:', error);
      throw error;
    }
  }

  generateFileName(originalName, prefix = 'images') {
    const ext = originalName.split('.').pop();
    const randomName = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${prefix}/${timestamp}-${randomName}.${ext}`;
  }

  async uploadFile(fileBuffer, fileName, contentType) {
    if (!this.client) {
      throw new Error('MinIO client is not initialized');
    }

    try {
      await this.ensureBucket();

      const objectName = this.generateFileName(fileName);
      
      const metadata = {
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000'
      };

      await this.client.putObject(
        this.bucketName,
        objectName,
        fileBuffer,
        fileBuffer.length,
        metadata
      );

      const proxyUrl = `/api/images/${objectName}`;

      logger.info(`✅ File uploaded to MinIO: ${objectName}`);

      return {
        objectName,
        proxyUrl,
        bucketName: this.bucketName
      };
    } catch (error) {
      logger.error('Failed to upload file to MinIO:', error);
      throw error;
    }
  }

  async deleteFile(objectName) {
    if (!this.client) {
      throw new Error('MinIO client is not initialized');
    }

    try {
      const deletedObjectName = `del/${objectName.replace(/^del\//, '')}`;
      
      const fileBuffer = await this.getFile(objectName);
      
      const contentType = objectName.endsWith('.png') ? 'image/png' :
                          objectName.endsWith('.gif') ? 'image/gif' :
                          objectName.endsWith('.webp') ? 'image/webp' :
                          'image/jpeg';
      
      const metadata = {
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000'
      };

      await this.client.putObject(
        this.bucketName,
        deletedObjectName,
        fileBuffer,
        fileBuffer.length,
        metadata
      );
      
      await this.client.removeObject(this.bucketName, objectName);
      
      logger.info(`✅ File moved to deleted folder: ${objectName} -> ${deletedObjectName}`);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        logger.warn(`File not found in MinIO, may already be deleted: ${objectName}`);
        return true;
      }
      logger.error('Failed to move file to deleted folder:', error);
      logger.error('Error details:', { 
        code: error.code, 
        message: error.message,
        objectName,
        deletedObjectName: `del/${objectName.replace(/^del\//, '')}`
      });
      throw error;
    }
  }

  async getPresignedUrl(objectName, expiry = 7 * 24 * 60 * 60) {
    if (!this.client) {
      throw new Error('MinIO client is not initialized');
    }

    try {
      const url = await this.client.presignedGetObject(
        this.bucketName,
        objectName,
        expiry
      );
      return url;
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error);
      throw error;
    }
  }

  async getFile(objectName) {
    if (!this.client) {
      throw new Error('MinIO client is not initialized');
    }

    try {
      const dataStream = await this.client.getObject(this.bucketName, objectName);
      const chunks = [];
      
      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        dataStream.on('error', (error) => {
          logger.error('Failed to get file from MinIO:', error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error('Failed to get file from MinIO:', error);
      throw error;
    }
  }

  extractObjectNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      const bucketIndex = pathParts.findIndex(part => part === this.bucketName);
      
      if (bucketIndex >= 0 && bucketIndex < pathParts.length - 1) {
        const objectName = pathParts.slice(bucketIndex + 1).join('/');
        return objectName || null;
      }
      
      const pathMatch = urlObj.pathname.match(new RegExp(`^/${this.bucketName}/(.+)$`));
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to extract object name from URL:', error);
      return null;
    }
  }

  isInitialized() {
    return this.client !== null;
  }
}

const minioService = new MinioService();

module.exports = minioService;

