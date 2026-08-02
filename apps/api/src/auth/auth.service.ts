import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/users.types";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string) {
		try {
			const user = await this.usersService.findOneByEmail(email);
			if (!(await bcrypt.compare(pass, user.password))) {
				return null;
			}

			const { password, ...result } = user;
			return result;
		} catch {
			return null;
		}
	}

	async login(user: Omit<User, "password">) {
		const authUser = await this.usersService.findUserWithPermissions(user.id);
		if (!authUser) {
			throw new UnauthorizedException();
		}

		const payload = {
			sub: authUser.id,
			username: authUser.email,
			permissions: authUser.permissions,
			role: authUser.role,
		};

		const access_token = await this.jwtService.signAsync(payload);
		return { access_token };
	}
}
