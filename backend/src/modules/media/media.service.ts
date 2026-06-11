import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, createHmac, randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateExerciseGifUploadDto } from "./media.dto";

type PresignedUpload = {
  mediaId: string;
  uploadUrl: string;
  expiresInSeconds: number;
  maxSizeBytes: number;
};

const DEFAULT_EXPIRES_IN_SECONDS = 15 * 60;
const DEFAULT_MAX_SIZE_BYTES = 25 * 1024 * 1024;

function getConfigNumber(value: string | number | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function encodeRfc3986(input: string) {
  return encodeURIComponent(input).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodePath(pathname: string) {
  return pathname
    .split("/")
    .map((part) => encodeRfc3986(part))
    .join("/");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function formatAmzDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatDateStamp(date: Date) {
  return formatAmzDate(date).slice(0, 8);
}

function buildSignatureKey(secretKey: string, dateStamp: string, region: string, service = "s3") {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function buildCanonicalQuery(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => [encodeRfc3986(key), encodeRfc3986(value)] as const)
    .sort(([keyA, valueA], [keyB, valueB]) => {
      if (keyA === keyB) {
        return valueA.localeCompare(valueB);
      }
      return keyA.localeCompare(keyB);
    })
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function buildPresignedUrl(options: {
  method: "GET" | "PUT" | "DELETE";
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  key: string;
  expiresInSeconds: number;
}) {
  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = formatDateStamp(now);
  const credentialScope = `${dateStamp}/${options.region}/s3/aws4_request`;
  const endpointUrl = new URL(options.endpoint);
  const canonicalUri = `/${encodePath(options.bucket)}/${encodePath(options.key)}`;
  const canonicalQuery = buildCanonicalQuery({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${options.accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(options.expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalRequest = [
    options.method,
    canonicalUri,
    canonicalQuery,
    `host:${endpointUrl.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(buildSignatureKey(options.secretKey, dateStamp, options.region), stringToSign).toString("hex");

  return {
    uploadUrl: `${endpointUrl.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    objectUrl: `${endpointUrl.origin}${canonicalUri}`,
  };
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createExerciseGifUpload(dto: CreateExerciseGifUploadDto): Promise<PresignedUpload> {
    const contentType = dto.contentType.trim().toLowerCase();
    if (contentType !== "image/gif") {
      throw new BadRequestException("Only GIF uploads are supported.");
    }

    const maxSizeBytes = getConfigNumber(this.config.get<string>("MAX_EXERCISE_GIF_BYTES"), DEFAULT_MAX_SIZE_BYTES);
    if (dto.sizeBytes > maxSizeBytes) {
      throw new BadRequestException(`GIF is too large. Maximum size is ${maxSizeBytes} bytes.`);
    }

    const endpoint = this.config.get<string>("MINIO_ENDPOINT") ?? "http://localhost:9000";
    const accessKey = this.config.get<string>("MINIO_ACCESS_KEY") ?? "fitcoach";
    const secretKey = this.config.get<string>("MINIO_SECRET_KEY") ?? "fitcoach";
    const bucket = this.config.get<string>("MINIO_BUCKET") ?? "fitcoach-media";
    const region = this.config.get<string>("MINIO_REGION") ?? "us-east-1";
    const expiresInSeconds = getConfigNumber(this.config.get<string>("MINIO_PRESIGN_EXPIRES_SECONDS"), DEFAULT_EXPIRES_IN_SECONDS);
    console.log(accessKey)
    console.log(secretKey)
    console.log(bucket)
    console.log(region)
    console.log(expiresInSeconds)
    const key = `exercise-gifs/${randomUUID()}.gif`;
    const media = await this.prisma.media.create({
      data: {
        key,
        contentType: "image/gif",
        sizeBytes: dto.sizeBytes,
      },
    });

    const signed = buildPresignedUrl({
      method: "PUT",
      endpoint,
      accessKey,
      secretKey,
      bucket,
      region,
      key,
      expiresInSeconds,
    });

    return {
      mediaId: media.id,
      uploadUrl: signed.uploadUrl,
      expiresInSeconds,
      maxSizeBytes,
    };
  }

  async getMediaRedirect(mediaId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException("Media not found");
    }

    const endpoint = this.config.get<string>("MINIO_ENDPOINT") ?? "http://localhost:9000";
    const accessKey = this.config.get<string>("MINIO_ACCESS_KEY") ?? "fitcoach";
    const secretKey = this.config.get<string>("MINIO_SECRET_KEY") ?? "fitcoach";
    const bucket = this.config.get<string>("MINIO_BUCKET") ?? "fitcoach-media";
    const region = this.config.get<string>("MINIO_REGION") ?? "us-east-1";
    const expiresInSeconds = getConfigNumber(this.config.get<string>("MINIO_PRESIGN_EXPIRES_SECONDS"), DEFAULT_EXPIRES_IN_SECONDS);

    return buildPresignedUrl({
      method: "GET",
      endpoint,
      accessKey,
      secretKey,
      bucket,
      region,
      key: media.key,
      expiresInSeconds,
    }).uploadUrl;
  }

  async getMediaContent(mediaId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException("Media not found");
    }

    const endpoint = this.config.get<string>("MINIO_ENDPOINT") ?? "http://localhost:9000";
    const accessKey = this.config.get<string>("MINIO_ACCESS_KEY") ?? "fitcoach";
    const secretKey = this.config.get<string>("MINIO_SECRET_KEY") ?? "fitcoach";
    const bucket = this.config.get<string>("MINIO_BUCKET") ?? "fitcoach-media";
    const region = this.config.get<string>("MINIO_REGION") ?? "us-east-1";
    const expiresInSeconds = getConfigNumber(this.config.get<string>("MINIO_PRESIGN_EXPIRES_SECONDS"), DEFAULT_EXPIRES_IN_SECONDS);

    const signed = buildPresignedUrl({
      method: "GET",
      endpoint,
      accessKey,
      secretKey,
      bucket,
      region,
      key: media.key,
      expiresInSeconds,
    });

    const response = await fetch(signed.uploadUrl);
    if (!response.ok) {
      throw new BadRequestException("Failed to load uploaded media.");
    }

    return {
      contentType: media.contentType,
      buffer: Buffer.from(await response.arrayBuffer()),
    };
  }

  async deleteMedia(mediaId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return { deleted: true };
    }

    const endpoint = this.config.get<string>("MINIO_ENDPOINT") ?? "http://localhost:9000";
    const accessKey = this.config.get<string>("MINIO_ACCESS_KEY") ?? "fitcoach";
    const secretKey = this.config.get<string>("MINIO_SECRET_KEY") ?? "fitcoach";
    const bucket = this.config.get<string>("MINIO_BUCKET") ?? "fitcoach-media";
    const region = this.config.get<string>("MINIO_REGION") ?? "us-east-1";
    const expiresInSeconds = getConfigNumber(this.config.get<string>("MINIO_PRESIGN_EXPIRES_SECONDS"), DEFAULT_EXPIRES_IN_SECONDS);

    const signed = buildPresignedUrl({
      method: "DELETE",
      endpoint,
      accessKey,
      secretKey,
      bucket,
      region,
      key: media.key,
      expiresInSeconds,
    });

    const response = await fetch(signed.uploadUrl, { method: "DELETE" });
    if (!response.ok && response.status !== 404) {
      throw new BadRequestException("Failed to delete uploaded media.");
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
    return { deleted: true };
  }
}
