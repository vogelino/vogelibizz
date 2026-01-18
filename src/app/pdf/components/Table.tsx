import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS, CONFIG, LABELS } from "../variables";

export const Table = ({
	currency = "EUR",
	lang = "en-US",
	hourlyRate = 50,
	hasFootNote = true,
	rows = [],
}: {
	currency?: string;
	hourlyRate: number;
	lang?: keyof typeof LABELS;
	hasFootNote?: boolean;
	rows: {
		description: string;
		hoursCount: number;
	}[];
}) => {
	const currencyFormatter = new Intl.NumberFormat(lang, {
		style: "currency",
		currency,
	});
	return (
		<View style={styles.wrapper}>
			<View style={[styles.row, styles.headerRow]}>
				<Text style={styles.rowNumber}>#</Text>
				<Text style={styles.rowDescription}>
					{LABELS[lang].tableHeaderDescription}
				</Text>
				<Text style={[styles.rowHours, styles.headerRowLabel]}>
					{LABELS[lang].tableHeaderHours}
				</Text>
				<Text style={[styles.rowPrice, styles.headerRowLabel]}>
					{`${LABELS[lang].tableHeaderPrice} (${currency})`}
				</Text>
			</View>
			{rows.map(({ description, hoursCount }, idx) => (
				<View style={styles.row} key={`${description}-${hoursCount}`}>
					<Text style={styles.rowNumber}>{`${idx + 1}`.padStart(2, "0")}</Text>
					<Text style={styles.rowDescription}>{description}</Text>
					<Text style={styles.rowHours}>{hoursCount.toLocaleString(lang)}</Text>
					<Text style={styles.rowPrice}>
						{currencyFormatter.format(hoursCount * hourlyRate)}
					</Text>
				</View>
			))}
			<View style={[styles.row, styles.totalRow]}>
				<Text style={styles.rowNumber} />
				<Text style={[styles.rowDescription, styles.totalRowTotal]}>
					{LABELS[lang].tableTotal}:
				</Text>
				<Text style={[styles.rowHours, styles.totalRowLabel]}>
					{rows
						.reduce((acc, { hoursCount }) => acc + hoursCount, 0)
						.toLocaleString(lang)}
				</Text>
				<Text style={[styles.rowPrice, styles.totalRowLabel]}>
					{currencyFormatter.format(
						rows.reduce(
							(acc, { hoursCount }) => acc + hoursCount * hourlyRate,
							0,
						),
					)}
					{hasFootNote && <Text style={styles.asterisk}> *</Text>}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: "column",
		gap: 8,
		marginTop: 16,
	},
	row: {
		flexDirection: "row",
	},
	headerRow: {
		fontWeight: 700,
	},
	headerRowLabel: {
		fontFamily: "Inter",
	},
	rowNumber: {
		color: COLORS.grayDark,
		width: CONFIG.contentLeftOffset,
		flexShrink: 0,
		flexGrow: 0,
		fontWeight: 400,
		fontFamily: "IBM Plex Mono",
	},
	rowDescription: {
		width: "60%",
	},
	rowHours: {
		width: "15%",
		paddingLeft: "5%",
		fontFamily: "IBM Plex Mono",
	},
	rowPrice: {
		width: "25%",
		paddingLeft: "5%",
		fontFamily: "IBM Plex Mono",
		flexDirection: "row",
	},
	totalRow: {
		borderTop: `0.5px solid ${COLORS.grayMed}`,
		paddingTop: 8,
	},
	totalRowLabel: {},
	totalRowTotal: {
		fontWeight: 700,
		textAlign: "right",
	},
	asterisk: {
		color: COLORS.grayDark,
		fontFamily: "IBM Plex Mono",
	},
});
