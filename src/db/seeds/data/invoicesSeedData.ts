import projects from "./projectsSeedData";

const firstInvoice = projects[0].invoices[0];
type InvoiceSeedType = typeof firstInvoice;

const allInvoices = projects
	.reduce((acc, project) => {
		for (const invoice of project.invoices) {
			acc.set(invoice.name, invoice);
		}
		return acc;
	}, new Map<string, InvoiceSeedType>())
	.values();

export default Array.from(allInvoices);
