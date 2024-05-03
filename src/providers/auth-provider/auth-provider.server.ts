import type { AuthBindings } from "@refinedev/core";
import { cookies } from "next/headers";

export const authProviderServer: Pick<AuthBindings, "check"> = {
  check: async () => {
    const cookieStore = cookies();
    const auth = cookieStore.get("token");

    if (auth) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
