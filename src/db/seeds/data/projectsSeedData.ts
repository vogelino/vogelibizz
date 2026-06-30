import { type InvoiceInsertType, projectStatusEnum } from "@/db/schema";
import clientSeeds from "./clientsSeedData";

function randomItemFromArray<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function createInvoiceSeedData({
	name,
	date,
	invoiceNumber,
	clientNumber,
	subject,
	introduction,
	rows,
}: {
	name: string;
	date: string;
	invoiceNumber: number;
	clientNumber: string;
	subject: string;
	introduction: string;
	rows: InvoiceInsertType["rows"];
}): InvoiceInsertType {
	return {
		name,
		date,
		invoiceNumber,
		clientNumber,
		subject,
		introduction,
		footNote: "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).",
		currency: "EUR",
		language: "de-DE",
		hourlyRate: 50,
		invoiceLocation: "Santiago",
		rows,
	};
}

const projectsSeedData = [
	{
		name: "Project 1",
		description: "Project 1 description",
		status: randomItemFromArray(projectStatusEnum.enumValues),
		content: "Project 1 content",
		clients: [clientSeeds[0], clientSeeds[1]],
		invoices: [
			createInvoiceSeedData({
				name: "Invoice 1",
				date: "2022-01-01",
				invoiceNumber: 1001,
				clientNumber: "0070",
				subject: "Programming service for Project 1 - January 2022",
				introduction:
					"Dear client,\nI am pleased to present my invoice for the programming services delivered for Project 1 in January 2022. Below you will find the detailed breakdown of the work completed.",
				rows: [
					{ description: "Backend development", hoursCount: 12 },
					{ description: "Bug fixing and QA support", hoursCount: 4 },
				],
			}),
			createInvoiceSeedData({
				name: "Invoice 2",
				date: "2022-02-01",
				invoiceNumber: 1002,
				clientNumber: "0070",
				subject: "Programming service for Project 1 - February 2022",
				introduction:
					"Dear client,\nPlease find attached the invoice covering the February 2022 programming work for Project 1, including implementation and product support.",
				rows: [
					{ description: "Frontend implementation", hoursCount: 10 },
					{ description: "Technical planning", hoursCount: 3 },
					{ description: "Client support", hoursCount: 2 },
				],
			}),
		],
		quotes: [{ name: "Quote 1", date: "2022-01-01" }],
	},
	{
		name: "Project 2",
		description: "Project 2 description",
		status: randomItemFromArray(projectStatusEnum.enumValues),
		content: "Project 2 content",
		clients: [clientSeeds[2]],
		invoices: [
			createInvoiceSeedData({
				name: "Invoice 3",
				date: "2022-03-01",
				invoiceNumber: 1003,
				clientNumber: "0112",
				subject: "Programming service for Project 2 - March 2022",
				introduction:
					"Dear client,\nThis invoice summarizes the software development work delivered for Project 2 during March 2022.",
				rows: [
					{ description: "API integrations", hoursCount: 14 },
					{ description: "Deployment support", hoursCount: 3 },
				],
			}),
		],
		quotes: [
			{ name: "Quote 2", date: "2022-02-01" },
			{ name: "Quote 3", date: "2022-03-01" },
		],
	},
	{
		name: "Project 3",
		description: "Project 3 description",
		status: randomItemFromArray(projectStatusEnum.enumValues),
		content: "Project 3 content",
		clients: [clientSeeds[0], clientSeeds[2]],
		invoices: [
			createInvoiceSeedData({
				name: "Invoice 4",
				date: "2022-04-01",
				invoiceNumber: 1004,
				clientNumber: "0098",
				subject: "Programming service for Project 3 - April 2022",
				introduction:
					"Dear client,\nI am pleased to submit this invoice for the implementation work completed on Project 3 during April 2022.",
				rows: [
					{ description: "Feature development", hoursCount: 9 },
					{ description: "Architecture review", hoursCount: 5 },
				],
			}),
			createInvoiceSeedData({
				name: "Invoice 5",
				date: "2022-05-01",
				invoiceNumber: 1005,
				clientNumber: "0098",
				subject: "Programming service for Project 3 - May 2022",
				introduction:
					"Dear client,\nPlease find my invoice for the May 2022 development work, covering implementation, refinements, and support for Project 3.",
				rows: [
					{ description: "UI refinements", hoursCount: 7 },
					{ description: "Performance improvements", hoursCount: 6 },
					{ description: "Maintenance", hoursCount: 2 },
				],
			}),
		],
		quotes: [
			{ name: "Quote 4", date: "2022-04-01" },
			{ name: "Quote 5", date: "2022-05-01" },
		],
	},
];

export default projectsSeedData;
