import { claimComments, claims } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { ClaimsService } from "./claims.service";

export type Claim = InferSelectModel<typeof claims>;
export type ClaimInsert = InferInsertModel<typeof claims>;
export type ClaimUpdate = Partial<ClaimInsert>;

export type ClaimId = Claim["id"];

export type ClaimList = Awaited<ReturnType<ClaimsService["findAll"]>>[number];
export type ClaimDetail = NonNullable<
	Awaited<ReturnType<ClaimsService["findOne"]>>
>;
export type ClaimDelete = NonNullable<
	Awaited<ReturnType<ClaimsService["remove"]>>
>;

export type ClaimComment = InferSelectModel<typeof claimComments>;
