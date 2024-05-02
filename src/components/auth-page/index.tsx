"use client";
import BizzLogo from "@components/BizzLogo";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase } from "@refinedev/core";
import { cn } from "@utility/classNames";
import styles from "./auth-page.module.css";

export const AuthPage = (props: AuthPageProps) => {
	return (
		<AuthPageBase
			{...props}
			renderContent={(content) => (
				<div className="flex flex-col gap-4">
					<BizzLogo className="ml-6" />
					{content}
				</div>
			)}
			wrapperProps={{
				className: cn(
					"w-screen h-screen flex items-center justify-center bg-grayUltraLight",
				),
			}}
			contentProps={{
				className: cn(
					`w-full max-w-sm`,
					"border border-grayMed bg-bg",
					styles.form,
				),
			}}
		/>
	);
};
