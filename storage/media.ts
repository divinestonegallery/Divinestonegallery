import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type PutOptions = {
  httpMetadata?: { contentType?: string; cacheControl?: string };
  customMetadata?: Record<string, string>;
};

type StoredObject = {
  body: ReadableStream<Uint8Array>;
  httpEtag?: string;
  writeHttpMetadata(headers: Headers): void;
};

type GlobalStorageCache = {
  divineStoneS3?: S3Client;
};

const globalStorageCache = globalThis as typeof globalThis & GlobalStorageCache;

function storageConfiguration() {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim();
  if (!bucket || !region) {
    throw new Error("Object storage is unavailable. Configure S3_BUCKET and S3_REGION.");
  }
  return { bucket, region };
}

function client() {
  if (globalStorageCache.divineStoneS3) return globalStorageCache.divineStoneS3;
  const { region } = storageConfiguration();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  globalStorageCache.divineStoneS3 = new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
  return globalStorageCache.divineStoneS3;
}

export function getMediaBucket() {
  const { bucket } = storageConfiguration();
  const s3 = client();

  return {
    async put(key: string, bytes: ArrayBuffer, options: PutOptions = {}) {
      const configuredEncryption = process.env.S3_SERVER_SIDE_ENCRYPTION?.trim();
      const serverSideEncryption = configuredEncryption === "AES256" || configuredEncryption === "aws:kms"
        ? configuredEncryption
        : undefined;
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new Uint8Array(bytes),
        ContentType: options.httpMetadata?.contentType,
        CacheControl: options.httpMetadata?.cacheControl,
        Metadata: options.customMetadata,
        ServerSideEncryption: serverSideEncryption,
      }));
    },

    async delete(key: string) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },

    async get(key: string): Promise<StoredObject | null> {
      try {
        const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!object.Body) return null;
        const body = object.Body.transformToWebStream();
        return {
          body,
          httpEtag: object.ETag,
          writeHttpMetadata(headers) {
            if (object.ContentType) headers.set("content-type", object.ContentType);
            if (object.CacheControl) headers.set("cache-control", object.CacheControl);
            if (object.ContentLength != null) headers.set("content-length", String(object.ContentLength));
          },
        };
      } catch (error) {
        const code = error && typeof error === "object" && "name" in error ? String(error.name) : "";
        if (code === "NoSuchKey" || code === "NotFound") return null;
        throw error;
      }
    },
  };
}
