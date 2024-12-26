import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyDisplayName: text("company_display_name").notNull(),
  companyLegalName: text("company_legal_name"),
  companySvgLogoString: text("company_svg_logo_string"),
  companySvgIconString: text("company_svg_icon_string"),
  companyTaxId: text("company_tax_id"),
  companyStreetName: text("company_street_name"),
  companyStreetNumber: text("company_street_number"),
  companyDistrict: text("company_district"),
  companyCountryCode: text("company_country_code"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  companyWebsite: text("company_website"),
  companyBankOwner: text("company_bank_owner"),
  companyBankName: text("company_bank_name"),
  companyBankAccountNumber: text("company_bank_account_number"),
  companyBankAddress: text("company_bank_address"),
  companyBankSwiftCode: text("company_bank_swift_code"),
  companyDefaultHourlyRate: integer("company_default_hourly_rate").default(50),
});
