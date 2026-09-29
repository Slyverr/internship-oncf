import { claimComments, claims } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { ClaimsQuery } from "./claims.query";
import type { ClaimsService } from "./claims.service";

export type Claim = InferSelectModel<typeof claims>;
export type ClaimInsert = InferInsertModel<typeof claims>;
export type ClaimUpdate = Partial<ClaimInsert>;

export type ClaimId = Claim["id"];

type ClaimListRecord = Awaited<ReturnType<ClaimsQuery["findClaims"]>>[number];
type ClaimDetailRecord = NonNullable<
	Awaited<ReturnType<ClaimsQuery["findClaim"]>>
>;

type WithClaimNumber<T> = {
	[K in keyof T | "claimNumber"]: K extends "claimNumber"
		? string
		: K extends keyof T
			? T[K]
			: never;
};

export type ClaimList = WithClaimNumber<ClaimListRecord>;
export type ClaimDetail = WithClaimNumber<ClaimDetailRecord>;
export type ClaimDelete = NonNullable<
	Awaited<ReturnType<ClaimsService["remove"]>>
>;

export type ClaimComment = InferSelectModel<typeof claimComments>;
