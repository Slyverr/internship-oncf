import { Global, Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { ReferenceDataSeederService } from "./reference-data/reference-data-seeder.service";

@Global()
@Module({
	providers: [DrizzleService, ReferenceDataSeederService],
	exports: [DrizzleService],
})
export class DrizzleModule {}
