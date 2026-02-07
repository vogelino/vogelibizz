import { StartServer } from "@tanstack/react-start/server";
import { loadDotEnv } from "@/utility/loadDotEnv";

loadDotEnv();

const { getRouter } = await import("./router");

export default function render() {
	const router = getRouter();
	return <StartServer router={router} />;
}
