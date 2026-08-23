import { ProfileService } from "./profile.service";

export type Profile = NonNullable<
	Awaited<ReturnType<ProfileService["findOne"]>>
>;
