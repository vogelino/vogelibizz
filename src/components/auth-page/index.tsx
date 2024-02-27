"use client";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase } from "@refinedev/core";

export const AuthPage = (props: AuthPageProps) => {
  return (
    <AuthPageBase
      {...props}
      renderContent={(content) => (
        <div>
          <p
            style={{
              padding: 10,
              color: "#004085",
              backgroundColor: "#cce5ff",
              borderColor: "#b8daff",
              textAlign: "center",
            }}
          >
            email: info@refine.dev
            <br /> password: refine-supabase
          </p>
          {content}
        </div>
      )}
    />
  );
};
