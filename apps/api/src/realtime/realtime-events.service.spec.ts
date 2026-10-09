import { Permission } from "@ecommand/shared";
import { filter, firstValueFrom, take } from "rxjs";
import type { AuthUser } from "@/auth/auth.types";
import { RealtimeEventsService } from "./realtime-events.service";

describe("RealtimeEventsService", () => {
	it("routes a user event only to its intended user", async () => {
		const service = new RealtimeEventsService({ get: () => "" } as never);
		const recipient = {
			id: 7,
			permissions: new Set<Permission>(),
		} as AuthUser;
		const otherUser = {
			id: 8,
			permissions: new Set<Permission>(),
		} as AuthUser;
		let leaked = false;
		const otherSubscription = service
			.streamFor(otherUser)
			.pipe(filter(({ data }) => data.type === "orders.changed"))
			.subscribe(() => {
				leaked = true;
			});
		const received = firstValueFrom(
			service.streamFor(recipient).pipe(
				filter(({ data }) => data.type === "orders.changed"),
				take(1),
			),
		);

		service.publishToUser(7, "orders.changed", { orderId: 32 });

		expect(await received).toMatchObject({
			data: { type: "orders.changed", data: { orderId: 32 } },
		});
		expect(leaked).toBe(false);
		otherSubscription.unsubscribe();
	});

	it("routes permission events only to users with the permission", async () => {
		const service = new RealtimeEventsService({ get: () => "" } as never);
		const operator = {
			id: 7,
			permissions: new Set([Permission.INTEGRATIONS_MANAGE]),
		} as AuthUser;
		const customer = {
			id: 8,
			permissions: new Set<Permission>(),
		} as AuthUser;
		let leaked = false;
		const customerSubscription = service
			.streamFor(customer)
			.pipe(filter(({ data }) => data.type === "dtm.activity.changed"))
			.subscribe(() => {
				leaked = true;
			});
		const received = firstValueFrom(
			service.streamFor(operator).pipe(
				filter(({ data }) => data.type === "dtm.activity.changed"),
				take(1),
			),
		);

		service.publishToPermission(
			Permission.INTEGRATIONS_MANAGE,
			"dtm.activity.changed",
			{ requestId: 42 },
		);

		expect(await received).toMatchObject({
			data: { type: "dtm.activity.changed", data: { requestId: 42 } },
		});
		expect(leaked).toBe(false);
		customerSubscription.unsubscribe();
	});

	it("routes a DTM event once to both managers and the request creator", () => {
		const service = new RealtimeEventsService({ get: () => "" } as never);
		const manager = {
			id: 7,
			permissions: new Set([Permission.INTEGRATIONS_MANAGE]),
		} as AuthUser;
		const creator = {
			id: 8,
			permissions: new Set<Permission>(),
		} as AuthUser;
		const managerEvents: string[] = [];
		const creatorEvents: string[] = [];
		const managerSubscription = service
			.streamFor(manager)
			.subscribe(({ data }) => {
				if (data.type === "dtm.activity.changed") managerEvents.push(data.id);
			});
		const creatorSubscription = service
			.streamFor(creator)
			.subscribe(({ data }) => {
				if (data.type === "dtm.activity.changed") creatorEvents.push(data.id);
			});

		service.publish(
			"dtm.activity.changed",
			{ requestId: 42, status: "ACCEPTED" },
			{ permission: Permission.INTEGRATIONS_MANAGE, userId: creator.id },
		);

		expect(managerEvents).toHaveLength(1);
		expect(creatorEvents).toHaveLength(1);
		managerSubscription.unsubscribe();
		creatorSubscription.unsubscribe();
	});
});
