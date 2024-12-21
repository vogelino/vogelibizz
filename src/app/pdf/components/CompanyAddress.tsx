import { Link, StyleSheet, Text } from "@react-pdf/renderer";

export const CompanyAddress = ({
	companyAddressStreetName,
	companyAddressStreetNumber,
	companyAddressOfficeNumber,
	companyAddressNeighbourhood,
	companyAddressCity,
	companyAddressCountry,
	color = "inherit",
}: {
	companyAddressStreetName: string;
	companyAddressStreetNumber: string;
	companyAddressOfficeNumber: string;
	companyAddressNeighbourhood: string;
	companyAddressCity: string;
	companyAddressCountry: string;
	color?: string;
}) => (
	<Link
		href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
			`${companyAddressStreetName} ${companyAddressStreetNumber}, Of ${companyAddressOfficeNumber}, ${companyAddressNeighbourhood}, ${companyAddressCity}, ${companyAddressCountry}`,
		)}`}
		style={[styles.addressLink, { color }]}
	>
		<Text>
			{companyAddressStreetName} {companyAddressStreetNumber}, Of{" "}
			{companyAddressOfficeNumber}
		</Text>
		<Text>
			{companyAddressNeighbourhood}, {companyAddressCity}
		</Text>
		<Text>{companyAddressCountry}</Text>
	</Link>
);

const styles = StyleSheet.create({
	addressLink: {
		textDecoration: "none",
	},
});
