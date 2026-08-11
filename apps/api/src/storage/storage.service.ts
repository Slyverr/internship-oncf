import fs from "node:fs";
import path from "node:path";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { MulterFile } from "./storage.types";

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);
	private readonly storagePath: string;
	private minioClient: Client | null = null;
	private readonly bucket: string;
	private useMinio: boolean;

	constructor(private readonly configService: ConfigService) {
		this.storagePath = this.configService.get("STORAGE_PATH") ?? "./uploads";
		this.bucket = this.configService.get("MINIO_BUCKET") ?? "ecommande";
		this.useMinio = !!this.configService.get("MINIO_ENDPOINT");

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
				port: this.configService.get("MINIO_PORT") ?? 9000,
				accessKey: this.configService.getOrThrow("MINIO_ACCESS_KEY"),
				secretKey: this.configService.getOrThrow("MINIO_SECRET_KEY"),
				useSSL,
			});
			this.ensureBucket();
		} catch (error) {
			this.logger.warn(
				`MinIO init failed: ${error.message}, falling back to local`,
			);
			this.useMinio = false;
			this.minioClient = null;
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
			this.logger.warn(
				`Failed to create bucket: ${error.message}, falling back to local`,
			);
			this.useMinio = false;
			this.minioClient = null;
		}
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
				this.logger.warn(
					`MinIO upload failed: ${error.message}, falling back to local`,
				);
				this.useMinio = false;
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		const dir = path.dirname(fullPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
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
				return new Promise((resolve, reject) => {
					stream.on("data", (chunk) => chunks.push(chunk));
					stream.on("end", () => resolve(Buffer.concat(chunks)));
					stream.on("error", reject);
				});
			} catch (error) {
				this.logger.warn(
					`MinIO download failed: ${error.message}, falling back to local`,
				);
				this.useMinio = false;
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		if (!fs.existsSync(fullPath)) {
			throw new NotFoundException(`File not found: ${filePath}`);
		}
		return fs.readFileSync(fullPath);
	}

	async deleteFile(filePath: string) {
		if (this.useMinio && this.minioClient) {
			try {
				await this.minioClient.removeObject(this.bucket, filePath);
				this.logger.debug(`Deleted from MinIO: ${filePath}`);
				return;
			} catch (error) {
				this.logger.warn(
					`MinIO delete failed: ${error.message}, falling back to local`,
				);
				this.useMinio = false;
			}
		}

		const fullPath = path.join(this.storagePath, filePath);
		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
			this.logger.debug(`Deleted from local: ${fullPath}`);
		}
	}
}
