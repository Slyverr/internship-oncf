import { Permission } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthUser } from "../auth.types";

export interface JwtPayload {
	sub: number;
	username: string;
	permissions?: string[];
	role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.getOrThrow("JWT_SECRET"),
		});
	}

	async validate(payload: JwtPayload): Promise<AuthUser> {
		const permissions = (payload.permissions ?? []) as Permission[];

		return {
			id: payload.sub,
			email: payload.username,
			permissions: new Set(permissions),
			role: payload.role,
		};
	}
}
