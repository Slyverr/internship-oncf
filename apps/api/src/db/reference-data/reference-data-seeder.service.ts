import { Injectable, OnModuleInit } from "@nestjs/common";
import { DrizzleService } from "../drizzle.service";
import { seedReferenceData } from "./reference-data.seeder";

@Injectable()
export class ReferenceDataSeederService implements OnModuleInit {
	constructor(private readonly drizzle: DrizzleService) {}

	async onModuleInit() {
		await this.seed();
	}

	async seed() {
		await seedReferenceData(this.drizzle.db);
	}
}
