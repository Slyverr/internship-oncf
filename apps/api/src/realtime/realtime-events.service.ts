import { randomUUID } from "node:crypto";
import { Permission } from "@ecommand/shared";
import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "pg";
import { filter, interval, map, merge, Observable, Subject } from "rxjs";
import type { AuthUser } from "@/auth/auth.types";

export const REALTIME_EVENT_TYPES = {
	notificationsChanged: "notifications.changed",
	dtmActivityChanged: "dtm.activity.changed",
	dtmRequestPending: "dtm.request.pending",
	ordersChanged: "orders.changed",
	programsChanged: "programs.changed",
	claimsChanged: "claims.changed",
	trackingChanged: "tracking.changed",
	catalogChanged: "catalog.changed",
	customersChanged: "customers.changed",
	usersChanged: "users.changed",
	rolesChanged: "roles.changed",
	integrationCredentialsChanged: "integration-credentials.changed",
	profileChanged: "profile.changed",
	profilePreferencesChanged: "profile.preferences.changed",
} as const;

const CHANNEL = "ecommand_realtime_events";

export type RealtimeEvent = {
	id: string;
	type: string;
	occurredAt: string;
	data: Record<string, unknown>;
};

type TargetedRealtimeEvent = RealtimeEvent & {
	userId?: number;
	permission?: Permission;
	permissions?: Permission[];
	originId?: string;
};

/** Shared PostgreSQL event transport behind the authenticated realtime stream. */
@Injectable()
export class RealtimeEventsService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RealtimeEventsService.name);
	private readonly events = new Subject<TargetedRealtimeEvent>();
	private readonly instanceId = randomUUID();
	private listener?: Client;
	private reconnectTimer?: NodeJS.Timeout;
	private reconnectDelayMs = 1_000;
	private listenerHasConnected = false;
	private shuttingDown = false;

	constructor(private readonly config: ConfigService) {}

	async onModuleInit() {
		await this.connectListener();
	}

	async onModuleDestroy() {
		this.shuttingDown = true;
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.events.complete();
		await this.listener?.end().catch(() => undefined);
	}

	publish(
		type: string,
		data: Record<string, unknown> = {},
		target: {
			userId?: number;
			permission?: Permission;
			permissions?: Permission[];
		} = {},
	) {
		const event: TargetedRealtimeEvent = {
			id: randomUUID(),
			type,
			occurredAt: new Date().toISOString(),
			data,
			originId: this.instanceId,
			...target,
		};
		this.events.next(event);
		void this.notify(event);
	}

	publishToUser(
		userId: number,
		type: string,
		data: Record<string, unknown> = {},
	) {
		this.publish(type, data, { userId });
	}

	publishToPermission(
		permission: Permission,
		type: string,
		data: Record<string, unknown> = {},
	) {
		this.publish(type, data, { permission });
	}

	publishToPermissions(
		permissions: readonly Permission[],
		type: string,
		data: Record<string, unknown> = {},
	) {
		this.publish(type, data, { permissions: [...permissions] });
	}

	streamFor(user: AuthUser): Observable<{ id?: string; data: RealtimeEvent }> {
		const userEvents = this.events.pipe(
			filter(
				(event) =>
					(event.userId === undefined &&
						event.permission === undefined &&
						event.permissions === undefined) ||
					(event.userId !== undefined && event.userId === user.id) ||
					(event.permission !== undefined &&
						user.permissions.has(event.permission)) ||
					(event.permissions?.some((permission) =>
						user.permissions.has(permission),
					) ??
						false),
			),
			map(({ id, type, occurredAt, data }) => ({
				id,
				data: { id, type, occurredAt, data },
			})),
		);
		const heartbeats = interval(20_000).pipe(
			map(() => ({
				data: {
					id: randomUUID(),
					type: "realtime.heartbeat",
					occurredAt: new Date().toISOString(),
					data: {},
				},
			})),
		);

		return merge(userEvents, heartbeats);
	}

	private async notify(event: TargetedRealtimeEvent) {
		const client = this.listener;
		if (!client) return;

		try {
			await client.query("SELECT pg_notify($1, $2)", [
				CHANNEL,
				JSON.stringify(event),
			]);
		} catch (error) {
			this.logger.warn(
				`Could not publish realtime event to PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async connectListener() {
		if (this.shuttingDown) return;
		const client = new Client({
			connectionString: this.config.get("DATABASE_URL"),
		});

		client.on("notification", (message) => {
			if (message.channel !== CHANNEL || !message.payload) return;
			try {
				const event = JSON.parse(message.payload) as TargetedRealtimeEvent;
				if (event.originId !== this.instanceId) this.events.next(event);
			} catch {
				this.logger.warn("Ignored malformed realtime event from PostgreSQL");
			}
		});
		client.on("error", (error) => {
			this.logger.warn(
				`Realtime PostgreSQL listener disconnected: ${error.message}`,
			);
			void this.reconnect(client);
		});

		try {
			await client.connect();
			await client.query(`LISTEN ${CHANNEL}`);
			if (this.shuttingDown) {
				await client.end();
				return;
			}
			this.listener = client;
			this.reconnectDelayMs = 1_000;
			if (this.listenerHasConnected) {
				this.publish("realtime.resync");
			}
			this.listenerHasConnected = true;
			this.logger.log("Connected to shared PostgreSQL realtime channel");
		} catch (error) {
			this.logger.warn(
				`Could not connect realtime PostgreSQL listener: ${error instanceof Error ? error.message : String(error)}`,
			);
			await client.end().catch(() => undefined);
			this.scheduleReconnect();
		}
	}

	private async reconnect(client: Client) {
		if (this.listener === client) this.listener = undefined;
		await client.end().catch(() => undefined);
		this.scheduleReconnect();
	}

	private scheduleReconnect() {
		if (this.shuttingDown || this.reconnectTimer) return;
		const delay = this.reconnectDelayMs;
		this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30_000);
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined;
			void this.connectListener();
		}, delay);
	}
}
