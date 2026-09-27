import { Permission } from "@ecommand/shared";
import type { AuthRequest } from "@/auth/auth.types";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { ProfileController } from "./profile.controller";
import type { ProfileService } from "./profile.service";
import type { UpdateAppearancePreferencesDto } from "./requests/update-appearance-preferences.dto";
import type { UpdateProfileDto } from "./requests/update-profile.dto";

describe("ProfileController authorization mapping", () => {
	const service = {
		findOne: jest.fn(),
		update: jest.fn(),
		findPreferences: jest.fn(),
		updatePreferences: jest.fn(),
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

	it("returns the saved appearance preferences for the current user", async () => {
		service.findPreferences.mockResolvedValue({ theme: "dark" } as never);
		await expect(controller.getPreferences(request)).resolves.toEqual({
			theme: "dark",
		});
		expect(service.findPreferences).toHaveBeenCalledWith(27);
	});

	it("requires profile update permission when saving appearance preferences", async () => {
		const dto: UpdateAppearancePreferencesDto = {
			theme: "mono-light",
			fontFamily: "inter",
			textSize: "default",
			motion: "system",
		};
		service.updatePreferences.mockResolvedValue(dto as never);
		expect(
			Reflect.getMetadata(
				PERMISSIONS_ANY_KEY,
				ProfileController.prototype.updatePreferences,
			),
		).toEqual([Permission.PROFILE_UPDATE]);
		await expect(controller.updatePreferences(dto, request)).resolves.toEqual(
			dto,
		);
		expect(service.updatePreferences).toHaveBeenCalledWith(27, dto);
	});
});
