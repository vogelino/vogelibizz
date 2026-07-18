import {
	Banknote,
	CarFront,
	CircleDollarSign,
	ClipboardList,
	Code2,
	Cpu,
	CreditCard,
	Ellipsis,
	Film,
	Gift,
	Globe,
	Handshake,
	HeartHandshake,
	HeartPulse,
	House,
	Landmark,
	ListChecks,
	type LucideIcon,
	Package,
	Palette,
	PiggyBank,
	Plane,
	ShoppingBag,
	ShoppingBasket,
	User,
	Utensils,
	Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ExpenseType } from "@/db/schema";

type TailwindColorType = string;

export const categoryToColorClass = (
	category: ExpenseType["category"],
): TailwindColorType => {
	switch (category) {
		case "Charity":
			return "bg-red-500/5 border-red-500/20 text-red-700 dark:text-muted-foreground";
		case "Transport":
			return "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-muted-foreground";
		case "Domain":
			return "bg-green-500/5 border-green-500/20 text-green-700 dark:text-muted-foreground";
		case "Entertainment":
			return "bg-yellow-500/5 border-yellow-500/20 text-yellow-700 dark:text-muted-foreground";
		case "Essentials":
			return "bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-muted-foreground";
		case "Hardware":
			return "bg-pink-500/5 border-pink-500/20 text-pink-700 dark:text-muted-foreground";
		case "Health & Wellbeing":
			return "bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-muted-foreground";
		case "Hobby":
			return "bg-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-muted-foreground";
		case "Home":
			return "bg-gray-500/5 border-gray-500/20 text-gray-700 dark:text-muted-foreground";
		case "Present":
			return "bg-teal-500/5 border-teal-500/20 text-teal-700 dark:text-muted-foreground";
		case "Savings":
			return "bg-lime-500/5 border-lime-500/20 text-lime-700 dark:text-muted-foreground";
		case "Services":
			return "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-muted-foreground";
		case "Software":
			return "bg-violet-500/5 border-violet-500/20 text-violet-700 dark:text-muted-foreground";
		case "Travel":
			return "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-muted-foreground";
		case "Administrative":
			return "bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-muted-foreground";
		case "Dining":
			return "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300";
		case "Groceries":
			return "bg-green-600/5 border-green-600/20 text-green-700 dark:text-green-300";
		case "Shopping":
			return "bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300";
		case "Cash Withdrawal":
			return "bg-slate-500/5 border-slate-500/20 text-slate-700 dark:text-slate-300";
		case "Taxes":
			return "bg-cyan-600/5 border-cyan-600/20 text-cyan-700 dark:text-cyan-300";
		case "Payments":
			return "bg-blue-600/5 border-blue-600/20 text-blue-700 dark:text-blue-300";
		case "Other Income":
			return "bg-emerald-600/5 border-emerald-600/20 text-emerald-700 dark:text-emerald-300";
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
		case "Dining":
			return "bg-rose-500";
		case "Groceries":
			return "bg-green-600";
		case "Shopping":
			return "bg-fuchsia-500";
		case "Cash Withdrawal":
			return "bg-slate-500";
		case "Taxes":
			return "bg-cyan-600";
		case "Payments":
			return "bg-blue-600";
		case "Other Income":
			return "bg-emerald-600";
		default:
			return "bg-linear-to-r from-red-500 via-yellow-500 to-green-500";
	}
};

const categoryToIconMap = {
	Essentials: { Icon: Package, className: "text-purple-500" },
	Home: { Icon: House, className: "text-gray-500" },
	Domain: { Icon: Globe, className: "text-green-500" },
	"Health & Wellbeing": { Icon: HeartPulse, className: "text-orange-500" },
	Entertainment: { Icon: Film, className: "text-yellow-500" },
	Charity: { Icon: HeartHandshake, className: "text-red-500" },
	Present: { Icon: Gift, className: "text-teal-500" },
	Services: { Icon: Wrench, className: "text-amber-500" },
	Hardware: { Icon: Cpu, className: "text-pink-500" },
	Software: { Icon: Code2, className: "text-violet-500" },
	Hobby: { Icon: Palette, className: "text-indigo-500" },
	Savings: { Icon: PiggyBank, className: "text-lime-500" },
	Transport: { Icon: CarFront, className: "text-blue-500" },
	Travel: { Icon: Plane, className: "text-emerald-500" },
	Administrative: { Icon: ClipboardList, className: "text-sky-500" },
	Dining: { Icon: Utensils, className: "text-rose-500" },
	Groceries: { Icon: ShoppingBasket, className: "text-green-600" },
	Shopping: { Icon: ShoppingBag, className: "text-fuchsia-500" },
	"Cash Withdrawal": { Icon: Banknote, className: "text-slate-500" },
	Taxes: { Icon: Landmark, className: "text-cyan-600" },
	Payments: { Icon: CreditCard, className: "text-blue-600" },
	"Other Income": { Icon: CircleDollarSign, className: "text-emerald-600" },
} satisfies Record<
	ExpenseType["category"],
	{ Icon: LucideIcon; className: TailwindColorType }
>;

export const mapCategoryToIcon = (
	category: ExpenseType["category"],
	size = 16,
): ReactNode => {
	const iconConfig = categoryToIconMap[category];
	const { Icon, className } = iconConfig;
	return <Icon size={size} className={className} aria-hidden="true" />;
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
		case "Mixed":
			return lighter ? "text-muted-foreground/75" : "text-muted-foreground";
		default:
			return "inherit";
	}
};

type IconKeyType = ExpenseType["type"] | "All types" | "Mixed";
const typeToIconMap: Record<IconKeyType, LucideIcon> = {
	"All types": ListChecks,
	Freelance: Handshake,
	Personal: User,
	Mixed: Ellipsis,
};

export const mapTypeToIcon = (type: IconKeyType, size = 16): ReactNode => {
	const Icon = typeToIconMap[type] || (() => null);
	return <Icon size={size} className={typeToOptionClass(type, false)} />;
};
