import { API_ERROR_CODES } from "@ecommand/shared";
import type { ProfileQuery } from "./profile.query";
import { ProfileService } from "./profile.service";
import type { UpdateAppearancePreferencesDto } from "./requests/update-appearance-preferences.dto";
import type { UpdateProfileDto } from "./requests/update-profile.dto";

const profile = {
	id: 9,
	email: "user@oncf.ma",
	firstName: "Samira",
	lastName: "Test",
	customer: { companyName: "Atlas Import", customerCode: "CLI009" },
	role: {
		name: "commercial_agent",
		rolePermissions: [
			{ permission: { name: "orders:read" } },
			{ permission: null },
			{ permission: { name: "profile:update" } },
		],
	},
};

describe("ProfileService", () => {
	const query = {
		findProfile: jest.fn(),
		updateProfile: jest.fn(),
		findPreferences: jest.fn(),
		savePreferences: jest.fn(),
	} as unknown as jest.Mocked<ProfileQuery>;
	const service = new ProfileService(query);

	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("returns the current profile with flattened role permissions", async () => {
		query.findProfile.mockResolvedValue(profile as never);
		expect(await service.findOne(9 as never)).toEqual({
			id: profile.id,
			email: profile.email,
			firstName: profile.firstName,
			lastName: profile.lastName,
			customerName: "Atlas Import",
			customerCode: "CLI009",
			role: "commercial_agent",
			permissions: ["orders:read", "profile:update"],
		});
	});

	it("throws when the requested user does not exist", async () => {
		query.findProfile.mockResolvedValue(undefined);
		await expect(service.findOne(404 as never)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_NOT_FOUND },
		});
	});

	it("rejects profiles without an assigned role", async () => {
		query.findProfile.mockResolvedValue({ ...profile, role: null } as never);
		await expect(service.findOne(9 as never)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.INTERNAL_ERROR },
		});
	});

	it("updates editable fields and returns the refreshed profile", async () => {
		const dto: UpdateProfileDto = { firstName: "Updated" };
		query.updateProfile.mockResolvedValue({ id: 9 } as never);
		query.findProfile.mockResolvedValue({
			...profile,
			firstName: "Updated",
		} as never);
		await expect(service.update(9 as never, dto)).resolves.toMatchObject({
			firstName: "Updated",
			role: "commercial_agent",
		});
		expect(query.updateProfile).toHaveBeenCalledWith(9, dto);
		expect(query.findProfile).toHaveBeenCalledWith(9);
	});

	it("returns null when the user has not saved appearance preferences", async () => {
		query.findPreferences.mockResolvedValue(undefined);
		await expect(service.findPreferences(9 as never)).resolves.toBeNull();
		expect(query.findPreferences).toHaveBeenCalledWith(9);
	});

	it("saves appearance preferences for the authenticated user", async () => {
		const preferences: UpdateAppearancePreferencesDto = {
			theme: "mono-dark",
			fontFamily: "geist",
			textSize: "large",
			motion: "reduced",
			workspaceLayout: "centered-header",
		};
		query.savePreferences.mockResolvedValue({ ...preferences } as never);

		await expect(
			service.updatePreferences(9 as never, preferences),
		).resolves.toEqual(preferences);
		expect(query.savePreferences).toHaveBeenCalledWith(9, preferences);
	});
});
