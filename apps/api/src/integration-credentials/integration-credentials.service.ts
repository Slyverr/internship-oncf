import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
	API_ERROR_CODES,
	INTEGRATION_CREDENTIAL_PERMISSIONS,
	Permission,
} from "@ecommand/shared";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Optional,
	UnauthorizedException,
} from "@nestjs/common";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
import { IntegrationCredentialsQuery } from "./integration-credentials.query";

const KEY_PREFIX = "ec_int_";
@Injectable()
export class IntegrationCredentialsService {
	constructor(
		private readonly query: IntegrationCredentialsQuery,
		@Optional() private readonly realtimeEvents?: RealtimeEventsService,
	) {}

	list() {
		return this.query.findAll();
	}

	async create(name: string, permissions: Permission[], actorUserId: number) {
		if (
			permissions.some(
				(permission) =>
					!INTEGRATION_CREDENTIAL_PERMISSIONS.includes(
						permission as (typeof INTEGRATION_CREDENTIAL_PERMISSIONS)[number],
					),
			)
		) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		const keyId = randomBytes(9).toString("base64url");
		const secret = randomBytes(32).toString("base64url");
		const token = `${KEY_PREFIX}${keyId}.${secret}`;
		const credential = await this.query.create({
			name: name.trim(),
			keyId,
			secretHash: this.hash(secret),
			permissions,
			createdByUserId: actorUserId,
		});
		this.publishChanged();
		return { ...credential, secret: token };
	}

	async revoke(id: number, actorUserId: number) {
		const result = await this.query.revoke(id, actorUserId);
		if (!result) throw new NotFoundException();
		this.publishChanged();
		return { id, revoked: true };
	}

	async rotate(id: number, actorUserId: number) {
		const secret = randomBytes(32).toString("base64url");
		const credential = await this.query.rotate(
			id,
			this.hash(secret),
			actorUserId,
		);
		if (!credential) throw new NotFoundException();
		this.publishChanged();
		return {
			...credential,
			secret: `${KEY_PREFIX}${credential.keyId}.${secret}`,
		};
	}

	async authenticate(token: string) {
		const match = /^ec_int_([A-Za-z0-9_-]{12})\.([A-Za-z0-9_-]{43})$/.exec(
			token,
		);
		if (!match) throw new UnauthorizedException();
		const [, keyId, secret] = match;
		const credential = await this.query.findByKeyId(keyId);
		if (!credential || credential.revokedAt) {
			throw new UnauthorizedException();
		}
		const expected = Buffer.from(credential.secretHash, "hex");
		const actual = Buffer.from(this.hash(secret), "hex");
		if (
			expected.length !== actual.length ||
			!timingSafeEqual(expected, actual)
		) {
			throw new UnauthorizedException();
		}
		await this.query.touch(credential.id);
		return credential;
	}

	private hash(secret: string) {
		return createHash("sha256").update(secret).digest("hex");
	}

	private publishChanged() {
		this.realtimeEvents?.publishToPermission(
			Permission.INTEGRATIONS_MANAGE,
			REALTIME_EVENT_TYPES.integrationCredentialsChanged,
		);
	}
}
