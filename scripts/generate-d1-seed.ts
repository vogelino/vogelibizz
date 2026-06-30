import clientSeeds from "../src/db/seeds/data/clientsSeedData";
import expensesSeedData from "../src/db/seeds/data/expensesSeedData";
import invoicesSeedData from "../src/db/seeds/data/invoicesSeedData";
import projectsSeedData from "../src/db/seeds/data/projectsSeedData";
import quotesSeedData from "../src/db/seeds/data/quotesSeedData";
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

const now = "2000-01-01T00:00:00.000Z";
const seedOutputPath = new URL("../src/db/seeds/seed-full.sql", import.meta.url);

function sqlString(value: string | null | undefined) {
	if (value === null || value === undefined) return "NULL";
	return `'${value.replace(/'/g, "''")}'`;
}

function insertRow(table: string, columns: string[], values: string[]) {
	return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
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

clientSeeds.forEach((client, index) => {
	const id = index + 1;
	sqlLines.push(
		insertRow(
			"clients",
			[
				"id",
				"name",
				"client_number",
				"language",
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
				sqlString(client.clientNumber),
				sqlString(client.language),
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
const clientId = clientSeeds.findIndex((client) => client.name === invoice.clientName) + 1;
sqlLines.push(
insertRow(
"invoices",
[
"id",
"name",
"date",
"client_id",
"invoice_number",
"client_number",
"subject",
"introduction",
"foot_note",
"currency",
"language",
"hourly_rate",
"invoice_location",
"rows",
"created_at",
"last_modified",
],
[
String(id),
sqlString(invoice.name),
sqlString(invoice.date),
String(clientId || 0),
String(invoice.invoiceNumber),
sqlString(invoice.clientNumber),
sqlString(invoice.subject),
sqlString(invoice.introduction),
sqlString(invoice.footNote),
sqlString(invoice.currency),
sqlString(invoice.language),
String(invoice.hourlyRate),
sqlString(invoice.invoiceLocation),
sqlString(JSON.stringify(invoice.rows)),
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
				"hourly_rate",
				"status",
				"content",
				"created_at",
				"last_modified",
			],
			[
				String(id),
				sqlString(project.name),
				sqlString(project.description),
				String(project.hourlyRate),
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
		const clientId = clientSeeds.findIndex((item) => item.name === client.name) + 1;
		sqlLines.push(
			insertRow(
				"projects_to_clients",
				["project_id", "client_id"],
				[String(projectId), String(clientId)],
			),
		);
	});

	project.invoices.forEach((invoice) => {
		const invoiceId =
			invoicesSeedData.findIndex((item) => item.name === invoice.name) + 1;
		sqlLines.push(
			insertRow(
				"projects_to_invoices",
				["project_id", "invoice_id"],
				[String(projectId), String(invoiceId)],
			),
		);
	});

	project.quotes.forEach((quote) => {
		const quoteId = quotesSeedData.findIndex((item) => item.name === quote.name) + 1;
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

await Bun.write(seedOutputPath, `${sqlLines.join("\n")}\n`);
console.log(`Generated ${seedOutputPath.pathname}`);
