import {
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import type { ProfileQuery } from "./profile.query";
import { ProfileService } from "./profile.service";
import type { UpdateProfileDto } from "./requests/update-profile.dto";

const profile = {
	id: 9,
	email: "user@oncf.ma",
	firstName: "Samira",
	lastName: "Test",
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
	} as unknown as jest.Mocked<ProfileQuery>;
	const service = new ProfileService(query);

	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("returns the current profile with flattened role permissions", async () => {
		query.findProfile.mockResolvedValue(profile as never);
		expect(await service.findOne(9 as never)).toEqual({
			...profile,
			role: "commercial_agent",
			permissions: ["orders:read", "profile:update"],
		});
	});

	it("throws when the requested user does not exist", async () => {
		query.findProfile.mockResolvedValue(undefined);
		await expect(service.findOne(404 as never)).rejects.toThrow(
			new NotFoundException("User with id 404 not found"),
		);
	});

	it("rejects profiles without an assigned role", async () => {
		query.findProfile.mockResolvedValue({ ...profile, role: null } as never);
		await expect(service.findOne(9 as never)).rejects.toThrow(
			new InternalServerErrorException("User 9 has no role assigned"),
		);
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
});
