import { ClaimStatus, OrderStatus, ProgramStatus } from "@ecommand/shared";
import { CLAIM_TRANSITION } from "./claims/claims.constants";
import { ORDER_TRANSITION } from "./orders/orders.constants";
import { PROGRAM_TRANSITION } from "./programs/programs.constants";

describe("workflow transition matrix", () => {
	it("defines only valid order lifecycle transitions", () => {
		expect(ORDER_TRANSITION).toEqual({
			[OrderStatus.DRAFT]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],
			[OrderStatus.SUBMITTED]: [OrderStatus.APPROVED, OrderStatus.REJECTED],
			[OrderStatus.APPROVED]: [OrderStatus.SENT_TO_DTM],
			[OrderStatus.SENT_TO_DTM]: [OrderStatus.IN_PROGRESS],
			[OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
			[OrderStatus.PARTIALLY_EXECUTED]: [],
			[OrderStatus.COMPLETED]: [],
			[OrderStatus.CANCELLED]: [],
			[OrderStatus.REJECTED]: [],
		});
	});

	it("keeps program approval, confirmation, and dispatch reachable in sequence", () => {
		expect(PROGRAM_TRANSITION[ProgramStatus.DRAFT]).toEqual([
			ProgramStatus.PENDING_APPROVAL,
			ProgramStatus.CANCELLED,
		]);
		expect(PROGRAM_TRANSITION[ProgramStatus.PENDING_APPROVAL]).toEqual([
			ProgramStatus.APPROVED,
			ProgramStatus.CANCELLED,
		]);
		expect(PROGRAM_TRANSITION[ProgramStatus.APPROVED]).toEqual([
			ProgramStatus.CONFIRMED,
			ProgramStatus.CANCELLED,
		]);
		expect(PROGRAM_TRANSITION[ProgramStatus.CONFIRMED]).toEqual([
			ProgramStatus.SENT_TO_DTM,
		]);
		expect(PROGRAM_TRANSITION[ProgramStatus.SENT_TO_DTM]).toEqual([
			ProgramStatus.IN_PROGRESS,
		]);
	});

	it("defines supported claim lifecycle transitions without reopening closed states", () => {
		expect(CLAIM_TRANSITION[ClaimStatus.NEW]).toEqual([
			ClaimStatus.IN_PROGRESS,
			ClaimStatus.REJECTED,
		]);
		expect(CLAIM_TRANSITION[ClaimStatus.IN_PROGRESS]).toEqual([
			ClaimStatus.AWAITING_INFO,
			ClaimStatus.IN_TREATMENT,
			ClaimStatus.SENT_TO_DTM,
		]);
		expect(CLAIM_TRANSITION[ClaimStatus.AWAITING_INFO]).toEqual([
			ClaimStatus.IN_PROGRESS,
			ClaimStatus.IN_TREATMENT,
		]);
		expect(CLAIM_TRANSITION[ClaimStatus.IN_TREATMENT]).toEqual([
			ClaimStatus.RESOLVED,
			ClaimStatus.REJECTED,
			ClaimStatus.SENT_TO_DTM,
		]);
		expect(CLAIM_TRANSITION[ClaimStatus.RESOLVED]).toEqual([
			ClaimStatus.CLOSED,
			ClaimStatus.SENT_TO_DTM,
		]);
		expect(CLAIM_TRANSITION[ClaimStatus.CLOSED]).toEqual([]);
		expect(CLAIM_TRANSITION[ClaimStatus.REJECTED]).toEqual([]);
		expect(CLAIM_TRANSITION[ClaimStatus.SENT_TO_DTM]).toEqual([]);
	});
});
