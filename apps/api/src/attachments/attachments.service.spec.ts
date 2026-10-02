import { API_ERROR_CODES } from "@ecommand/shared";
import type { UploadedFile } from "@/storage/storage.types";
import { AttachmentsQuery } from "./attachments.query";
import { AttachmentsService } from "./attachments.service";
import type { Attachment } from "./attachments.types";

const file: UploadedFile = {
	originalName: "manifest.pdf",
	mimetype: "application/pdf",
	size: 128,
	buffer: Buffer.from("pdf contents"),
};
const attachment = {
	id: 5,
	hash: "sha256-value",
	path: "sha256-value",
	fileSize: file.size,
	mimeType: file.mimetype,
	createdAt: "2025-03-01T00:00:00.000Z",
} as Attachment;

describe("AttachmentsService", () => {
	const query = {
		createIfAbsent: jest.fn(),
		findByHash: jest.fn(),
		findById: jest.fn(),
	} as unknown as jest.Mocked<AttachmentsQuery>;
	const storage = {
		upload: jest.fn(),
		download: jest.fn(),
		presign: jest.fn(),
	};
	const service = new AttachmentsService(query, storage as never);

	beforeEach(() => {
		query.createIfAbsent.mockReset();
		query.findByHash.mockReset();
		query.findById.mockReset();
		storage.upload.mockReset();
		storage.download.mockReset();
		storage.presign.mockReset();
	});

	it("stores new bytes and persists their content metadata", async () => {
		storage.upload.mockResolvedValue({
			hash: attachment.hash,
			path: attachment.path,
		});
		query.createIfAbsent.mockResolvedValue(attachment);

		expect(await service.upsert(file)).toBe(attachment);
		expect(storage.upload).toHaveBeenCalledWith(file);
		expect(query.createIfAbsent).toHaveBeenCalledWith({
			hash: attachment.hash,
			path: attachment.path,
			fileSize: file.size,
			mimeType: file.mimetype,
		});
		expect(query.findByHash).not.toHaveBeenCalled();
	});

	it("reuses an existing attachment when a duplicate hash conflicts", async () => {
		storage.upload.mockResolvedValue({
			hash: attachment.hash,
			path: attachment.path,
		});
		query.createIfAbsent.mockResolvedValue(undefined as never);
		query.findByHash.mockResolvedValue(attachment);

		expect(await service.upsert(file)).toBe(attachment);
		expect(query.findByHash).toHaveBeenCalledWith(attachment.hash);
	});

	it("fails when a duplicate conflict cannot be resolved to an attachment", async () => {
		storage.upload.mockResolvedValue({
			hash: attachment.hash,
			path: attachment.path,
		});
		query.createIfAbsent.mockResolvedValue(undefined as never);
		query.findByHash.mockResolvedValue(undefined);

		await expect(service.upsert(file)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.INTERNAL_ERROR },
		});
	});

	it("returns an attachment by id", async () => {
		query.findById.mockResolvedValue(attachment);
		expect(await service.findById(attachment.id)).toBe(attachment);
		expect(query.findById).toHaveBeenCalledWith(attachment.id);
	});

	it("reports missing attachments", async () => {
		query.findById.mockResolvedValue(undefined);
		await expect(service.findById(999)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ATTACHMENT_NOT_FOUND },
		});
	});

	it("downloads stored bytes by the persisted path", async () => {
		const buffer = Buffer.from("download");
		query.findById.mockResolvedValue(attachment);
		storage.download.mockResolvedValue(buffer);
		expect(await service.download(attachment.id)).toBe(buffer);
		expect(storage.download).toHaveBeenCalledWith(attachment.path);
	});

	it("presigns downloads using the requested expiry", async () => {
		query.findById.mockResolvedValue(attachment);
		storage.presign.mockResolvedValue("https://storage.example.test/object");
		expect(await service.presign(attachment.id, 90)).toBe(
			"https://storage.example.test/object",
		);
		expect(storage.presign).toHaveBeenCalledWith(attachment.path, 90);
	});
});
