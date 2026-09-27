import { Permission } from "@ecommand/shared";
import type { AuthRequest } from "@/auth/auth.types";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { ProfileController } from "./profile.controller";
import type { ProfileService } from "./profile.service";
import type { UpdateProfileDto } from "./requests/update-profile.dto";

describe("ProfileController authorization mapping", () => {
	const service = {
		findOne: jest.fn(),
		update: jest.fn(),
	} as unknown as jest.Mocked<ProfileService>;
	const controller = new ProfileController(service);
	const request = { user: { id: 27 } } as AuthRequest;

	beforeEach(() => jest.resetAllMocks());

	it("returns only the authenticated user profile", async () => {
		service.findOne.mockResolvedValue({ id: 27 } as never);
		await expect(controller.getCurrent(request)).resolves.toEqual({ id: 27 });
		expect(service.findOne).toHaveBeenCalledWith(27);
	});

	it("requires profile update permission and updates only the authenticated user", async () => {
		const dto: UpdateProfileDto = { firstName: "Nadia" };
		service.update.mockResolvedValue({ id: 27, firstName: "Nadia" } as never);
		expect(
			Reflect.getMetadata(
				PERMISSIONS_ANY_KEY,
				ProfileController.prototype.update,
			),
		).toEqual([Permission.PROFILE_UPDATE]);
		await expect(controller.update(dto, request)).resolves.toEqual({
			id: 27,
			firstName: "Nadia",
		});
		expect(service.update).toHaveBeenCalledWith(27, dto);
	});
});
