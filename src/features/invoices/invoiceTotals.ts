import type { InvoiceType } from "@/db/schema";

export function getInvoiceTotal(
	invoice: Pick<InvoiceType, "hourlyRate" | "rows">,
) {
	return invoice.rows.reduce(
		(total, row) => total + row.hoursCount * invoice.hourlyRate,
		0,
	);
}

export function getInvoiceHours(invoice: Pick<InvoiceType, "rows">) {
	return invoice.rows.reduce((total, row) => total + row.hoursCount, 0);
}
