import { validate } from "class-validator";
import { UpdateAppearancePreferencesDto } from "./update-appearance-preferences.dto";

describe("UpdateAppearancePreferencesDto", () => {
	it("accepts every supported appearance choice", async () => {
		const dto = Object.assign(new UpdateAppearancePreferencesDto(), {
			theme: "mono-dark",
			fontFamily: "geist",
			textSize: "large",
			motion: "reduced",
			workspaceLayout: "centered-header",
		});

		await expect(validate(dto)).resolves.toHaveLength(0);
	});

	it("rejects unsupported preference values", async () => {
		const dto = Object.assign(new UpdateAppearancePreferencesDto(), {
			theme: "neon",
			fontFamily: "comic-sans",
			textSize: "tiny",
			motion: "always",
			workspaceLayout: "floating-panels",
		});

		const errors = await validate(dto);
		expect(errors.map(({ property }) => property).sort()).toEqual([
			"fontFamily",
			"motion",
			"textSize",
			"theme",
			"workspaceLayout",
		]);
	});
});
