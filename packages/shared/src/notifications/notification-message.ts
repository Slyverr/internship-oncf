import {
	ClaimStatus,
	NotificationMessageCode,
	OrderStatus,
	ProgramStatus,
} from "../enums";

type NotificationMessageBase<
	Code extends NotificationMessageCode,
	Parameters extends Record<string, string>,
> = {
	code: Code;
	parameters: Parameters;
};

export type NotificationMessage =
	| NotificationMessageBase<
			NotificationMessageCode.ORDER_STATUS_CHANGED,
			{ recordCode: string; status: OrderStatus }
	  >
	| NotificationMessageBase<
			NotificationMessageCode.PROGRAM_STATUS_CHANGED,
			{ recordCode: string; status: ProgramStatus }
	  >
	| NotificationMessageBase<
			NotificationMessageCode.CLAIM_STATUS_CHANGED,
			{ recordCode: string; status: ClaimStatus }
	  >
	| NotificationMessageBase<
			NotificationMessageCode.CLAIM_COMMENT_ADDED,
			{ recordCode: string }
	  >
	| NotificationMessageBase<
			NotificationMessageCode.DTM_RESPONSE,
			{ recordCode: string; status: "ACCEPTED" | "REJECTED" }
	  >
	| NotificationMessageBase<
			NotificationMessageCode.LEGACY_UPDATE,
			Record<string, string>
	  >;
