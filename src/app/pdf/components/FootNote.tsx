import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS, CONFIG } from "../variables";

export const FootNote = ({ children }: { children: React.ReactNode }) => (
	<>
		<View style={styles.wrapper}>
			<Text style={styles.asterisk}>*</Text>
			<Text style={styles.content}>{children}</Text>
		</View>
	</>
);

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: "row",
	},
	asterisk: {
		width: CONFIG.contentLeftOffset,
		color: COLORS.grayDark,
		flexShrink: 0,
		flexGrow: 0,
		fontFamily: "IBM Plex Mono",
		marginTop: -1,
	},
	content: {
		flexGrow: 1,
		flexShrink: 1,
	},
});
