import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import Html from "react-pdf-html";
import { COLORS, SVGS } from "../variables";
import { CompanyAddress } from "./CompanyAddress";

export const Letterhead = ({
	companyName,
	firstName,
	fatherLastName,
	motherLastName = "",
	companyAddressStreetName,
	companyAddressStreetNumber,
	companyAddressOfficeNumber = "",
	companyAddressNeighbourhood,
	companyAddressCity,
	companyAddressCountry,
	companyTaxNumber,
	companyEmailAddress,
	companyPhoneNumber,
	companyWebsiteUrl,
	clientName,
	clientAddressLine1,
	clientAddressLine2,
	clientAddressLine3,
	clientTaxNumber,
	clientNumber,
	invoiceNumber,
	invoiceLocation,
	invoiceDate,
}: {
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
}) => (
	<>
		<View style={styles.logos}>
			<View style={[styles.letterheadColumn, styles.logo]}>
				<Link href={companyWebsiteUrl}>
					<View style={styles.logoInner}>
						<Html>{SVGS.companyLogoString}</Html>
					</View>
				</Link>
			</View>
			<View style={[styles.letterheadColumn, styles.logo]}>
				<View style={[styles.logoInner, styles.clientLogo]}>
					<Html>{SVGS.clientLogoString}</Html>
				</View>
			</View>
		</View>
		<View style={styles.letterhead}>
			<View style={styles.letterheadColumn}>
				<View style={styles.senderAddress}>
					<Text>{companyName}</Text>
					<Text>
						{firstName} {fatherLastName} {motherLastName}
					</Text>
					<CompanyAddress
						companyAddressStreetName={companyAddressStreetName}
						companyAddressStreetNumber={companyAddressStreetNumber}
						companyAddressOfficeNumber={companyAddressOfficeNumber}
						companyAddressNeighbourhood={companyAddressNeighbourhood}
						companyAddressCity={companyAddressCity}
						companyAddressCountry={companyAddressCountry}
					/>
					<Text>Tax ID: {companyTaxNumber}</Text>
				</View>
			</View>
			<View style={styles.letterheadColumn}>
				<View style={styles.receiverAddress}>
					<Text>{clientName}</Text>
					<Text>{clientAddressLine1}</Text>
					<Text>{clientAddressLine2}</Text>
					<Text>{clientAddressLine3}</Text>
					<Text>Tax ID: {clientTaxNumber}</Text>
				</View>
			</View>
		</View>
		<View style={styles.letterhead}>
			<View style={styles.letterheadColumn}>
				<View style={styles.senderContact}>
					<Link href={`mailto:${companyEmailAddress}`} style={styles.link}>
						<View style={styles.senderContactLine}>
							<Html>{SVGS.envelopeIconString}</Html>
							<Text>{companyEmailAddress}</Text>
						</View>
					</Link>
					<Link href={`tel:${companyPhoneNumber}`} style={styles.link}>
						<View style={styles.senderContactLine}>
							<Html>{SVGS.phoneIconString}</Html>
							<Text>{companyPhoneNumber}</Text>
						</View>
					</Link>
					<Link href={companyWebsiteUrl} style={styles.link}>
						<View style={styles.senderContactLine}>
							<Html>{SVGS.webglobeIconString}</Html>
							<Text>{new URL(companyWebsiteUrl).host}</Text>
						</View>
					</Link>
				</View>
			</View>
			<View style={styles.letterheadColumn}>
				<View style={styles.receiverInfo}>
					<View style={styles.receiverInfoLabels}>
						<Text style={styles.bold}>Client Nr.</Text>
						<Text style={styles.bold}>Invoice Nr.</Text>
					</View>
					<View style={styles.receiverInfoValues}>
						<Text>{clientNumber}</Text>
						<Text>{invoiceNumber}</Text>
					</View>
				</View>
				<View style={styles.invoiceLocationAndTime}>
					<Text>
						{invoiceLocation},{" "}
						{new Intl.DateTimeFormat("en").format(invoiceDate)}
					</Text>
				</View>
			</View>
		</View>
	</>
);

const styles = StyleSheet.create({
	logos: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	logo: {},
	logoInner: {},
	clientLogo: {
		position: "absolute",
		left: 0,
		bottom: 0,
	},
	letterhead: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	bold: {
		fontWeight: 700,
	},
	letterheadColumn: {
		position: "relative",
		gap: 8,
		width: "40%",
	},
	receiverInfo: {
		flexDirection: "row",
		gap: 16,
	},
	receiverInfoLabels: {},
	receiverInfoValues: {},
	senderContact: {
		color: COLORS.grayDark,
		gap: 2,
	},
	senderContactLine: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	invoiceLocationAndTime: {},
	senderAddress: {},
	receiverAddress: {},
	link: {
		color: COLORS.grayDark,
		textDecoration: "none",
	},
});
