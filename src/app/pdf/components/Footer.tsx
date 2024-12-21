import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../variables";
import { CompanyAddress } from "./CompanyAddress";

export const Footer = ({
	companyName,
	firstName,
	fatherLastName,
	motherLastName,
	companyAddressStreetName,
	companyAddressStreetNumber,
	companyAddressOfficeNumber,
	companyAddressNeighbourhood,
	companyAddressCity,
	companyAddressCountry,
	companyTaxNumber,
	bankName,
	bankAccountNumber,
	bankAddress,
	bankSwift,
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
	bankName: string;
	bankAccountNumber: string;
	bankAddress: string;
	bankSwift: string;
}) => (
	<>
		<View style={styles.wrapper}>
			<View style={styles.addressColumn}>
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
					color={COLORS.grayDark}
				/>
				<Text>Tax ID: {companyTaxNumber}</Text>
			</View>
			<View style={styles.bankAccountWrapper}>
				<View style={styles.bankAccountLabels}>
					<Text style={styles.bold}>Account Owner</Text>
					<Text style={styles.bold}>Bank</Text>
					<Text style={styles.bold}>Account Nr.</Text>
					<Text style={styles.bold}>Bank Address</Text>
					<Text style={styles.bold}>SWIFT</Text>
				</View>
				<View style={styles.bankAccountValues}>
					<Text>
						{firstName} {fatherLastName} {motherLastName}
					</Text>
					<Text>{bankName}</Text>
					<Text>{bankAccountNumber}</Text>
					<Text>{bankAddress}</Text>
					<Text>{bankSwift}</Text>
				</View>
			</View>
			<View style={styles.pagination}>
				<Text style={styles.bold}>Page 1</Text>
				<Text> / 2</Text>
			</View>
		</View>
	</>
);

const styles = StyleSheet.create({
	wrapper: {
		borderTop: `0.5px solid ${COLORS.grayMed}`,
		paddingTop: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		flexGrow: 0,
		flexShrink: 0,
		height: "auto",
		color: COLORS.grayDark,
		opacity: 0.8,
	},
	addressColumn: {
		flexDirection: "column",
	},
	bold: {
		fontWeight: 700,
	},
	bankAccountWrapper: {
		flexDirection: "row",
		gap: 8,
	},
	bankAccountLabels: {
		flexDirection: "column",
	},
	bankAccountValues: {
		flexDirection: "column",
	},
	pagination: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 4,
	},
});
