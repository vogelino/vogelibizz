import type { InvoiceType, SettingsType } from "@/db/schema";
import { LABELS } from "@/pdf/variables";

export type InvoicePdfDataType = {
	lang: keyof typeof LABELS;
	currency: InvoiceType["currency"];
	hourlyRate: number;
	titlePrefix: string;
	subject: string;
	introduction: string;
	rows: InvoiceType["rows"];
	footNote: string;
	letterhead: {
		companyName: string;
		firstName: string;
		fatherLastName: string;
		motherLastName: string;
		companyAddressStreetName: string;
		companyAddressStreetNumber: string;
		companyAddressOfficeNumber: string;
		companyAddressNeighbourhood: string;
		companyAddressCity: string;
		companyAddressCountry: string;
		companyTaxNumber: string;
		companyEmailAddress: string;
		companyPhoneNumber: string;
		companyWebsiteUrl: string;
		clientName: string;
		clientAddressLine1: string;
		clientAddressLine2: string;
		clientAddressLine3: string;
		clientTaxNumber: string;
		clientNumber: string;
		invoiceNumber: number;
		invoiceLocation: string;
		invoiceDate: Date;
	};
	footer: {
		companyName: string;
		firstName: string;
		fatherLastName: string;
		motherLastName: string;
		companyAddressStreetName: string;
		companyAddressStreetNumber: string;
		companyAddressOfficeNumber: string;
		companyAddressNeighbourhood: string;
		companyAddressCity: string;
		companyAddressCountry: string;
		companyTaxNumber: string;
		bankName: string;
		bankAccountNumber: string;
		bankAddress: string;
		bankSwift: string;
	};
};

export function buildInvoicePdfData(
	invoice: InvoiceType,
	settings: SettingsType,
): InvoicePdfDataType {
	const client = invoice.clients?.[0];
	const lang = invoice.language;
	const contactName = splitFullName(
		settings.companyBankOwner || settings.companyDisplayName,
	);
	const companyName = settings.companyLegalName || settings.companyDisplayName;
	const companyWebsiteUrl = ensureAbsoluteUrl(settings.companyWebsite);
	const invoiceDate = new Date(invoice.date);

	return {
		lang,
		currency: invoice.currency,
		hourlyRate: invoice.hourlyRate,
		titlePrefix: "Invoice",
		subject: invoice.subject,
		introduction: invoice.introduction,
		rows: invoice.rows,
		footNote: invoice.footNote || LABELS[lang].reverseChargeNotice,
		letterhead: {
			companyName,
			firstName: contactName.firstName,
			fatherLastName: contactName.fatherLastName,
			motherLastName: contactName.motherLastName,
			companyAddressStreetName: settings.companyStreetName || "",
			companyAddressStreetNumber: settings.companyStreetNumber || "",
			companyAddressOfficeNumber: "",
			companyAddressNeighbourhood: settings.companyDistrict || "",
			companyAddressCity: settings.companyDistrict || "",
			companyAddressCountry: settings.companyCountryCode || "",
			companyTaxNumber: settings.companyTaxId || "",
			companyEmailAddress: settings.companyEmail || "",
			companyPhoneNumber: settings.companyPhone || "",
			companyWebsiteUrl,
			clientName: client?.legalName || client?.name || "",
			clientAddressLine1: client?.addressLine1 || "",
			clientAddressLine2: client?.addressLine2 || "",
			clientAddressLine3: client?.addressLine3 || "",
			clientTaxNumber: client?.taxId || "",
			clientNumber: invoice.clientNumber,
			invoiceNumber: invoice.invoiceNumber,
			invoiceLocation: invoice.invoiceLocation,
			invoiceDate: Number.isNaN(invoiceDate.getTime())
				? new Date()
				: invoiceDate,
		},
		footer: {
			companyName,
			firstName: contactName.firstName,
			fatherLastName: contactName.fatherLastName,
			motherLastName: contactName.motherLastName,
			companyAddressStreetName: settings.companyStreetName || "",
			companyAddressStreetNumber: settings.companyStreetNumber || "",
			companyAddressOfficeNumber: "",
			companyAddressNeighbourhood: settings.companyDistrict || "",
			companyAddressCity: settings.companyDistrict || "",
			companyAddressCountry: settings.companyCountryCode || "",
			companyTaxNumber: settings.companyTaxId || "",
			bankName: settings.companyBankName || "",
			bankAccountNumber: settings.companyBankAccountNumber || "",
			bankAddress: settings.companyBankAddress || "",
			bankSwift: settings.companyBankSwiftCode || "",
		},
	};
}

function splitFullName(fullName?: string | null) {
	const parts = (fullName || "").split(/\s+/).filter(Boolean);
	return {
		firstName: parts[0] || "",
		fatherLastName: parts[1] || "",
		motherLastName: parts.slice(2).join(" "),
	};
}

function ensureAbsoluteUrl(url?: string | null) {
	if (!url) return "https://example.com";
	try {
		return new URL(url).toString();
	} catch {
		try {
			return new URL(`https://${url}`).toString();
		} catch {
			return "https://example.com";
		}
	}
}
