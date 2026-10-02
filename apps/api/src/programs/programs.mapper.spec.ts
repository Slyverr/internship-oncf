import { API_ERROR_CODES, ProgramStatus, Role } from "@ecommand/shared";
import { ProgramsMapper } from "./programs.mapper";

const mapper = new ProgramsMapper();
const user = {
	id: 7,
	email: "agent@example.test",
	role: Role.AGENT_COMMERCIAL,
	permissions: new Set(),
	sessionId: "test-session",
	customerId: null,
	agencyId: null,
};

function getErrorResponse(operation: () => unknown) {
	try {
		operation();
	} catch (error) {
		return (error as { getResponse: () => unknown }).getResponse();
	}
	throw new Error("Expected an API exception");
}

describe("ProgramsMapper permissions", () => {
	it("requires ownership permission to assign a program to another user", () => {
		expect(
			getErrorResponse(() =>
				mapper.toCreate({ userId: 12 } as never, user as never),
			),
		).toEqual({ code: API_ERROR_CODES.PROGRAM_OWNERSHIP_CHANGE_FORBIDDEN });
	});

	it("requires ownership permission to reassign an existing program", () => {
		expect(
			getErrorResponse(() =>
				mapper.toUpdate({ userId: 12 } as never, user as never),
			),
		).toEqual({ code: API_ERROR_CODES.PROGRAM_OWNERSHIP_CHANGE_FORBIDDEN });
	});

	it("requires status permission to set a program status", () => {
		expect(
			getErrorResponse(() =>
				mapper.toUpdate(
					{ status: ProgramStatus.APPROVED } as never,
					user as never,
				),
			),
		).toEqual({ code: API_ERROR_CODES.PROGRAM_STATUS_CHANGE_FORBIDDEN });
	});
});
