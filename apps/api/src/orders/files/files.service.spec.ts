import { API_ERROR_CODES } from "@ecommand/shared";
import type { OrderId } from "@/orders/orders.types";
import type { UploadedFile } from "@/storage/storage.types";
import { FilesQuery } from "./files.query";
import { FilesService } from "./files.service";

const orderId = 17 as OrderId;
const fileId = 31;
const file: UploadedFile = {
	originalName: "manifest.pdf",
	mimetype: "application/pdf",
	size: 128,
	buffer: Buffer.from("pdf contents"),
};
const attachment = {
	id: 5,
	fileSize: file.size,
	mimeType: file.mimetype,
};
const link = {
	id: fileId,
	orderId,
	attachmentId: attachment.id,
	fileName: file.originalName,
	description: "Signed manifest",
	uploadedByUserId: 9,
	uploadedAt: "2025-03-01T00:00:00.000Z",
	deletedAt: null,
};

describe("FilesService", () => {
	const query = {
		createFile: jest.fn(),
		findFiles: jest.fn(),
		findFileForDownload: jest.fn(),
		findFileForDelete: jest.fn(),
		softDelete: jest.fn(),
	} as unknown as jest.Mocked<FilesQuery>;
	const attachments = {
		upsert: jest.fn(),
		download: jest.fn(),
	};
	const service = new FilesService(query, attachments as never);

	beforeEach(() => {
		for (const method of [
			"createFile",
			"findFiles",
			"findFileForDownload",
			"findFileForDelete",
			"softDelete",
		])
			query[method].mockReset();
		attachments.upsert.mockReset();
		attachments.download.mockReset();
	});

	it("links uploaded content to its order and returns the combined file view", async () => {
		attachments.upsert.mockResolvedValue(attachment);
		query.createFile.mockResolvedValue(link);

		expect(
			await service.uploadFile(
				orderId,
				file,
				{ description: link.description },
				9,
			),
		).toEqual({
			id: link.id,
			orderId: link.orderId,
			fileName: link.fileName,
			description: link.description,
			fileSize: attachment.fileSize,
			mimeType: attachment.mimeType,
			uploadedByUserId: link.uploadedByUserId,
			uploadedAt: link.uploadedAt,
		});
		expect(query.createFile).toHaveBeenCalledWith({
			orderId,
			attachmentId: attachment.id,
			fileName: file.originalName,
			description: link.description,
			uploadedByUserId: 9,
		});
	});

	it("uses a null description when upload metadata omits it", async () => {
		attachments.upsert.mockResolvedValue(attachment);
		query.createFile.mockResolvedValue({ ...link, description: null } as never);
		await service.uploadFile(orderId, file, {}, 9);
		expect(query.createFile).toHaveBeenCalledWith(
			expect.objectContaining({ description: null }),
		);
	});

	it("lists files for the requested order", async () => {
		query.findFiles.mockResolvedValue([link] as never);
		expect(await service.listFiles(orderId)).toEqual([link]);
		expect(query.findFiles).toHaveBeenCalledWith(orderId);
	});

	it("downloads a linked attachment with its filename and MIME type", async () => {
		query.findFileForDownload.mockResolvedValue({
			id: fileId,
			attachmentId: attachment.id,
			fileName: link.fileName,
			mimeType: attachment.mimeType,
		});
		const buffer = Buffer.from("download");
		attachments.download.mockResolvedValue(buffer);
		expect(await service.downloadFile(orderId, fileId)).toEqual({
			buffer,
			fileName: link.fileName,
			mimeType: attachment.mimeType,
		});
		expect(query.findFileForDownload).toHaveBeenCalledWith(orderId, fileId);
		expect(attachments.download).toHaveBeenCalledWith(attachment.id);
	});

	it("does not download a file linked to another order or already deleted", async () => {
		query.findFileForDownload.mockResolvedValue(undefined as never);
		await expect(service.downloadFile(orderId, fileId)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_FILE_NOT_FOUND },
		});
		expect(attachments.download).not.toHaveBeenCalled();
	});

	it("soft-deletes an existing order-file link", async () => {
		query.findFileForDelete.mockResolvedValue({ id: fileId } as never);
		await expect(service.deleteFile(orderId, fileId)).resolves.toBeUndefined();
		expect(query.softDelete).toHaveBeenCalledWith(orderId, fileId);
	});

	it("does not delete a file linked to another order or already deleted", async () => {
		query.findFileForDelete.mockResolvedValue(undefined as never);
		await expect(service.deleteFile(orderId, fileId)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_FILE_NOT_FOUND },
		});
		expect(query.softDelete).not.toHaveBeenCalled();
	});
});
