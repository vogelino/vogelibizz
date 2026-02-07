import { Document, Font, Page, StyleSheet, View } from "@react-pdf/renderer";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { Footer } from "@/pdf/components/Footer";
import { FootNote } from "@/pdf/components/FootNote";
import { HourlyRateNotice } from "@/pdf/components/HourlyRateNotice";
import { Introduction } from "@/pdf/components/Introduction";
import { Letterhead } from "@/pdf/components/Letterhead";
import { Table } from "@/pdf/components/Table";
import { CONFIG, CONTENT } from "@/pdf/variables";
import ClientOnly from "@/components/ClientOnly";

const PDFViewer = lazy(async () => {
	const mod = await import("@react-pdf/renderer");
	return { default: mod.PDFViewer };
});

export const Route = createFileRoute("/pdf")({
	component: InvoiceDocument,
});

function InvoiceDocument() {
	useEffect(() => {
		Font.register({
			family: "Inter",
			fonts: [
				{ src: "/fonts/Inter-Regular.ttf" },
				{ src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
				{ src: "/fonts/Inter-Italic.ttf", fontStyle: "italic" },
				{
					src: "/fonts/Inter-BoldItalic.ttf",
					fontStyle: "italic",
					fontWeight: 700,
				},
			],
		});
		Font.register({
			family: "IBM Plex Mono",
			src: "/fonts/IBMPlexMono-Regular.ttf",
		});
	}, []);

	return (
		<ClientOnly fallback={<p>Loading...</p>}>
			<Suspense fallback={<p>Loading...</p>}>
				<PDFViewer className="w-screen h-screen">
					<Document>
						<Page size="A4" style={styles.page}>
							<View style={styles.content}>
								<Letterhead {...CONTENT} lang={CONFIG.lang} />
								<Introduction
									titlePrefix="Invoice"
									subject="Programming service for the data2resilience project - August 2024"
									introduction={`Dear Mr. Skowronnek,\nI am pleased to present you my invoice for the programming service of the "data2resilience" application. Below you will find the details and costs of the service. If you have any questions, please feel free to contact me.`}
								/>
								<Table
									hourlyRate={CONFIG.hourlyRate}
									lang={CONFIG.lang}
									currency={CONFIG.currency}
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
								<HourlyRateNotice {...CONFIG} />
							</View>
							<View style={styles.footer}>
								<FootNote>
									Steuerschuldnerschaft des Leistungsempfängers (Reverse
									Charge).
								</FootNote>
								<Footer {...CONTENT} />
							</View>
						</Page>
					</Document>
				</PDFViewer>
			</Suspense>
		</ClientOnly>
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
