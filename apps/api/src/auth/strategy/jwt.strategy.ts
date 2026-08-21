import { Permission } from "@ecommand/shared";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DrizzleService } from "src/db/drizzle.service";
import { UsersService } from "src/users/users.service";
import { AuthUser } from "../auth.types";

export interface JwtPayload {
	sub: number;
	username: string;
	sid: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		config: ConfigService,
		private readonly drizzle: DrizzleService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.getOrThrow("JWT_SECRET"),
		});
	}

	async validate(payload: JwtPayload): Promise<AuthUser> {
		const session = await this.drizzle.db.query.userSessions.findFirst({
			where: {
				sessionToken: payload.sid,
				userId: payload.sub,
			},
		});

		if (
			!session ||
			session.logoutAt ||
			new Date(session.expiredAt) <= new Date()
		) {
			throw new UnauthorizedException();
		}

		const user = await this.usersService.findOneWithPermissions(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}

		return {
			id: user.id,
			email: user.email,
			permissions: new Set(user.permissions as Permission[]),
			role: user.role,
			sessionId: payload.sid,
		};
	}
}
