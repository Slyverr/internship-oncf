import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { ClaimsController } from "./claims.controller";
import type { ClaimsService } from "./claims.service";
import { ClaimOwnershipGuard } from "./guards/claim-ownership.guard";

const user = { id: 7 };
const dto = {
	content: "Details",
	resolution: "Resolved",
	rejectionReason: "Invalid",
};
const claimNumber = "CLM-ABCDEFGHJK";
const query = { page: 1 };
const endpoints = [
	{
		action: "create",
		permission: Permission.CLAIMS_CREATE,
		serviceMethod: "create",
		args: [{ title: "Claim" }, { user }],
		serviceArgs: [{ title: "Claim" }, user],
	},
	{
		action: "findAll",
		permission: Permission.CLAIMS_READ,
		serviceMethod: "findAll",
		args: [{ user }, query],
		serviceArgs: [user, query],
	},
	{
		action: "findOne",
		permission: Permission.CLAIMS_READ,
		serviceMethod: "findOne",
		args: [claimNumber],
	},
	{
		action: "update",
		permission: Permission.CLAIMS_UPDATE,
		serviceMethod: "update",
		args: [claimNumber, { title: "Updated" }, { user }],
		serviceArgs: [claimNumber, { title: "Updated" }, user],
	},
	{
		action: "remove",
		permission: Permission.CLAIMS_DELETE,
		serviceMethod: "remove",
		args: [claimNumber],
	},
	{
		action: "addComment",
		permission: Permission.CLAIMS_ACTION_COMMENT,
		serviceMethod: "addComment",
		args: [claimNumber, dto, { user }],
		serviceArgs: [claimNumber, dto.content, user],
	},
	{
		action: "getComments",
		permission: Permission.CLAIMS_READ,
		serviceMethod: "getComments",
		args: [claimNumber],
	},
	{
		action: "startProgress",
		permission: Permission.CLAIMS_ACTION_START_PROGRESS,
		serviceMethod: "startProgress",
		args: [claimNumber, { user }],
		serviceArgs: [claimNumber, user],
	},
	{
		action: "awaitInfo",
		permission: Permission.CLAIMS_ACTION_AWAIT_INFO,
		serviceMethod: "awaitInfo",
		args: [claimNumber, { user }],
		serviceArgs: [claimNumber, user],
	},
	{
		action: "startTreatment",
		permission: Permission.CLAIMS_ACTION_START_TREATMENT,
		serviceMethod: "startTreatment",
		args: [claimNumber, { user }],
		serviceArgs: [claimNumber, user],
	},
	{
		action: "resolve",
		permission: Permission.CLAIMS_ACTION_RESOLVE,
		serviceMethod: "resolve",
		args: [claimNumber, dto, { user }],
		serviceArgs: [claimNumber, user, dto.resolution],
	},
	{
		action: "close",
		permission: Permission.CLAIMS_ACTION_CLOSE,
		serviceMethod: "close",
		args: [claimNumber, { user }],
		serviceArgs: [claimNumber, user],
	},
	{
		action: "reject",
		permission: Permission.CLAIMS_ACTION_REJECT,
		serviceMethod: "reject",
		args: [claimNumber, dto, { user }],
		serviceArgs: [claimNumber, user, dto.rejectionReason],
	},
	{
		action: "sendToDtm",
		permission: Permission.CLAIMS_ACTION_SEND_TO_DTM,
		serviceMethod: "sendToDtm",
		args: [claimNumber, { user }],
		serviceArgs: [claimNumber, user],
	},
] as const;

describe("ClaimsController authorization and user scope", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ serviceMethod }) => serviceMethod))].map(
			(method) => [method, jest.fn().mockResolvedValue({ method })],
		),
	);
	const controller = new ClaimsController(service as unknown as ClaimsService);
	const methods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;

	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
	});

	it.each(endpoints)(
		"requires $permission for $action and forwards its input",
		async (endpoint) => {
			const { action, permission, serviceMethod, args } = endpoint;
			const serviceArgs =
				"serviceArgs" in endpoint ? endpoint.serviceArgs : args;
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					ClaimsController.prototype[action],
				),
			).toEqual([permission]);
			await expect(methods[action](...args)).resolves.toEqual({
				method: serviceMethod,
			});
			expect(service[serviceMethod]).toHaveBeenCalledWith(
				...(serviceArgs ?? args),
			);
		},
	);

	it("applies ownership checks across claim routes", () => {
		expect(Reflect.getMetadata("__guards__", ClaimsController)).toContain(
			ClaimOwnershipGuard,
		);
	});
});
