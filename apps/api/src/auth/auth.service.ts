import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { users } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import { UsersService } from "src/users/users.service";

type User = InferSelectModel<typeof users>;

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string) {
		const user = await this.usersService.findOneByEmail(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}

		return null;
	}

	async login(user: User) {
		const payload = { sub: user.id, username: user.email };
		return { access_token: await this.jwtService.signAsync(payload) };
	}
}
