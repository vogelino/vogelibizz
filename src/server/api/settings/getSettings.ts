import db from "@/db";

export async function getSettings() {
	const settings = await db.query.settings.findFirst();
	if (!settings) {
		throw new Error("Settings not found");
	}
	return settings;
}
