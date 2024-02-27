"use client";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase } from "@refinedev/core";
import { cn } from "@utility/classNames";
import styles from "./auth-page.module.css";

export const AuthPage = (props: AuthPageProps) => {
  return (
    <AuthPageBase
      {...props}
      wrapperProps={{
        className: cn("w-screen h-screen flex items-center justify-center"),
      }}
      contentProps={{
        className: cn(
          `w-full max-w-sm`,
          "border border-gray-200 rounded-lg",
          "shadow-xl shadow-black/5",
          styles.form
        ),
      }}
    />
  );
};
