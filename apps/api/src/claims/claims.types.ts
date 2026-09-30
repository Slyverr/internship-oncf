import { claimComments, claims } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { ClaimsQuery } from "./claims.query";
import type { ClaimsService } from "./claims.service";

export type Claim = InferSelectModel<typeof claims>;
export type ClaimInsert = InferInsertModel<typeof claims>;
export type ClaimUpdate = Partial<ClaimInsert>;

export type ClaimId = Claim["id"];
export type ClaimNumber = Claim["claimNumber"];
export type ClaimIdentifier = ClaimId | ClaimNumber;

type ClaimListRecord = Awaited<ReturnType<ClaimsQuery["findClaims"]>>[number];
type ClaimDetailRecord = NonNullable<
	Awaited<ReturnType<ClaimsQuery["findClaim"]>>
>;

export type ClaimList = ClaimListRecord;
export type ClaimDetail = ClaimDetailRecord;
export type ClaimDelete = NonNullable<
	Awaited<ReturnType<ClaimsService["remove"]>>
>;

export type ClaimComment = InferSelectModel<typeof claimComments>;
