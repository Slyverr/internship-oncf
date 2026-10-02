export const frEmailMessagesDraft = {
	passwordReset: {
		subject: "Réinitialiser votre mot de passe ECommand",
		text: (resetLink: string) =>
			`Utilisez ce lien pour réinitialiser votre mot de passe. Il expire dans une heure.\n\n${resetLink}\n`,
	},
} as const;
