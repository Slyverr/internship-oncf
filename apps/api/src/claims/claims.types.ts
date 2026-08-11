import { claims } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Claim = InferSelectModel<typeof claims>;
export type ClaimId = Claim["id"];
