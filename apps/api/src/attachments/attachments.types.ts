import { attachments } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Attachment = InferSelectModel<typeof attachments>;
export type AttachmentInsert = InferInsertModel<typeof attachments>;
export type AttachmentId = Attachment["id"];
