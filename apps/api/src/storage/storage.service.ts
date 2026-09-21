import { createHash } from "node:crypto";
import type { Readable } from "node:stream";
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import type { StoredFile, UploadedFile } from "./storage.types";

@Injectable()
export class StorageService implements OnModuleInit {
	private readonly logger = new Logger(StorageService.name);
	private readonly client: Client;
	private readonly bucket: string;

	constructor(private readonly configService: ConfigService) {
		this.bucket = this.configService.getOrThrow<string>("MINIO_BUCKET");

		const port = Number(this.configService.getOrThrow("MINIO_PORT"));
		const useSSL =
			String(
				this.configService.get("MINIO_USE_SSL") ?? "false",
			).toLowerCase() === "true";

		this.client = new Client({
			endPoint: this.configService.getOrThrow<string>("MINIO_ENDPOINT"),
			port,
			accessKey: this.configService.getOrThrow<string>("MINIO_ACCESS_KEY"),
			secretKey: this.configService.getOrThrow<string>("MINIO_SECRET_KEY"),
			useSSL,
		});
	}

	async onModuleInit(): Promise<void> {
		await this.ensureBucket();
	}

	async upload(file: UploadedFile): Promise<StoredFile> {
		const hash = createHash("sha256").update(file.buffer).digest("hex");
		const path = `attachments/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`;

		try {
			await this.client.putObject(this.bucket, path, file.buffer, file.size, {
				"Content-Type": file.mimetype,
			});
		} catch (error) {
			this.logger.error(`Upload failed for ${file.originalName}`, error);
			throw new InternalServerErrorException("Failed to store file");
		}

		return { hash, path };
	}

	async download(path: string): Promise<Buffer> {
		try {
			const stream = await this.client.getObject(this.bucket, path);
			return await this.streamToBuffer(stream);
		} catch (error) {
			if (this.isNotFound(error)) {
				throw new NotFoundException(`File not found: ${path}`);
			}
			this.logger.error(`Download failed for ${path}`, error);
			throw new InternalServerErrorException("Failed to retrieve file");
		}
	}

	async presign(path: string, expirySeconds = 3600): Promise<string> {
		try {
			return await this.client.presignedGetObject(
				this.bucket,
				path,
				expirySeconds,
			);
		} catch (error) {
			if (this.isNotFound(error)) {
				throw new NotFoundException(`File not found: ${path}`);
			}
			this.logger.error(`Presign failed for ${path}`, error);
			throw new InternalServerErrorException(
				"Failed to generate download link",
			);
		}
	}

	async remove(path: string): Promise<void> {
		try {
			await this.client.removeObject(this.bucket, path);
		} catch (error) {
			if (this.isNotFound(error)) return;
			this.logger.error(`Delete failed for ${path}`, error);
			throw new InternalServerErrorException("Failed to delete file");
		}
	}

	private async ensureBucket(): Promise<void> {
		try {
			const exists = await this.client.bucketExists(this.bucket);
			if (exists) return;
			await this.client.makeBucket(this.bucket);
			this.logger.log(`Bucket "${this.bucket}" created`);
		} catch (error) {
			this.logger.error("Bucket initialization failed", error);
			throw new InternalServerErrorException("Storage initialization failed");
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
		const code = (error as { code?: unknown }).code;
		return code === "NoSuchKey" || code === "NotFound";
	}
}
