// src/common/email/email.service.ts
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	async sendResetPasswordEmail(
		email: string,
		resetLink: string,
	): Promise<void> {
		this.logger.log(`[PASSWORD RESET] ${email}: ${resetLink}`);
	}
}
