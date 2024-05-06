import type { ExpenseType } from "@/db/schema";
import { Handshake, ListChecks, type LucideIcon, User } from "lucide-react";
import type { ReactNode } from "react";

type TailwindColorType = string;

export const categoryToColorClass = (
	category: ExpenseType["category"],
): TailwindColorType => {
	switch (category) {
		case "Charity":
			return "bg-red-500/5 border-red-500/20 text-red-700 dark:text-grayDark";
		case "Transport":
			return "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-grayDark";
		case "Domain":
			return "bg-green-500/5 border-green-500/20 text-green-700 dark:text-grayDark";
		case "Entertainment":
			return "bg-yellow-500/5 border-yellow-500/20 text-yellow-700 dark:text-grayDark";
		case "Essentials":
			return "bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-grayDark";
		case "Hardware":
			return "bg-pink-500/5 border-pink-500/20 text-pink-700 dark:text-grayDark";
		case "Health & Wellbeing":
			return "bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-grayDark";
		case "Hobby":
			return "bg-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-grayDark";
		case "Home":
			return "bg-gray-500/5 border-gray-500/20 text-gray-700 dark:text-grayDark";
		case "Present":
			return "bg-teal-500/5 border-teal-500/20 text-teal-700 dark:text-grayDark";
		case "Savings":
			return "bg-lime-500/5 border-lime-500/20 text-lime-700 dark:text-grayDark";
		case "Services":
			return "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-grayDark";
		case "Software":
			return "bg-violet-500/5 border-violet-500/20 text-violet-700 dark:text-grayDark";
		case "Travel":
			return "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-grayDark";
		case "Administrative":
			return "bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-grayDark";
		default:
			return "inherit";
	}
};

export const categoryToOptionClass = <
	CatType extends string = ExpenseType["category"],
>(
	category: CatType,
): TailwindColorType => {
	switch (category) {
		case "Charity":
			return "bg-red-500";
		case "Transport":
			return "bg-blue-500";
		case "Domain":
			return "bg-green-500";
		case "Entertainment":
			return "bg-yellow-500";
		case "Essentials":
			return "bg-purple-500";
		case "Hardware":
			return "bg-pink-500";
		case "Health & Wellbeing":
			return "bg-orange-500";
		case "Hobby":
			return "bg-indigo-500";
		case "Home":
			return "bg-gray-500";
		case "Present":
			return "bg-teal-500";
		case "Savings":
			return "bg-lime-500";
		case "Services":
			return "bg-amber-500";
		case "Software":
			return "bg-violet-500";
		case "Travel":
			return "bg-emerald-500";
		case "Administrative":
			return "bg-sky-500";
		default:
			return "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500";
	}
};

export const typeToColorClass = <CatType extends string = ExpenseType["type"]>(
	type: CatType,
): TailwindColorType => {
	switch (type) {
		case "Freelance":
			return "bg-red-500/5 text-red-500/90 border-red-500/20";
		case "Personal":
			return "bg-blue-500/5 text-blue-500/90 border-blue-500/20";
		default:
			return "inherit";
	}
};

const typeToOptionClass = <CatType extends string = ExpenseType["type"]>(
	type: CatType,
	lighter = true,
): TailwindColorType => {
	switch (type) {
		case "Freelance":
			return lighter ? "text-red-500/75" : "text-red-500";
		case "Personal":
			return lighter ? "text-blue-500/75" : "text-blue-500";
		default:
			return "inherit";
	}
};

type IconKeyType = ExpenseType["type"] | "All types";
const typeToIconMap: Record<IconKeyType, LucideIcon> = {
	"All types": ListChecks,
	Freelance: Handshake,
	Personal: User,
};

export const mapTypeToIcon = (type: IconKeyType, size = 16): ReactNode => {
	const Icon = typeToIconMap[type] || (() => null);
	return <Icon size={size} className={typeToOptionClass(type, false)} />;
};
