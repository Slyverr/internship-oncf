import { attachments, orderFiles } from "drizzle/schema";
import { PgDialect } from "drizzle-orm/pg-core";
import type { OrderId } from "@/orders/orders.types";
import { FilesQuery } from "./files.query";

type SelectBuilder = {
	from: jest.Mock;
	innerJoin: jest.Mock;
	where: jest.Mock;
	orderBy: jest.Mock;
	limit: jest.Mock;
};

function createSelectBuilder(rows: unknown[]): SelectBuilder {
	const builder = {
		from: jest.fn(),
		innerJoin: jest.fn(),
		where: jest.fn(),
		orderBy: jest.fn(),
		limit: jest.fn(),
	} as SelectBuilder;
	builder.from.mockReturnValue(builder);
	builder.innerJoin.mockReturnValue(builder);
	builder.where.mockReturnValue(builder);
	builder.orderBy.mockResolvedValue(rows);
	builder.limit.mockResolvedValue(rows);
	return builder;
}

function getWhereQuery(builder: SelectBuilder) {
	const where = builder.where.mock.calls[0]?.[0];
	expect(where).toBeDefined();
	return new PgDialect().sqlToQuery(where);
}

describe("FilesQuery", () => {
	const orderId = 17 as OrderId;
	const file = {
		id: 31,
		orderId,
		attachmentId: 5,
		fileName: "manifest.pdf",
		description: "Signed manifest",
		fileSize: 128,
		mimeType: "application/pdf",
		uploadedByUserId: 9,
		uploadedAt: "2026-10-01T10:00:00.000Z",
	};

	it("creates an order-file link and returns the inserted record", async () => {
		const values = { ...file, orderId, deletedAt: null };
		const returning = jest.fn().mockResolvedValue([values]);
		const insertValues = jest.fn().mockReturnValue({ returning });
		const insert = jest.fn().mockReturnValue({ values: insertValues });
		const query = new FilesQuery({ db: { insert } } as never);

		await expect(query.createFile(values as never)).resolves.toEqual(values);
		expect(insert).toHaveBeenCalledWith(orderFiles);
		expect(insertValues).toHaveBeenCalledWith(values);
	});

	it("lists active file links for one order with attachment metadata", async () => {
		const builder = createSelectBuilder([file]);
		const select = jest.fn().mockReturnValue(builder);
		const query = new FilesQuery({ db: { select } } as never);

		await expect(query.findFiles(orderId)).resolves.toEqual([file]);
		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: orderFiles.orderId,
				fileSize: attachments.fileSize,
				mimeType: attachments.mimeType,
			}),
		);
		expect(builder.from).toHaveBeenCalledWith(orderFiles);
		expect(builder.innerJoin).toHaveBeenCalledWith(
			attachments,
			expect.any(Object),
		);
		const where = getWhereQuery(builder);
		expect(where.params).toEqual([orderId]);
		expect(where.sql).toContain('"order_files"."deleted_at" is null');
		expect(builder.orderBy).toHaveBeenCalledWith(expect.any(Object));
	});

	it("finds a downloadable file only from its active order link", async () => {
		const downloadable = {
			id: file.id,
			attachmentId: file.attachmentId,
			fileName: file.fileName,
			mimeType: file.mimeType,
		};
		const builder = createSelectBuilder([downloadable]);
		const select = jest.fn().mockReturnValue(builder);
		const query = new FilesQuery({ db: { select } } as never);

		await expect(query.findFileForDownload(orderId, file.id)).resolves.toEqual(
			downloadable,
		);
		expect(builder.innerJoin).toHaveBeenCalledWith(
			attachments,
			expect.any(Object),
		);
		const where = getWhereQuery(builder);
		expect(where.params).toEqual([file.id, orderId]);
		expect(where.sql).toContain('"order_files"."deleted_at" is null');
		expect(builder.limit).toHaveBeenCalledWith(1);
	});

	it("returns no download record when the file does not belong to the order", async () => {
		const builder = createSelectBuilder([]);
		const query = new FilesQuery({
			db: { select: jest.fn().mockReturnValue(builder) },
		} as never);

		await expect(
			query.findFileForDownload(orderId, file.id),
		).resolves.toBeUndefined();
	});

	it("finds a deletable order-file link without including deleted links", async () => {
		const builder = createSelectBuilder([{ id: file.id }]);
		const query = new FilesQuery({
			db: { select: jest.fn().mockReturnValue(builder) },
		} as never);

		await expect(query.findFileForDelete(orderId, file.id)).resolves.toEqual({
			id: file.id,
		});
		expect(builder.from).toHaveBeenCalledWith(orderFiles);
		const where = getWhereQuery(builder);
		expect(where.params).toEqual([file.id, orderId]);
		expect(where.sql).toContain('"order_files"."deleted_at" is null');
		expect(builder.limit).toHaveBeenCalledWith(1);
	});

	it("soft-deletes only the active link matching its order and file IDs", async () => {
		const where = jest.fn().mockResolvedValue(undefined);
		const set = jest.fn().mockReturnValue({ where });
		const update = jest.fn().mockReturnValue({ set });
		const query = new FilesQuery({ db: { update } } as never);

		await expect(query.softDelete(orderId, file.id)).resolves.toBeUndefined();
		expect(update).toHaveBeenCalledWith(orderFiles);
		expect(set).toHaveBeenCalledWith({ deletedAt: expect.any(Object) });
		expect(where).toHaveBeenCalled();
		const filter = new PgDialect().sqlToQuery(where.mock.calls[0][0]);
		expect(filter.params).toEqual([file.id, orderId]);
		expect(filter.sql).toContain('"order_files"."deleted_at" is null');
	});
});
