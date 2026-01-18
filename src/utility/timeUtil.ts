import { formatISO, subMinutes } from "date-fns";

export function getNowInUTC() {
	const now = new Date();
	const utcNow = subMinutes(now, now.getTimezoneOffset());
	return formatISO(utcNow);
}
