import { Permission } from "@ecommand/shared";
import { Controller, Get, Query, Request } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { OrderReportQueryDto } from "./reports.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
	constructor(private readonly reports: ReportsService) {}

	@Get("orders")
	@RequireAny(Permission.REPORTS_READ)
	@ApiOperation({
		summary:
			"Summarize accessible orders by status, customer, product, and month",
	})
	getOrders(
		@Request() request: AuthRequest,
		@Query() query: OrderReportQueryDto,
	) {
		return this.reports.getOrders(request.user, query);
	}
}
