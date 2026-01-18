import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS, CONFIG } from "../variables";

export const Title = ({ prefix, title }: { prefix: string; title: string }) => (
	<>
		<View style={styles.wrapper}>
			<View style={styles.line} />
			{prefix && <Text style={styles.prefix}>{prefix}</Text>}
			{title && <Text style={styles.title}>{title}</Text>}
		</View>
	</>
);

const styles = StyleSheet.create({
	wrapper: {
		paddingLeft: CONFIG.contentLeftOffset,
		position: "relative",
		flexDirection: "row",
		marginTop: 24,
	},
	line: {
		position: "absolute",
		left: 0,
		top: "50%",
		height: 1,
		width: "100%",
		borderTop: `0.5px solid ${COLORS.grayMed}`,
	},
	prefix: {
		fontWeight: 700,
		backgroundColor: COLORS.bg,
		paddingLeft: 8,
		paddingRight: 8,
		marginLeft: -8,
	},
	title: {
		backgroundColor: COLORS.bg,
		paddingRight: 8,
	},
});
