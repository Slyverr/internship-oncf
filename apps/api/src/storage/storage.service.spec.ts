import { Readable } from "node:stream";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { StorageService } from "./storage.service";

const minioClientMock = {
	bucketExists: jest.fn(),
	makeBucket: jest.fn(),
	putObject: jest.fn(),
	getObject: jest.fn(),
	presignedGetObject: jest.fn(),
	removeObject: jest.fn(),
};

jest.mock("minio", () => ({
	Client: jest.fn(() => minioClientMock),
}));

describe("StorageService", () => {
	let service: StorageService;

	const config: Record<string, unknown> = {
		MINIO_BUCKET: "test-bucket",
		MINIO_ENDPOINT: "localhost",
		MINIO_PORT: 9000,
		MINIO_ACCESS_KEY: "test-key",
		MINIO_SECRET_KEY: "test-secret",
		MINIO_USE_SSL: false,
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		minioClientMock.bucketExists.mockResolvedValue(true);
		minioClientMock.makeBucket.mockResolvedValue(undefined);
		minioClientMock.putObject.mockResolvedValue(undefined);
		minioClientMock.removeObject.mockResolvedValue(undefined);

		const module = await Test.createTestingModule({
			providers: [
				StorageService,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => config[key]),
						getOrThrow: jest.fn((key: string) => {
							const value = config[key];

							if (value === undefined) {
								throw new Error(`Missing configuration: ${key}`);
							}

							return value;
						}),
					},
				},
			],
		}).compile();

		service = module.get(StorageService);
	});

	describe("onModuleInit", () => {
		it("does not create the bucket when it already exists", async () => {
			minioClientMock.bucketExists.mockResolvedValue(true);

			await service.onModuleInit();

			expect(minioClientMock.bucketExists).toHaveBeenCalledWith("test-bucket");
			expect(minioClientMock.makeBucket).not.toHaveBeenCalled();
		});

		it("creates the bucket when it does not exist", async () => {
			minioClientMock.bucketExists.mockResolvedValue(false);

			await service.onModuleInit();

			expect(minioClientMock.makeBucket).toHaveBeenCalledWith("test-bucket");
		});
	});

	describe("upload", () => {
		it("stores a file using its SHA-256 hash", async () => {
			const buffer = Buffer.from("hello");

			const result = await service.upload({
				originalName: "hello.txt",
				mimetype: "text/plain",
				size: buffer.length,
				buffer,
			});

			expect(result.hash).toHaveLength(64);

			expect(result.path).toBe(
				`attachments/${result.hash.slice(0, 2)}/${result.hash.slice(
					2,
					4,
				)}/${result.hash}`,
			);

			expect(minioClientMock.putObject).toHaveBeenCalledWith(
				"test-bucket",
				result.path,
				buffer,
				buffer.length,
				{
					"Content-Type": "text/plain",
				},
			);
		});

		it("produces the same path for identical content", async () => {
			const buffer = Buffer.from("same-content");

			const first = await service.upload({
				originalName: "first.txt",
				mimetype: "text/plain",
				size: buffer.length,
				buffer,
			});

			const second = await service.upload({
				originalName: "completely-different-name.pdf",
				mimetype: "application/pdf",
				size: buffer.length,
				buffer,
			});

			expect(first.hash).toBe(second.hash);
			expect(first.path).toBe(second.path);
		});
	});

	describe("download", () => {
		it("returns the stored object as a Buffer", async () => {
			const payload = Buffer.from("file-content");

			minioClientMock.getObject.mockResolvedValue(Readable.from([payload]));

			const result = await service.download("attachments/aa/bb/example");

			expect(result).toEqual(payload);

			expect(minioClientMock.getObject).toHaveBeenCalledWith(
				"test-bucket",
				"attachments/aa/bb/example",
			);
		});
	});

	describe("presign", () => {
		it("returns a presigned download URL", async () => {
			minioClientMock.presignedGetObject.mockResolvedValue(
				"https://example.test/file",
			);

			const result = await service.presign("attachments/aa/bb/example", 1800);

			expect(result).toBe("https://example.test/file");

			expect(minioClientMock.presignedGetObject).toHaveBeenCalledWith(
				"test-bucket",
				"attachments/aa/bb/example",
				1800,
			);
		});
	});

	describe("remove", () => {
		it("removes an object from storage", async () => {
			await service.remove("attachments/aa/bb/example");

			expect(minioClientMock.removeObject).toHaveBeenCalledWith(
				"test-bucket",
				"attachments/aa/bb/example",
			);
		});

		it("does not fail when the object is already missing", async () => {
			minioClientMock.removeObject.mockRejectedValue({
				code: "NoSuchKey",
			});

			await expect(
				service.remove("attachments/aa/bb/missing"),
			).resolves.toBeUndefined();
		});
	});
});
