import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type AppLocale, DEFAULT_LOCALE } from "@ecommand/shared";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import { emailMessages } from "./messages/en";

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	constructor(private readonly config: ConfigService) {}

	async sendResetPasswordEmail(
		email: string,
		resetLink: string,
		locale: AppLocale = DEFAULT_LOCALE,
	): Promise<void> {
		const messages = emailMessages[locale];
		const smtp = this.getSmtpConfig();
		if (smtp) {
			const transport = nodemailer.createTransport(smtp.transport);
			await transport.sendMail({
				from: smtp.from,
				to: email,
				subject: messages.passwordReset.subject,
				text: messages.passwordReset.text(resetLink),
			});
			this.logger.log(`Password reset email sent to ${email}`);
			return;
		}

		const mailboxPath = path.resolve(
			this.config.get("LOCAL_MAILBOX_PATH", "./.local-mailbox"),
		);
		await mkdir(mailboxPath, { recursive: true });

		const safeEmail = email.replace(/[\r\n]/g, "");
		const message = [
			"From: ECommand Local Mailbox <ecommand@localhost>",
			`To: ${safeEmail}`,
			`Subject: ${messages.passwordReset.subject}`,
			"MIME-Version: 1.0",
			"Content-Type: text/plain; charset=UTF-8",
			"",
			messages.passwordReset.text(resetLink).trimEnd().replaceAll("\n", "\r\n"),
			"",
		].join("\r\n");
		const messagePath = path.join(
			mailboxPath,
			`${Date.now()}-${randomUUID()}.eml`,
		);

		await writeFile(messagePath, message, { encoding: "utf8", mode: 0o600 });
		this.logger.log(`Password reset message saved to ${messagePath}`);
	}

	private getSmtpConfig() {
		const host = this.config.get<string>("SMTP_HOST");
		const from = this.config.get<string>("SMTP_FROM");
		const user = this.config.get<string>("SMTP_USER");
		const password = this.config.get<string>("SMTP_PASSWORD");

		if (!host && !from && !user && !password) {
			return null;
		}
		if (!host || !from || Boolean(user) !== Boolean(password)) {
			this.logger.warn(
				"SMTP settings are incomplete; using the local password reset mailbox",
			);
			return null;
		}

		const port = Number(this.config.get("SMTP_PORT", 587));
		if (!Number.isInteger(port) || port < 1 || port > 65535) {
			this.logger.warn(
				"SMTP_PORT is invalid; using the local password reset mailbox",
			);
			return null;
		}

		return {
			from,
			transport: {
				host,
				port,
				secure: this.config.get<string>("SMTP_SECURE") === "true",
				...(user && password && { auth: { user, pass: password } }),
			},
		};
	}
}
