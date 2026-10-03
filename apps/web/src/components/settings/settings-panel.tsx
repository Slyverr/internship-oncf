"use client";

import { isStrongPassword } from "@ecommand/shared";
import { PanelLeftIcon, PanelTopIcon } from "lucide-react";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import { ThemePreview } from "@/components/common/theme-preview";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Messages,
	type TypedMessageTranslator,
	translateApiResponse,
} from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { useAuthControllerChangePassword } from "@/lib/api/auth";
import { useProfileControllerUpdate } from "@/lib/api/profile";
import { getFormErrorMessage } from "@/lib/form-utils";
import {
	type FontFamily,
	type TextSize,
	useAppearance,
} from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";

function getThemeOptions(t: TypedMessageTranslator) {
	return [
		{
			value: "system" as const,
			label: t(Messages.settings.appearance.options.theme.system.label),
			description: t(
				Messages.settings.appearance.options.theme.system.description,
			),
			preview: <ThemePreview theme="system" size="compact" />,
		},
		{
			value: "light" as const,
			label: t(Messages.settings.appearance.options.theme.light.label),
			description: t(
				Messages.settings.appearance.options.theme.light.description,
			),
			preview: <ThemePreview theme="light" size="compact" />,
		},
		{
			value: "dark" as const,
			label: t(Messages.settings.appearance.options.theme.dark.label),
			description: t(
				Messages.settings.appearance.options.theme.dark.description,
			),
			preview: <ThemePreview theme="dark" size="compact" />,
		},
		{
			value: "mono-light" as const,
			label: t(Messages.settings.appearance.options.theme.monoLight.label),
			description: t(
				Messages.settings.appearance.options.theme.monoLight.description,
			),
			preview: <ThemePreview theme="mono-light" size="compact" />,
		},
		{
			value: "mono-dark" as const,
			label: t(Messages.settings.appearance.options.theme.monoDark.label),
			description: t(
				Messages.settings.appearance.options.theme.monoDark.description,
			),
			preview: <ThemePreview theme="mono-dark" size="compact" />,
		},
	];
}

function getFontOptions(t: TypedMessageTranslator) {
	return [
		{
			value: "inter" as const,
			label: t(Messages.settings.appearance.options.font.inter.label),
			description: t(
				Messages.settings.appearance.options.font.inter.description,
			),
			preview: <FontPreview font="inter" />,
		},
		{
			value: "geist" as const,
			label: t(Messages.settings.appearance.options.font.geist.label),
			description: t(
				Messages.settings.appearance.options.font.geist.description,
			),
			preview: <FontPreview font="geist" />,
		},
		{
			value: "system" as const,
			label: t(Messages.settings.appearance.options.font.system.label),
			description: t(
				Messages.settings.appearance.options.font.system.description,
			),
			preview: <FontPreview font="system" />,
		},
		{
			value: "arial" as const,
			label: t(Messages.settings.appearance.options.font.arial.label),
			description: t(
				Messages.settings.appearance.options.font.arial.description,
			),
			preview: <FontPreview font="arial" />,
		},
		{
			value: "serif" as const,
			label: t(Messages.settings.appearance.options.font.serif.label),
			description: t(
				Messages.settings.appearance.options.font.serif.description,
			),
			preview: <FontPreview font="serif" />,
		},
		{
			value: "monospace" as const,
			label: t(Messages.settings.appearance.options.font.monospace.label),
			description: t(
				Messages.settings.appearance.options.font.monospace.description,
			),
			preview: <FontPreview font="monospace" />,
		},
	];
}

function getTextSizeOptions(t: TypedMessageTranslator) {
	return [
		{
			value: "small" as const,
			label: t(Messages.settings.appearance.options.textSize.small.label),
			description: t(
				Messages.settings.appearance.options.textSize.small.description,
			),
			preview: <TextSizePreview size="small" />,
		},
		{
			value: "default" as const,
			label: t(Messages.settings.appearance.options.textSize.default.label),
			description: t(
				Messages.settings.appearance.options.textSize.default.description,
			),
			preview: <TextSizePreview size="default" />,
		},
		{
			value: "large" as const,
			label: t(Messages.settings.appearance.options.textSize.large.label),
			description: t(
				Messages.settings.appearance.options.textSize.large.description,
			),
			preview: <TextSizePreview size="large" />,
		},
	];
}

function getMotionOptions(t: TypedMessageTranslator) {
	return [
		{
			value: "system" as const,
			label: t(Messages.settings.appearance.options.motion.system.label),
			description: t(
				Messages.settings.appearance.options.motion.system.description,
			),
			preview: <MotionPreview reduced={false} />,
		},
		{
			value: "reduced" as const,
			label: t(Messages.settings.appearance.options.motion.reduced.label),
			description: t(
				Messages.settings.appearance.options.motion.reduced.description,
			),
			preview: <MotionPreview reduced />,
		},
	];
}

function getWorkspaceLayoutOptions(t: TypedMessageTranslator) {
	return [
		{
			value: "sidebar" as const,
			label: t(Messages.settings.appearance.options.layout.sidebar.label),
			description: t(
				Messages.settings.appearance.options.layout.sidebar.description,
			),
			preview: <SidebarLayoutPreview />,
		},
		{
			value: "centered-header" as const,
			label: t(
				Messages.settings.appearance.options.layout.centeredHeader.label,
			),
			description: t(
				Messages.settings.appearance.options.layout.centeredHeader.description,
			),
			preview: <CenteredLayoutPreview />,
		},
	];
}

function SidebarLayoutPreview() {
	return (
		<span
			aria-hidden="true"
			className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted text-primary"
		>
			<PanelLeftIcon className="size-4" />
		</span>
	);
}

function CenteredLayoutPreview() {
	return (
		<span
			aria-hidden="true"
			className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted text-primary"
		>
			<PanelTopIcon className="size-4" />
		</span>
	);
}

const fontPreviewFamily: Record<FontFamily, string> = {
	inter: "var(--font-inter), ui-sans-serif, sans-serif",
	geist: "var(--font-geist-sans), ui-sans-serif, sans-serif",
	system: "system-ui, sans-serif",
	arial: "Arial, Helvetica, sans-serif",
	serif: "Georgia, serif",
	monospace: "ui-monospace, monospace",
};

function FontPreview({ font }: { font: FontFamily }) {
	return (
		<span
			aria-hidden="true"
			className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted text-sm font-semibold text-foreground"
			style={{ fontFamily: fontPreviewFamily[font] }}
		>
			Aa
		</span>
	);
}

function TextSizePreview({ size }: { size: TextSize }) {
	const scale = {
		small: "text-xs",
		default: "text-sm",
		large: "text-base",
	}[size];
	return (
		<span
			aria-hidden="true"
			className={`grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted font-semibold text-foreground ${scale}`}
		>
			Ag
		</span>
	);
}

function MotionPreview({ reduced }: { reduced: boolean }) {
	return (
		<span
			aria-hidden="true"
			className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted"
		>
			<span className="grid w-4 gap-compact">
				<span className="h-1 rounded-full bg-muted-foreground" />
				<span
					className={`h-1 w-2 rounded-full bg-primary ${reduced ? "ml-2" : ""}`}
				/>
			</span>
		</span>
	);
}

function PreferenceSelect<Value extends string>({
	id,
	label,
	value,
	options,
	onChange,
}: {
	id: string;
	label: string;
	value: Value;
	options: {
		value: Value;
		label: string;
		description: string;
		preview?: ReactNode;
	}[];
	onChange: (value: Value) => void;
}) {
	const selected = options.find((option) => option.value === value);

	return (
		<div className="oncf-field min-w-0">
			<Label htmlFor={id}>{label}</Label>
			<Select
				value={value}
				onValueChange={(nextValue) => {
					const option = options.find((item) => item.value === nextValue);
					if (option) onChange(option.value);
				}}
			>
				<SelectTrigger id={id} className="w-full min-w-0">
					<SelectValue>
						{selected?.preview}
						<span className="truncate">{selected?.label}</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent
					align="start"
					alignItemWithTrigger={false}
					className="max-w-[calc(100vw-2rem)]"
				>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.preview}
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="min-h-8 line-clamp-2 text-meta text-muted-foreground">
				{selected?.description}
			</p>
		</div>
	);
}

export type SettingsSection = "appearance" | "profile" | "security";

export function SettingsPanel({ section }: { section?: SettingsSection } = {}) {
	const t = useTranslate();
	const locale = useLocale();
	const { profile, setProfile } = useAuth();
	const {
		preferences,
		setTheme,
		setFontFamily,
		setTextSize,
		setMotion,
		setWorkspaceLayout,
	} = useAppearance();
	const profileMutation = useProfileControllerUpdate();
	const passwordMutation = useAuthControllerChangePassword();
	const themeOptions = useMemo(() => getThemeOptions(t), [t]);
	const fontOptions = useMemo(() => getFontOptions(t), [t]);
	const textSizeOptions = useMemo(() => getTextSizeOptions(t), [t]);
	const motionOptions = useMemo(() => getMotionOptions(t), [t]);
	const workspaceLayoutOptions = useMemo(
		() => getWorkspaceLayoutOptions(t),
		[t],
	);
	const [firstName, setFirstName] = useState(profile.firstName);
	const [lastName, setLastName] = useState(profile.lastName);
	const [email, setEmail] = useState(profile.email);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [profileMessage, setProfileMessage] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");
	const [profileError, setProfileError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordMismatch, setPasswordMismatch] = useState(false);

	const profileIsDirty =
		firstName.trim() !== profile.firstName ||
		lastName.trim() !== profile.lastName ||
		email.trim() !== profile.email;
	const passwordFormIsValid =
		currentPassword.length > 0 &&
		isStrongPassword(newPassword) &&
		newPassword === confirmNewPassword;

	useEffect(() => {
		setFirstName(profile.firstName);
		setLastName(profile.lastName);
		setEmail(profile.email);
	}, [profile.firstName, profile.lastName, profile.email]);

	function clearProfileFeedback() {
		setProfileMessage("");
		setProfileError("");
	}

	function saveProfile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setProfileMessage("");
		setProfileError("");
		profileMutation.mutate(
			{
				data: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim(),
				},
			},
			{
				onSuccess: (updatedProfile) => {
					setProfile(updatedProfile);
					setProfileMessage(t(Messages.settings.profile.saved));
				},
				onError: (error) =>
					setProfileError(
						getFormErrorMessage(error, locale) ??
							t(Messages.settings.feedback.requestFailed),
					),
			},
		);
	}

	function changePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPasswordMessage("");
		setPasswordError("");
		setPasswordMismatch(false);
		if (!isStrongPassword(newPassword)) {
			setPasswordError(t(Messages.auth.passwordHint));
			document.getElementById("new-password")?.focus();
			return;
		}
		if (newPassword !== confirmNewPassword) {
			setPasswordMismatch(true);
			document.getElementById("confirm-new-password")?.focus();
			return;
		}
		passwordMutation.mutate(
			{ data: { currentPassword, newPassword } },
			{
				onSuccess: ({ code }) => {
					setCurrentPassword("");
					setNewPassword("");
					setConfirmNewPassword("");
					setPasswordMessage(
						translateApiResponse(code, locale) ??
							t(Messages.settings.security.passwordChanged),
					);
				},
				onError: (error) =>
					setPasswordError(
						getFormErrorMessage(error, locale) ??
							t(Messages.settings.feedback.requestFailed),
					),
			},
		);
	}

	return (
		<div className="grid max-w-5xl gap-6">
			{!section && (
				<nav
					aria-label={t(Messages.settings.sections.label)}
					className="flex flex-wrap gap-control pb-4"
				>
					<a
						className="flex min-h-11 shrink-0 items-center rounded-md border px-control text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						href="#appearance"
					>
						{t(Messages.settings.sections.appearance)}
					</a>
					<a
						className="flex min-h-11 shrink-0 items-center rounded-md border px-control text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						href="#account"
					>
						{t(Messages.settings.sections.profile)}
					</a>
					<a
						className="flex min-h-11 shrink-0 items-center rounded-md border px-control text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						href="#security"
					>
						{t(Messages.settings.sections.security)}
					</a>
				</nav>
			)}
			{(!section || section === "appearance") && (
				<Card
					id="appearance"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>{t(Messages.settings.appearance.title)}</CardTitle>
						<CardDescription>
							{t(Messages.settings.appearance.description)}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-4 @2xl/settings:grid-cols-2">
							<div className="grid content-start gap-4">
								<PreferenceSelect
									id="appearance-theme"
									label={t(Messages.settings.appearance.theme)}
									value={preferences.theme}
									options={themeOptions}
									onChange={setTheme}
								/>
								<PreferenceSelect
									id="appearance-workspace-layout"
									label={t(Messages.settings.appearance.layout)}
									value={preferences.workspaceLayout}
									options={workspaceLayoutOptions}
									onChange={setWorkspaceLayout}
								/>
							</div>
							<div className="grid content-start gap-4">
								<PreferenceSelect
									id="appearance-font"
									label={t(Messages.settings.appearance.font)}
									value={preferences.fontFamily}
									options={fontOptions}
									onChange={setFontFamily}
								/>
								<PreferenceSelect
									id="appearance-text-size"
									label={t(Messages.settings.appearance.textSize)}
									value={preferences.textSize}
									options={textSizeOptions}
									onChange={setTextSize}
								/>
								<PreferenceSelect
									id="appearance-motion"
									label={t(Messages.settings.appearance.motion)}
									value={preferences.motion}
									options={motionOptions}
									onChange={setMotion}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{(!section || section === "profile") && (
				<Card
					id="account"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>{t(Messages.settings.profile.title)}</CardTitle>
						<CardDescription>
							{t(Messages.settings.profile.description)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
							{profile.customerId !== null && (
								<div className="oncf-field min-w-0 sm:col-span-2">
									<p className="text-sm font-medium">
										{t(Messages.settings.profile.customerAccount)}
									</p>
									<div className="grid min-h-11 min-w-0 gap-1 rounded-md border border-input bg-background px-field py-control shadow-xs">
										<span className="truncate text-sm font-medium">
											{profile.customerName ??
												t(
													Messages.settings.profile.customerAccountCodeFallback,
													{
														id: profile.customerId,
													},
												)}
										</span>
										{profile.customerCode && (
											<span className="text-meta text-muted-foreground">
												{t(Messages.settings.profile.customerCode, {
													code: profile.customerCode,
												})}
											</span>
										)}
									</div>
								</div>
							)}
							<div className="oncf-field">
								<Label htmlFor="settings-first-name">
									{t(Messages.settings.profile.firstName)}
								</Label>
								<Input
									id="settings-first-name"
									value={firstName}
									placeholder={t(
										Messages.settings.profile.firstNamePlaceholder,
									)}
									autoComplete="given-name"
									required
									onChange={(event) => {
										setFirstName(event.target.value);
										clearProfileFeedback();
									}}
								/>
							</div>
							<div className="oncf-field">
								<Label htmlFor="settings-last-name">
									{t(Messages.settings.profile.lastName)}
								</Label>
								<Input
									id="settings-last-name"
									value={lastName}
									placeholder={t(Messages.settings.profile.lastNamePlaceholder)}
									autoComplete="family-name"
									required
									onChange={(event) => {
										setLastName(event.target.value);
										clearProfileFeedback();
									}}
								/>
							</div>
							<div className="oncf-field sm:col-span-2">
								<Label htmlFor="settings-email">
									{t(Messages.settings.profile.email)}
								</Label>
								<Input
									id="settings-email"
									type="email"
									value={email}
									placeholder={t(Messages.settings.profile.emailPlaceholder)}
									autoComplete="email"
									required
									onChange={(event) => {
										setEmail(event.target.value);
										clearProfileFeedback();
									}}
								/>
							</div>
							<div className="flex flex-wrap items-center gap-4 sm:col-span-2">
								<Button
									type="submit"
									disabled={!profileIsDirty || profileMutation.isPending}
								>
									{profileMutation.isPending
										? t(Messages.settings.profile.saving)
										: t(Messages.settings.profile.save)}
								</Button>
								<Button
									type="button"
									variant="ghost"
									disabled={!profileIsDirty || profileMutation.isPending}
									onClick={() => {
										setFirstName(profile.firstName);
										setLastName(profile.lastName);
										setEmail(profile.email);
										setProfileMessage("");
										setProfileError("");
									}}
								>
									{t(Messages.settings.profile.discard)}
								</Button>
								{profileMessage && (
									<p role="status" className="text-sm text-primary">
										{profileMessage}
									</p>
								)}
								{profileError && (
									<p role="alert" className="text-sm text-destructive">
										{profileError}
									</p>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{(!section || section === "security") && (
				<Card
					id="security"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>{t(Messages.settings.security.title)}</CardTitle>
						<CardDescription>
							{t(Messages.settings.security.description)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={changePassword} className="grid max-w-xl gap-4">
							<div className="oncf-field">
								<Label htmlFor="current-password">
									{t(Messages.settings.security.currentPassword)}
								</Label>
								<Input
									id="current-password"
									type="password"
									placeholder={t(Messages.settings.security.currentPassword)}
									autoComplete="current-password"
									value={currentPassword}
									required
									onChange={(event) => setCurrentPassword(event.target.value)}
								/>
							</div>
							<div className="oncf-field">
								<Label htmlFor="new-password">
									{t(Messages.settings.security.newPassword)}
								</Label>
								<Input
									id="new-password"
									type="password"
									placeholder={t(Messages.settings.security.newPassword)}
									aria-describedby="new-password-help"
									autoComplete="new-password"
									minLength={8}
									value={newPassword}
									required
									onChange={(event) => {
										setNewPassword(event.target.value);
										setPasswordMismatch(
											confirmNewPassword.length > 0 &&
												confirmNewPassword !== event.target.value,
										);
									}}
								/>
								<p
									id="new-password-help"
									className="text-sm text-muted-foreground"
								>
									{t(Messages.auth.passwordHint)}
								</p>
							</div>
							<div className="oncf-field">
								<Label htmlFor="confirm-new-password">
									{t(Messages.settings.security.confirmPassword)}
								</Label>
								<Input
									id="confirm-new-password"
									type="password"
									placeholder={t(Messages.settings.security.confirmPassword)}
									autoComplete="new-password"
									value={confirmNewPassword}
									aria-invalid={passwordMismatch}
									aria-describedby={
										passwordMismatch ? "confirm-new-password-error" : undefined
									}
									required
									onChange={(event) => {
										setConfirmNewPassword(event.target.value);
										setPasswordMismatch(
											newPassword.length > 0 &&
												newPassword !== event.target.value,
										);
									}}
								/>
								{passwordMismatch && (
									<p
										id="confirm-new-password-error"
										className="text-sm text-destructive"
										role="alert"
									>
										{t(Messages.settings.security.passwordMismatch)}
									</p>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<Button
									type="submit"
									disabled={passwordMutation.isPending || !passwordFormIsValid}
								>
									{passwordMutation.isPending
										? t(Messages.settings.security.updating)
										: t(Messages.settings.security.changePassword)}
								</Button>
								{passwordMessage && (
									<p role="status" className="text-sm text-primary">
										{passwordMessage}
									</p>
								)}
								{passwordError && (
									<p role="alert" className="text-sm text-destructive">
										{passwordError}
									</p>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
