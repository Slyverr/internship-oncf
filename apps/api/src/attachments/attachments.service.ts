import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { StorageService } from "@/storage/storage.service";
import type { UploadedFile } from "@/storage/storage.types";
import { AttachmentsQuery } from "./attachments.query";
import type { Attachment, AttachmentId } from "./attachments.types";

@Injectable()
export class AttachmentsService {
	constructor(
		private readonly attachmentsQuery: AttachmentsQuery,
		private readonly storageService: StorageService,
	) {}

	async upsert(file: UploadedFile): Promise<Attachment> {
		const stored = await this.storageService.upload(file);
		const values = {
			hash: stored.hash,
			path: stored.path,
			fileSize: file.size,
			mimeType: file.mimetype,
		};

		const created = await this.attachmentsQuery.createIfAbsent(values);
		if (created) {
			return created;
		}

		const existing = await this.attachmentsQuery.findByHash(stored.hash);
		if (!existing) {
			throw new InternalServerErrorException("Failed to persist attachment");
		}

		return existing;
	}

	async findById(id: AttachmentId): Promise<Attachment> {
		const attachment = await this.attachmentsQuery.findById(id);
		if (!attachment) {
			throw new NotFoundException(`Attachment ${id} not found`);
		}
		return attachment;
	}

	async download(id: AttachmentId): Promise<Buffer> {
		const attachment = await this.findById(id);
		return this.storageService.download(attachment.path);
	}

	async presign(id: AttachmentId, expirySeconds?: number): Promise<string> {
		const attachment = await this.findById(id);
		return this.storageService.presign(attachment.path, expirySeconds);
	}
}
