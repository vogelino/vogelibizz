import { Document, Page, StyleSheet, View } from "@react-pdf/renderer";
import { Footer } from "@/pdf/components/Footer";
import { FootNote } from "@/pdf/components/FootNote";
import { HourlyRateNotice } from "@/pdf/components/HourlyRateNotice";
import { Introduction } from "@/pdf/components/Introduction";
import { Letterhead } from "@/pdf/components/Letterhead";
import { Table } from "@/pdf/components/Table";
import { CONFIG } from "@/pdf/variables";
import type { InvoicePdfDataType } from "./invoicePdfData";

export function InvoicePdfDocument({ data }: { data: InvoicePdfDataType }) {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.content}>
					<Letterhead {...data.letterhead} lang={data.lang} />
					<Introduction
						titlePrefix={data.titlePrefix}
						subject={data.subject}
						introduction={data.introduction}
					/>
					<Table
						hourlyRate={data.hourlyRate}
						lang={data.lang}
						currency={data.currency}
						hasFootNote={Boolean(data.footNote)}
						rows={data.rows}
					/>
					<HourlyRateNotice
						lang={data.lang}
						hourlyRate={data.hourlyRate}
						currency={data.currency}
					/>
				</View>
				<View style={styles.footer}>
					{data.footNote ? <FootNote>{data.footNote}</FootNote> : null}
					<Footer {...data.footer} />
				</View>
			</Page>
		</Document>
	);
}

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#fff",
		fontFamily: "Inter",
		paddingLeft: CONFIG.pageInlinePadding,
		paddingRight: CONFIG.pageInlinePadding,
		paddingTop: CONFIG.pageBlockPadding,
		paddingBottom: CONFIG.pageBlockPadding * 0.75,
		fontSize: 10,
		lineHeight: 1.2,
		height: "100%",
	},
	content: {
		flexGrow: 1,
		gap: 16,
	},
	footer: {
		flexDirection: "column",
		gap: 16,
		flexGrow: 0,
		flexShrink: 0,
	},
});
