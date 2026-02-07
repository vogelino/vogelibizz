import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { CONFIG } from "../variables";
import { Title } from "./Title";

export const Introduction = ({
	titlePrefix,
	subject,
	introduction,
}: {
	titlePrefix: string;
	subject: string;
	introduction: string;
}) => (
	<>
		<Title prefix={titlePrefix} title={subject} />
		<View style={styles.text}>
			{introduction.split("\n").map((line, _index) => (
				<Text key={line} style={styles.paragraph}>
					{line}
				</Text>
			))}
		</View>
	</>
);

const styles = StyleSheet.create({
	text: {
		paddingLeft: CONFIG.contentLeftOffset,
	},
	paragraph: {
		marginBottom: 8,
	},
});
