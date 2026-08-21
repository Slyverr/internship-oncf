import fs from "node:fs";
import path from "node:path";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import type { MulterFile } from "./storage.types";

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);
	private readonly storagePath: string;
	private readonly bucket: string;
	private minioClient: Client | null = null;
	private useMinio: boolean;

	constructor(private readonly configService: ConfigService) {
		this.storagePath = this.configService.get("STORAGE_PATH") ?? "./uploads";
		this.bucket = this.configService.get("MINIO_BUCKET") ?? "ecommand";
		this.useMinio = Boolean(this.configService.get("MINIO_ENDPOINT"));

		if (this.useMinio) {
			this.initMinio();
		} else {
			this.logger.warn("MinIO not configured, using local storage");
		}

		this.ensureStoragePath();
	}

	private initMinio() {
		try {
			const useSSL = this.configService.get("MINIO_USE_SSL") === "true";

			this.minioClient = new Client({
				endPoint: this.configService.getOrThrow("MINIO_ENDPOINT"),
				port: this.configService.get<number>("MINIO_PORT") ?? 9000,

				accessKey: this.configService.getOrThrow("MINIO_ACCESS_KEY"),
				secretKey: this.configService.getOrThrow("MINIO_SECRET_KEY"),
				useSSL,
			});

			void this.ensureBucket();
		} catch (error) {
			this.disableMinio(`MinIO init failed: ${this.getErrorMessage(error)}`);
		}
	}

	private async ensureBucket() {
		if (!this.minioClient) return;

		try {
			const exists = await this.minioClient.bucketExists(this.bucket);

			if (!exists) {
				await this.minioClient.makeBucket(this.bucket);
				this.logger.log(`Bucket ${this.bucket} created`);
			}
		} catch (error) {
			this.disableMinio(
				`Failed to initialize MinIO bucket: ${this.getErrorMessage(error)}`,
			);
		}
	}

	private disableMinio(message: string) {
		this.logger.warn(message);
		this.useMinio = false;
		this.minioClient = null;
	}

	private ensureStoragePath() {
		if (!fs.existsSync(this.storagePath)) {
			fs.mkdirSync(this.storagePath, { recursive: true });
		}
	}

	async uploadFile(
		filePath: string,
		file: MulterFile,
	): Promise<{ filePath: string }> {
		if (this.useMinio && this.minioClient) {
			try {
				await this.minioClient.putObject(
					this.bucket,
					filePath,
					file.buffer,
					file.size,
					{
						"Content-Type": file.mimetype,
					},
				);

				this.logger.debug(`Uploaded to MinIO: ${filePath}`);

				return { filePath };
			} catch (error) {
				this.disableMinio(
					`MinIO upload failed: ${this.getErrorMessage(error)}, falling back to local`,
				);
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		const directory = path.dirname(fullPath);

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}

		fs.writeFileSync(fullPath, file.buffer);
		this.logger.debug(`Uploaded to local: ${fullPath}`);

		return { filePath };
	}

	async downloadFile(filePath: string): Promise<Buffer> {
		if (this.useMinio && this.minioClient) {
			try {
				const stream = await this.minioClient.getObject(this.bucket, filePath);

				const chunks: Buffer[] = [];

				return await new Promise<Buffer>((resolve, reject) => {
					stream.on("data", (chunk: Buffer) => chunks.push(chunk));
					stream.on("end", () => resolve(Buffer.concat(chunks)));
					stream.on("error", reject);
				});
			} catch (error) {
				this.disableMinio(
					`MinIO download failed: ${this.getErrorMessage(error)}, falling back to local`,
				);
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		if (!fs.existsSync(fullPath)) {
			throw new NotFoundException(`File not found: ${filePath}`);
		}

		return fs.readFileSync(fullPath);
	}

	async deleteFile(filePath: string): Promise<void> {
		if (this.useMinio && this.minioClient) {
			try {
				await this.minioClient.removeObject(this.bucket, filePath);
				this.logger.debug(`Deleted from MinIO: ${filePath}`);

				return;
			} catch (error) {
				this.disableMinio(
					`MinIO delete failed: ${this.getErrorMessage(error)}, falling back to local`,
				);
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
			this.logger.debug(`Deleted from local: ${fullPath}`);
		}
	}

	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
