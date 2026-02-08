import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type db from "@/db";
import {
	currencyEnum,
	type expenseCategoryEnum,
	type expenseRateEnum,
	type expenseTypeEnum,
	expenses as schema,
} from "../schema";
import expensesSeedData from "./data/expensesSeedData";

type ExpenseCategory = (typeof expenseCategoryEnum.enumValues)[number];
type ExpenseRate = (typeof expenseRateEnum.enumValues)[number];
type ExpenseType = (typeof expenseTypeEnum.enumValues)[number];
type CurrencyCode = (typeof currencyEnum.enumValues)[number];

const categoryMap: Record<string, ExpenseCategory> = {
	"Art & Design": "Software",
	"Developer Tools": "Software",
	"Cloud Storage": "Software",
	Streaming: "Entertainment",
	Internet: "Home",
	Productivity: "Services",
	Communication: "Home",
	"Health & Fitness": "Health & Wellbeing",
	Travel: "Travel",
	Utilities: "Essentials",
};

const typeOverrideMap: Record<string, ExpenseType> = {
	"Developer Tools": "Freelance",
	Productivity: "Freelance",
};

const billingCycleMap: Record<string, ExpenseRate> = {
	Month: "Monthly",
	Year: "Yearly",
};

const defaultCategory: ExpenseCategory = "Services";
const defaultType: ExpenseType = "Personal";
const defaultRate: ExpenseRate = "Monthly";
const defaultCurrency: CurrencyCode = "USD";

export async function seedExpenses(db: db) {
	const orbitExpenses = parseOrbitSubscriptions();
	await db.insert(schema).values([...expensesSeedData, ...orbitExpenses]);
}

function parseOrbitSubscriptions() {
	const filePath = fileURLToPath(
		new URL(
			"../../../db-data/Orbit_Subscriptions_2026-02-08.csv",
			import.meta.url,
		),
	);
	const raw = readFileSync(filePath, "utf8");
	const lines = raw.split(/\r?\n/);

	const subscriptionsIndex = lines.findIndex((line) =>
		line.trim().startsWith("# Subscriptions"),
	);
	if (subscriptionsIndex === -1) {
		return [];
	}

	const headerIndex = subscriptionsIndex + 1;
	const headerLine = lines[headerIndex] ?? "";
	const headers = parseCsvLine(headerLine);
	const nameIndex = headers.indexOf("name");
	const categoryIndex = headers.indexOf("category");
	const priceIndex = headers.indexOf("price");
	const billingIndex = headers.indexOf("billing_cycle");
	const currencyIndex = headers.indexOf("currency_code");
	if (
		nameIndex === -1 ||
		categoryIndex === -1 ||
		priceIndex === -1 ||
		billingIndex === -1 ||
		currencyIndex === -1
	) {
		return [];
	}

	const rows = lines.slice(headerIndex + 1).filter((line) => {
		const trimmed = line.trim();
		return trimmed && !trimmed.startsWith("#");
	});

	return rows.map((line) => {
		const fields = parseCsvLine(line);
		const name = fields[nameIndex] ?? "Subscription";
		const category = fields[categoryIndex] ?? "";
		const priceRaw = fields[priceIndex] ?? "0";
		const billing = fields[billingIndex] ?? "";
		const currency = fields[currencyIndex] ?? "";
		const mappedCategory = categoryMap[category] ?? defaultCategory;
		const mappedType = typeOverrideMap[category] ?? defaultType;
		const mappedRate = billingCycleMap[billing] ?? defaultRate;
		const parsedPrice = Number.parseFloat(priceRaw);
		const originalPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
		const matchedCurrency = currencyEnum.enumValues.find(
			(value) => value === currency,
		);
		const originalCurrency = matchedCurrency ?? defaultCurrency;

		return {
			name,
			category: mappedCategory,
			type: mappedType,
			rate: mappedRate,
			originalPrice,
			originalCurrency,
		};
	});
}

function parseCsvLine(line: string) {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];
		if (char === '"') {
			const nextChar = line[i + 1];
			if (inQuotes && nextChar === '"') {
				current += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}
		if (char === "," && !inQuotes) {
			result.push(current);
			current = "";
			continue;
		}
		current += char;
	}
	result.push(current);
	return result.map((value) => value.trim());
}
