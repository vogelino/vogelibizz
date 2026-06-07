import clientsSeedData from "../src/db/seeds/data/clientsSeedData";
import settingsSeedData from "../src/db/seeds/data/settingsSeedData";

const currencyEnumValues = [
	"CLF",
	"CLP",
	"EUR",
	"CHF",
	"USD",
	"JPY",
	"GBP",
	"CNY",
	"AUD",
	"CAD",
	"HKD",
	"SGD",
	"SEK",
	"KRW",
	"NOK",
	"NZD",
	"INR",
	"MXN",
	"TWD",
	"ZAR",
	"BRL",
	"DKK",
	"PLN",
	"THB",
	"ILS",
	"IDR",
	"CZK",
	"AED",
	"TRY",
	"HUF",
	"SAR",
	"PHP",
	"MYR",
	"COP",
	"RUB",
	"RON",
	"PEN",
	"BHD",
	"BGN",
	"ARS",
] as const;

const expenseCategoryEnumValues = [
	"Essentials",
	"Home",
	"Domain",
	"Health & Wellbeing",
	"Entertainment",
	"Charity",
	"Present",
	"Services",
	"Hardware",
	"Software",
	"Hobby",
	"Savings",
	"Transport",
	"Travel",
	"Administrative",
] as const;

const expenseTypeEnumValues = ["Personal", "Freelance"] as const;

const expenseRateEnumValues = [
	"Monthly",
	"Daily",
	"Hourly",
	"Weekly",
	"Yearly",
	"Quarterly",
	"Semester",
	"Bi-Weekly",
	"Bi-Monthly",
	"Bi-Yearly",
	"Tri-Yearly",
	"One-time",
] as const;

const projectStatusEnumValues = [
	"todo",
	"active",
	"paused",
	"done",
	"cancelled",
	"negotiating",
	"waiting_for_feedback",
] as const;

const now = "2000-01-01T00:00:00.000Z";

const projectsSeedData = [
	{
		name: "Project 1",
		description: "Project 1 description",
		status: projectStatusEnumValues[0],
		content: "Project 1 content",
		clients: [clientsSeedData[0], clientsSeedData[1]],
		invoices: [
			{ name: "Invoice 1", date: "2022-01-01" },
			{ name: "Invoice 2", date: "2022-02-01" },
		],
		quotes: [{ name: "Quote 1", date: "2022-01-01" }],
	},
	{
		name: "Project 2",
		description: "Project 2 description",
		status: projectStatusEnumValues[1],
		content: "Project 2 content",
		clients: [clientsSeedData[2]],
		invoices: [{ name: "Invoice 3", date: "2022-03-01" }],
		quotes: [
			{ name: "Quote 2", date: "2022-02-01" },
			{ name: "Quote 3", date: "2022-03-01" },
		],
	},
	{
		name: "Project 3",
		description: "Project 3 description",
		status: projectStatusEnumValues[2],
		content: "Project 3 content",
		clients: [clientsSeedData[0], clientsSeedData[2]],
		invoices: [
			{ name: "Invoice 4", date: "2022-01-01" },
			{ name: "Invoice 5", date: "2022-02-01" },
		],
		quotes: [
			{ name: "Quote 4", date: "2022-04-01" },
			{ name: "Quote 5", date: "2022-05-01" },
		],
	},
];

const invoicesSeedData = Array.from(
	new Map(
		projectsSeedData.flatMap((project) =>
			project.invoices.map((invoice) => [invoice.name, invoice] as const),
		),
	).values(),
);

const quotesSeedData = Array.from(
	new Map(
		projectsSeedData.flatMap((project) =>
			project.quotes.map((quote) => [quote.name, quote] as const),
		),
	).values(),
);

const expensesSeedData = Array.from({ length: 50 }, (_, index) => {
	const category =
		expenseCategoryEnumValues[index % expenseCategoryEnumValues.length];
	const type = expenseTypeEnumValues[index % expenseTypeEnumValues.length];
	const rate = expenseRateEnumValues[index % expenseRateEnumValues.length];
	const currency =
		currencyEnumValues[index % currencyEnumValues.length];
	return {
		name: `Expense ${index + 1}`,
		category,
		type,
		rate,
		originalPrice: 1000 + index * 10,
		originalCurrency: currency,
	};
});

function sqlString(value: string | null | undefined) {
	if (value === null || value === undefined) return "NULL";
	return `'${value.replace(/'/g, "''")}'`;
}

function insertRow(table: string, columns: string[], values: Array<string>) {
	return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(
		", ",
	)});`;
}

const sqlLines: string[] = [];

sqlLines.push("PRAGMA foreign_keys=OFF;");
sqlLines.push("DELETE FROM projects_to_clients;");
sqlLines.push("DELETE FROM projects_to_invoices;");
sqlLines.push("DELETE FROM projects_to_quotes;");
sqlLines.push("DELETE FROM expenses;");
sqlLines.push("DELETE FROM invoices;");
sqlLines.push("DELETE FROM quotes;");
sqlLines.push("DELETE FROM projects;");
sqlLines.push("DELETE FROM clients;");
sqlLines.push("DELETE FROM currencies;");
sqlLines.push("DELETE FROM settings;");

for (const currency of currencyEnumValues) {
	sqlLines.push(
		insertRow(
			"currencies",
			["original_currency", "created_at", "last_modified", "usdRate"],
			[sqlString(currency), sqlString(now), sqlString(now), "0.0"],
		),
	);
}

const settings = settingsSeedData[0];
sqlLines.push(
	insertRow(
		"settings",
		[
			"company_display_name",
			"target_currency",
			"company_legal_name",
			"company_svg_logo_string",
			"company_svg_icon_string",
			"company_tax_id",
			"company_street_name",
			"company_street_number",
			"company_district",
			"company_country_code",
			"company_email",
			"company_phone",
			"company_website",
			"company_bank_owner",
			"company_bank_name",
			"company_bank_account_number",
			"company_bank_address",
			"company_bank_swift_code",
			"company_default_hourly_rate",
		],
		[
			sqlString(settings.companyDisplayName),
			sqlString(settings.targetCurrency),
			sqlString(settings.companyLegalName),
			sqlString(settings.companySvgLogoString),
			sqlString(settings.companySvgIconString),
			sqlString(settings.companyTaxId),
			sqlString(settings.companyStreetName),
			sqlString(settings.companyStreetNumber),
			sqlString(settings.companyDistrict),
			sqlString(settings.companyCountryCode),
			sqlString(settings.companyEmail),
			sqlString(settings.companyPhone),
			sqlString(settings.companyWebsite),
			sqlString(settings.companyBankOwner),
			sqlString(settings.companyBankName),
			sqlString(settings.companyBankAccountNumber),
			sqlString(settings.companyBankAddress),
			sqlString(settings.companyBankSwiftCode),
			String(settings.companyDefaultHourlyRate),
		],
	),
);

clientsSeedData.forEach((client, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"clients",
			[
				"id",
				"name",
				"legal_name",
				"address_line_1",
				"address_line_2",
				"address_line_3",
				"tax_id",
				"svg_logo_string",
				"svg_icon_string",
				"created_at",
				"last_modified",
			],
			[
				String(id),
				sqlString(client.name),
				sqlString(client.legalName),
				sqlString(client.addressLine1),
				sqlString(client.addressLine2),
				sqlString(client.addressLine3),
				sqlString(client.taxId),
				sqlString(client.svgLogoString),
				sqlString(client.svgIconString),
				sqlString(now),
				sqlString(now),
			],
		),
	);
});

invoicesSeedData.forEach((invoice, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"invoices",
			["id", "name", "date", "created_at", "last_modified"],
			[
				String(id),
				sqlString(invoice.name),
				sqlString(invoice.date),
				sqlString(now),
				sqlString(now),
			],
		),
	);
});

quotesSeedData.forEach((quote, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"quotes",
			["id", "name", "date", "created_at", "last_modified"],
			[
				String(id),
				sqlString(quote.name),
				sqlString(quote.date),
				sqlString(now),
				sqlString(now),
			],
		),
	);
});

projectsSeedData.forEach((project, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"projects",
			[
				"id",
				"name",
				"description",
				"status",
				"content",
				"created_at",
				"last_modified",
			],
			[
				String(id),
				sqlString(project.name),
				sqlString(project.description),
				sqlString(project.status),
				sqlString(project.content),
				sqlString(now),
				sqlString(now),
			],
		),
	);
});

expensesSeedData.forEach((expense, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"expenses",
			[
				"id",
				"name",
				"category",
				"type",
				"rate",
				"original_price",
				"original_currency",
				"created_at",
				"last_modified",
			],
			[
				String(id),
				sqlString(expense.name),
				sqlString(expense.category),
				sqlString(expense.type),
				sqlString(expense.rate),
				String(expense.originalPrice),
				sqlString(expense.originalCurrency),
				sqlString(now),
				sqlString(now),
			],
		),
	);
});

projectsSeedData.forEach((project, projectIndex) => {
	const projectId = projectIndex + 1;

	project.clients.forEach((client) => {
		const clientId = clientsSeedData.findIndex((c) => c.name === client.name) + 1;
		sqlLines.push(
			insertRow(
				"projects_to_clients",
				["project_id", "client_id"],
				[String(projectId), String(clientId)],
			),
		);
	});

	project.invoices.forEach((invoice) => {
		const invoiceId = invoicesSeedData.findIndex(
			(i) => i.name === invoice.name,
		) + 1;
		sqlLines.push(
			insertRow(
				"projects_to_invoices",
				["project_id", "invoice_id"],
				[String(projectId), String(invoiceId)],
			),
		);
	});

	project.quotes.forEach((quote) => {
		const quoteId = quotesSeedData.findIndex((q) => q.name === quote.name) + 1;
		sqlLines.push(
			insertRow(
				"projects_to_quotes",
				["project_id", "quote_id"],
				[String(projectId), String(quoteId)],
			),
		);
	});
});

sqlLines.push("PRAGMA foreign_keys=ON;");

const sql = `${sqlLines.join("\n")}\n`;

await Bun.write(
	"/Users/lucasvogel/repos/vogelibizz/src/db/seeds/seed-full.sql",
	sql,
);
