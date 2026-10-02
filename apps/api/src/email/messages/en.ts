import type { AppLocale } from "@ecommand/shared";

export const enEmailMessages = {
	passwordReset: {
		subject: "Reset your ECommand password",
		text: (resetLink: string) =>
			`Use this link to reset your password. It expires in one hour.\n\n${resetLink}\n`,
	},
} as const;

export const emailMessages = {
	en: enEmailMessages,
} satisfies Record<AppLocale, typeof enEmailMessages>;
