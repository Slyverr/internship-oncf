import { Module } from "@nestjs/common";
import { StorageModule } from "@/storage/storage.module";
import { AttachmentsQuery } from "./attachments.query";
import { AttachmentsService } from "./attachments.service";

@Module({
	imports: [StorageModule],
	providers: [AttachmentsQuery, AttachmentsService],
	exports: [AttachmentsService],
})
export class AttachmentsModule {}
