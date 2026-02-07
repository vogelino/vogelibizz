import { StartServer } from "@tanstack/react-start/server";
import { getRouter } from "./router";

export default function render() {
	const router = getRouter();
	return <StartServer router={router} />;
}
