export * from "./clientsDbSchema";
export * from "./expensesDbSchema";
export * from "./invoicesDbSchema";
export * from "./projectsDbSchema";
export * from "./projectsToClientsDbSchema";
export * from "./projectsToInvoicesDbSchema";
export * from "./projectsToQuotesDbSchema";
export * from "./quotesDbSchema";

export type ResourceType =
	| "projects"
	| "clients"
	| "expenses"
	| "quotes"
	| "invoices";
