import { archivalRelations } from "./relations/archival";
import { claimsRelations } from "./relations/claims";
import { customersRelations } from "./relations/customers";
import { forecastProgramsRelations } from "./relations/forecast-programs";
import { goodsRelations } from "./relations/goods";
import { integrationRelations } from "./relations/integration";
import { notificationsRelations } from "./relations/notifications";
import { ordersRelations } from "./relations/orders";
import { referenceDataRelations } from "./relations/reference-data";
import { trackingRelations } from "./relations/tracking";
import { usersRelations } from "./relations/users";

export const relations = {
	...usersRelations,
	...customersRelations,
	...goodsRelations,
	...referenceDataRelations,
	...ordersRelations,
	...forecastProgramsRelations,
	...claimsRelations,
	...trackingRelations,
	...notificationsRelations,
	...integrationRelations,
	...archivalRelations,
};
