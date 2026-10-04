import { Injectable } from "@nestjs/common";
import type { DtmGateway } from "./dtm.gateway";

/** Keeps local workflow behavior when no DTM transport has been configured. */
@Injectable()
export class DtmDisabledAdapter implements DtmGateway {
	async submitOrder(): Promise<void> {}
	async submitProgram(): Promise<void> {}
}
