import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS, CONFIG } from "../variables";

export const HourlyRateNotice = ({
	lang = "en-US",
	hourlyRate = 50,
	currency = "EUR",
}: {
	lang?: string;
	hourlyRate?: number;
	currency?: string;
}) => {
	const currencyFormatter = new Intl.NumberFormat(lang, {
		style: "currency",
		currency,
	});
	return (
		<View style={styles.wrapper}>
			<View style={styles.inner}>
				<Text style={styles.description}>
					Zugrunde liegender Stundensatz für die Preisberechnung
				</Text>
				<Text style={styles.hourlyRate}>
					{currencyFormatter.format(hourlyRate)}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingLeft: CONFIG.contentLeftOffset,
		marginTop: 16,
	},
	inner: {
		flexDirection: "row",
		gap: 8,
		borderBottom: `0.5px solid ${COLORS.grayMed}`,
		paddingBottom: 8,
	},
	description: {
		fontWeight: 700,
	},
	hourlyRate: {
		fontFamily: "IBM Plex Mono",
	},
});
