import { Injectable } from "@nestjs/common";
import { attachments } from "drizzle/schema";
import { DrizzleService } from "@/database/drizzle.service";
import type { QueryColumns } from "@/database/drizzle.types";
import type { AttachmentId, AttachmentInsert } from "./attachments.types";

type AttachmentsColumns = QueryColumns<"attachments">;

const attachmentColumns = {
	id: true,
	hash: true,
	path: true,
	fileSize: true,
	mimeType: true,
	createdAt: true,
} satisfies AttachmentsColumns;

@Injectable()
export class AttachmentsQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findByHash(hash: string) {
		return this.drizzle.db.query.attachments.findFirst({
			where: { hash },
			columns: attachmentColumns,
		});
	}

	async findById(id: AttachmentId) {
		return this.drizzle.db.query.attachments.findFirst({
			where: { id },
			columns: attachmentColumns,
		});
	}

	async createIfAbsent(values: AttachmentInsert) {
		const [record] = await this.drizzle.db
			.insert(attachments)
			.values(values)
			.onConflictDoNothing({ target: attachments.hash })
			.returning();

		return record;
	}
}
