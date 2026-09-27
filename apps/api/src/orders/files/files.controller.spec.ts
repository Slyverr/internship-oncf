jest.mock("@nestjs/platform-express", () => ({
	FileInterceptor: () => class MockFileInterceptor {},
}));

import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import type { OrderId } from "@/orders/orders.types";
import type { UploadedFile } from "@/storage/storage.types";
import { FilesController } from "./files.controller";
import type { FilesService } from "./files.service";

const permissionCases = [
	["uploadFile", Permission.ORDERS_UPDATE],
	["listFiles", Permission.ORDERS_READ],
	["downloadFile", Permission.ORDERS_READ],
	["deleteFile", Permission.ORDERS_UPDATE],
] as const;

describe("FilesController", () => {
	const service = {
		uploadFile: jest.fn(),
		listFiles: jest.fn(),
		downloadFile: jest.fn(),
		deleteFile: jest.fn(),
	};
	const controller = new FilesController(service as unknown as FilesService);

	beforeEach(() => {
		for (const method of Object.values(service)) method.mockReset();
	});

	it("applies order ownership protection to the entire route group", () => {
		expect(Reflect.getMetadata("__guards__", FilesController)).toContain(
			OrderOwnershipGuard,
		);
	});

	it.each(permissionCases)(
		"requires %s for the correct file action",
		(action, permission) => {
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					FilesController.prototype[action],
				),
			).toEqual([permission]);
		},
	);

	it("forwards upload data and the authenticated uploader", async () => {
		const orderId = 17 as OrderId;
		const file: UploadedFile = {
			originalName: "manifest.pdf",
			mimetype: "application/pdf",
			size: 64,
			buffer: Buffer.from("data"),
		};
		const dto = { description: "Signed copy" };
		const request = { user: { id: 9 } } as never;
		service.uploadFile.mockResolvedValue({ id: 31 });

		expect(await controller.uploadFile(orderId, file, dto, request)).toEqual({
			id: 31,
		});
		expect(service.uploadFile).toHaveBeenCalledWith(orderId, file, dto, 9);
	});

	it("sets safe content-disposition headers for hostile and non-ASCII filenames", async () => {
		const response = { setHeader: jest.fn(), send: jest.fn() };
		service.downloadFile.mockResolvedValue({
			buffer: Buffer.from("data"),
			fileName: 'résumé "final".pdf\r\nX-Evil: yes',
			mimeType: "application/pdf",
		});

		await controller.downloadFile(17 as OrderId, 31, response as never);

		expect(response.setHeader).toHaveBeenCalledWith(
			"Content-Type",
			"application/pdf",
		);
		const disposition = response.setHeader.mock.calls.find(
			([name]) => name === "Content-Disposition",
		)?.[1] as string;
		expect(disposition.includes("\r")).toBe(false);
		expect(disposition.includes("\n")).toBe(false);
		expect(disposition).toContain("filename*=UTF-8''");
		expect(disposition).toContain("X-Evil: yes");
		expect(response.send).toHaveBeenCalledWith(Buffer.from("data"));
	});
});
