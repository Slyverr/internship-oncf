jest.mock("@nestjs/platform-express", () => ({
	FileInterceptor: () => class MockFileInterceptor {},
}));

import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import type { OrdersService } from "@/orders/orders.service";
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
	const ordersService = { resolveOrderId: jest.fn().mockResolvedValue(17) };
	const controller = new FilesController(
		service as unknown as FilesService,
		ordersService as unknown as OrdersService,
	);

	beforeEach(() => {
		for (const method of Object.values(service)) method.mockReset();
		ordersService.resolveOrderId.mockReset().mockResolvedValue(17);
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
		const orderNumber = "ORD-ABCDEFGHIJ";
		const file: UploadedFile = {
			originalName: "manifest.pdf",
			mimetype: "application/pdf",
			size: 64,
			buffer: Buffer.from("data"),
		};
		const dto = { description: "Signed copy" };
		const request = { user: { id: 9 } } as never;
		service.uploadFile.mockResolvedValue({ id: 31 });

		expect(
			await controller.uploadFile(orderNumber, file, dto, request),
		).toEqual({
			id: 31,
		});
		expect(ordersService.resolveOrderId).toHaveBeenCalledWith(orderNumber);
		expect(service.uploadFile).toHaveBeenCalledWith(17, file, dto, 9);
	});

	it("sets safe content-disposition headers for hostile and non-ASCII filenames", async () => {
		const response = { setHeader: jest.fn(), send: jest.fn() };
		service.downloadFile.mockResolvedValue({
			buffer: Buffer.from("data"),
			fileName: 'résumé "final".pdf\r\nX-Evil: yes',
			mimeType: "application/pdf",
		});

		await controller.downloadFile("ORD-ABCDEFGHIJ", 31, response as never);

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
