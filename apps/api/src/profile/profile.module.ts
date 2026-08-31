import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileQuery } from "./profile.query";
import { ProfileService } from "./profile.service";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, ProfileQuery],
	exports: [ProfileService],
})
export class ProfileModule {}
