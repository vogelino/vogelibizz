"use client";
import { Document, Page, StyleSheet, View } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { FootNote } from "./components/FootNote";
import { Footer } from "./components/Footer";
import { Introduction } from "./components/Introduction";
import { Letterhead } from "./components/Letterhead";
import { Table } from "./components/Table";
import { CONFIG, CONTENT } from "./variables";

const PDFViewer = dynamic(
	() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
	{
		ssr: false,
		loading: () => <p>Loading...</p>,
	},
);

const InvoiceDocument = () => (
	<PDFViewer className="w-screen h-screen">
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.content}>
					<Letterhead {...CONTENT} />
					<Introduction
						titlePrefix="Invoice"
						subject="Programming service for the data2resilience project - August 2024"
						introduction={`Dear Mr. Skowronnek,\nI am pleased to present you my invoice for the programming service of the "data2resilience" application. Below you will find the details and costs of the service. If you have any questions, please feel free to contact me.`}
					/>
					<Table
						hourlyRate={50}
						rows={[
							{
								description: "Programming",
								hoursCount: 10,
							},
							{
								description:
									"I am pleased to present you my invoice for the programming service of the data2resilience application. Below you will find the details and costs of the service. If you have any questions, please feel free to contact me",
								hoursCount: 5,
							},
							{
								description: "Web development",
								hoursCount: 5,
							},
						]}
					/>
				</View>
				<View style={styles.footer}>
					<FootNote>
						Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).
					</FootNote>
					<Footer {...CONTENT} />
				</View>
			</Page>
		</Document>
	</PDFViewer>
);

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#fff",
		fontFamily: "Inter",
		paddingLeft: CONFIG.pageInlinePadding,
		paddingRight: CONFIG.pageInlinePadding,
		paddingTop: CONFIG.pageBlockPadding,
		paddingBottom: CONFIG.pageBlockPadding * 0.5,
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

export default InvoiceDocument;
