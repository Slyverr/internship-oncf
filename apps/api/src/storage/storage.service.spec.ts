import { Readable } from "node:stream";
import {
	CreateBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { StorageService } from "./storage.service";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
	getSignedUrl: jest.fn(),
}));

describe("StorageService", () => {
	let service: StorageService;
	let sendMock: jest.SpyInstance;

	const config: Record<string, unknown> = {
		OBJECT_STORAGE_BUCKET: "test-bucket",
		OBJECT_STORAGE_ENDPOINT: "http://localhost:8333",
		OBJECT_STORAGE_REGION: "us-east-1",
		OBJECT_STORAGE_ACCESS_KEY: "test-key",
		OBJECT_STORAGE_SECRET_KEY: "test-secret",
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		sendMock = jest
			.spyOn(S3Client.prototype, "send")
			.mockResolvedValue({} as never);

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

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("onModuleInit", () => {
		it("does not create the bucket when it already exists", async () => {
			await service.onModuleInit();

			expect(sendMock).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
			expect(sendMock).not.toHaveBeenCalledWith(
				expect.any(CreateBucketCommand),
			);
		});

		it("creates the bucket when it does not exist", async () => {
			sendMock.mockRejectedValueOnce({
				name: "NotFound",
				$metadata: { httpStatusCode: 404 },
			});

			await service.onModuleInit();

			expect(sendMock).toHaveBeenNthCalledWith(
				2,
				expect.any(CreateBucketCommand),
			);
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
			const command = sendMock.mock.calls[0][0] as PutObjectCommand;
			expect(command).toBeInstanceOf(PutObjectCommand);
			expect(command.input).toMatchObject({
				Bucket: "test-bucket",
				Key: result.path,
				Body: buffer,
				ContentLength: buffer.length,
				ContentType: "text/plain",
			});
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
			sendMock.mockResolvedValueOnce({
				Body: Readable.from([payload]),
			} as never);

			const result = await service.download("attachments/aa/bb/example");

			expect(result).toEqual(payload);
			const command = sendMock.mock.calls[0][0] as GetObjectCommand;
			expect(command).toBeInstanceOf(GetObjectCommand);
			expect(command.input).toEqual({
				Bucket: "test-bucket",
				Key: "attachments/aa/bb/example",
			});
		});
	});

	describe("presign", () => {
		it("returns a presigned download URL", async () => {
			jest.mocked(getSignedUrl).mockResolvedValue("https://example.test/file");

			const result = await service.presign("attachments/aa/bb/example", 1800);

			expect(result).toBe("https://example.test/file");
			expect(getSignedUrl).toHaveBeenCalledWith(
				expect.any(S3Client),
				expect.any(GetObjectCommand),
				{ expiresIn: 1800 },
			);
		});
	});

	describe("remove", () => {
		it("removes an object from storage", async () => {
			await service.remove("attachments/aa/bb/example");

			const command = sendMock.mock.calls[0][0] as DeleteObjectCommand;
			expect(command).toBeInstanceOf(DeleteObjectCommand);
			expect(command.input).toEqual({
				Bucket: "test-bucket",
				Key: "attachments/aa/bb/example",
			});
		});

		it("does not fail when the object is already missing", async () => {
			sendMock.mockRejectedValueOnce({
				name: "NotFound",
				$metadata: { httpStatusCode: 404 },
			});

			await expect(
				service.remove("attachments/aa/bb/missing"),
			).resolves.toBeUndefined();
		});
	});
});
