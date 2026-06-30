import { getInvoices } from "@/server/api/invoices/getInvoices";

export async function getInvoice(id: number) {
	const invoice = (await getInvoices()).find((item) => item.id === id);
	if (!invoice) {
		throw new Error(`Invoice with id '${id}' does not exist`);
	}
	return invoice;
}
