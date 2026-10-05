import { createHash } from "node:crypto";
import type { Readable } from "node:stream";
import {
	CreateBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { API_ERROR_CODES } from "@ecommand/shared";
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { StoredFile, UploadedFile } from "./storage.types";

@Injectable()
export class StorageService implements OnModuleInit {
	private readonly logger = new Logger(StorageService.name);
	private readonly client: S3Client;
	private readonly bucket: string;

	constructor(private readonly configService: ConfigService) {
		this.bucket = this.configService.getOrThrow<string>(
			"OBJECT_STORAGE_BUCKET",
		);

		this.client = new S3Client({
			endpoint: this.configService.getOrThrow<string>(
				"OBJECT_STORAGE_ENDPOINT",
			),
			region: this.configService.getOrThrow<string>("OBJECT_STORAGE_REGION"),
			forcePathStyle: true,
			credentials: {
				accessKeyId: this.configService.getOrThrow<string>(
					"OBJECT_STORAGE_ACCESS_KEY",
				),
				secretAccessKey: this.configService.getOrThrow<string>(
					"OBJECT_STORAGE_SECRET_KEY",
				),
			},
		});
	}

	async onModuleInit(): Promise<void> {
		await this.ensureBucket();
	}

	async upload(file: UploadedFile): Promise<StoredFile> {
		const hash = createHash("sha256").update(file.buffer).digest("hex");
		const path = `attachments/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`;

		try {
			await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucket,
					Key: path,
					Body: file.buffer,
					ContentLength: file.size,
					ContentType: file.mimetype,
				}),
			);
		} catch (error) {
			this.logger.error(`Upload failed for ${file.originalName}`, error);
			throw new InternalServerErrorException({
				code: API_ERROR_CODES.INTERNAL_ERROR,
			});
		}

		return { hash, path };
	}

	async download(path: string): Promise<Buffer> {
		try {
			const response = await this.client.send(
				new GetObjectCommand({ Bucket: this.bucket, Key: path }),
			);
			if (!response.Body) {
				throw new Error("Object storage returned an empty response body");
			}
			const stream = response.Body as Readable;
			return await this.streamToBuffer(stream);
		} catch (error) {
			if (this.isNotFound(error)) {
				throw new NotFoundException({
					code: API_ERROR_CODES.RESOURCE_NOT_FOUND,
				});
			}
			this.logger.error(`Download failed for ${path}`, error);
			throw new InternalServerErrorException({
				code: API_ERROR_CODES.INTERNAL_ERROR,
			});
		}
	}

	async presign(path: string, expirySeconds = 3600): Promise<string> {
		try {
			return await getSignedUrl(
				this.client,
				new GetObjectCommand({ Bucket: this.bucket, Key: path }),
				{ expiresIn: expirySeconds },
			);
		} catch (error) {
			if (this.isNotFound(error)) {
				throw new NotFoundException({
					code: API_ERROR_CODES.RESOURCE_NOT_FOUND,
				});
			}
			this.logger.error(`Presign failed for ${path}`, error);
			throw new InternalServerErrorException({
				code: API_ERROR_CODES.INTERNAL_ERROR,
			});
		}
	}

	async remove(path: string): Promise<void> {
		try {
			await this.client.send(
				new DeleteObjectCommand({ Bucket: this.bucket, Key: path }),
			);
		} catch (error) {
			if (this.isNotFound(error)) return;
			this.logger.error(`Delete failed for ${path}`, error);
			throw new InternalServerErrorException({
				code: API_ERROR_CODES.INTERNAL_ERROR,
			});
		}
	}

	private async ensureBucket(): Promise<void> {
		try {
			await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
			return;
		} catch (error) {
			if (!this.isNotFound(error)) {
				this.logger.error("Bucket initialization failed", error);
				throw new InternalServerErrorException({
					code: API_ERROR_CODES.INTERNAL_ERROR,
				});
			}
		}

		try {
			await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
			this.logger.log(`Bucket "${this.bucket}" created`);
		} catch (error) {
			this.logger.error("Bucket initialization failed", error);
			throw new InternalServerErrorException({
				code: API_ERROR_CODES.INTERNAL_ERROR,
			});
		}
	}

	private streamToBuffer(stream: Readable): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on("data", (chunk: Buffer) => chunks.push(chunk));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
			stream.on("error", reject);
		});
	}

	private isNotFound(error: unknown): boolean {
		if (typeof error !== "object" || error === null) return false;
		const details = error as {
			name?: unknown;
			code?: unknown;
			$metadata?: { httpStatusCode?: unknown };
		};
		return (
			details.name === "NoSuchKey" ||
			details.name === "NoSuchBucket" ||
			details.name === "NotFound" ||
			details.code === "NoSuchKey" ||
			details.code === "NoSuchBucket" ||
			details.code === "NotFound" ||
			details.$metadata?.httpStatusCode === 404
		);
	}
}
