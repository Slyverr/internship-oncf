import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

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

	async validate(payload: JwtPayload) {
		return {
			id: payload.sub,
			email: payload.username,
			permissions: payload.permissions ?? [],
			roles: payload.role,
		};
	}
}
