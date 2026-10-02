import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DEFAULT_LOCALE } from "@ecommand/shared";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import { EmailService } from "./email.service";

jest.mock("nodemailer", () => ({
	__esModule: true,
	default: { createTransport: jest.fn() },
}));

const createTransport = nodemailer.createTransport as jest.Mock;

describe("EmailService password reset delivery", () => {
	let mailboxPath: string;

	beforeEach(async () => {
		mailboxPath = await mkdtemp(path.join(os.tmpdir(), "ecommand-mailbox-"));
		createTransport.mockReset();
	});

	afterEach(async () => {
		await rm(mailboxPath, { recursive: true, force: true });
	});

	function makeConfig(values: Record<string, string | undefined> = {}) {
		return {
			get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
		} as unknown as ConfigService;
	}

	async function readLocalMessage() {
		const [filename] = await readdir(mailboxPath);
		expect(filename).toMatch(/\.eml$/);
		const messagePath = path.join(mailboxPath, filename);
		return {
			content: await readFile(messagePath, "utf8"),
			mode: (await stat(messagePath)).mode & 0o777,
		};
	}

	it("writes a private local message when SMTP is not configured", async () => {
		const service = new EmailService(
			makeConfig({ LOCAL_MAILBOX_PATH: mailboxPath }),
		);
		const resetLink = "http://localhost:3000/reset-password?token=secret";

		await service.sendResetPasswordEmail(
			"client@example.test",
			resetLink,
			DEFAULT_LOCALE,
		);

		const message = await readLocalMessage();
		expect(message.content).toContain("To: client@example.test");
		expect(message.content).toContain("Subject: Reset your ECommand password");
		expect(message.content).toContain(resetLink);
		expect(message.mode).toBe(0o600);
		expect(createTransport).not.toHaveBeenCalled();
	});

	it("strips line breaks from the local message recipient header", async () => {
		const service = new EmailService(
			makeConfig({ LOCAL_MAILBOX_PATH: mailboxPath }),
		);

		await service.sendResetPasswordEmail(
			"client@example.test\r\nBcc:attacker@example.test",
			"http://localhost:3000/reset-password?token=secret",
		);

		const { content } = await readLocalMessage();
		expect(content).toContain(
			"To: client@example.testBcc:attacker@example.test",
		);
		expect(content).not.toContain("\r\nBcc:");
	});

	it.each([
		["host without sender", { SMTP_HOST: "smtp.example.test" }],
		["sender without host", { SMTP_FROM: "ECommand <no-reply@example.test>" }],
		[
			"only an SMTP username",
			{
				SMTP_HOST: "smtp.example.test",
				SMTP_FROM: "ECommand <no-reply@example.test>",
				SMTP_USER: "mailer",
			},
		],
		["only an SMTP password", { SMTP_PASSWORD: "provider-secret" }],
		[
			"invalid SMTP port",
			{
				SMTP_HOST: "smtp.example.test",
				SMTP_FROM: "ECommand <no-reply@example.test>",
				SMTP_PORT: "70000",
			},
		],
	])("uses the local mailbox for %s", async (_caseName, smtpValues) => {
		const service = new EmailService(
			makeConfig({ ...smtpValues, LOCAL_MAILBOX_PATH: mailboxPath }),
		);

		await service.sendResetPasswordEmail(
			"client@example.test",
			"http://localhost:3000/reset-password?token=secret",
		);

		expect((await readLocalMessage()).content).toContain(
			"Subject: Reset your ECommand password",
		);
		expect(createTransport).not.toHaveBeenCalled();
	});

	it("sends through SMTP without authentication when provider data is complete", async () => {
		const sendMail = jest.fn().mockResolvedValue(undefined);
		createTransport.mockReturnValue({ sendMail });
		const config = makeConfig({
			SMTP_HOST: "smtp.example.test",
			SMTP_FROM: "ECommand <no-reply@example.test>",
		});
		const service = new EmailService(config);
		const resetLink =
			"https://ecommand.example.test/reset-password?token=secret";

		await service.sendResetPasswordEmail("client@example.test", resetLink);

		expect(createTransport).toHaveBeenCalledWith({
			host: "smtp.example.test",
			port: 587,
			secure: false,
		});
		expect(sendMail).toHaveBeenCalledWith({
			from: "ECommand <no-reply@example.test>",
			to: "client@example.test",
			subject: "Reset your ECommand password",
			text: `Use this link to reset your password. It expires in one hour.\n\n${resetLink}\n`,
		});
	});

	it("passes SMTP authentication and secure transport settings when configured", async () => {
		createTransport.mockReturnValue({
			sendMail: jest.fn().mockResolvedValue(undefined),
		});
		const service = new EmailService(
			makeConfig({
				SMTP_HOST: "smtp.example.test",
				SMTP_FROM: "ECommand <no-reply@example.test>",
				SMTP_PORT: "465",
				SMTP_SECURE: "true",
				SMTP_USER: "mailer",
				SMTP_PASSWORD: "provider-secret",
			}),
		);

		await service.sendResetPasswordEmail(
			"client@example.test",
			"https://ecommand.example.test/reset-password?token=secret",
		);

		expect(createTransport).toHaveBeenCalledWith({
			host: "smtp.example.test",
			port: 465,
			secure: true,
			auth: { user: "mailer", pass: "provider-secret" },
		});
	});

	it("propagates SMTP delivery failure to the caller", async () => {
		const sendMail = jest
			.fn()
			.mockRejectedValue(new Error("provider unavailable"));
		createTransport.mockReturnValue({ sendMail });
		const service = new EmailService(
			makeConfig({
				SMTP_HOST: "smtp.example.test",
				SMTP_FROM: "ECommand <no-reply@example.test>",
			}),
		);

		await expect(
			service.sendResetPasswordEmail(
				"client@example.test",
				"https://ecommand.example.test/reset-password?token=secret",
			),
		).rejects.toThrow("provider unavailable");
	});
});
