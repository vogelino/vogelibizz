"use client";

import "easymde/dist/easymde.min.css";
import { useMemo } from "react";
import SimpleMDE, { type SimpleMDEReactProps } from "react-simplemde-editor";

const TextareaEditor = ({
	forwardedRef,
	...props
}: SimpleMDEReactProps & {
	forwardedRef?: React.Ref<HTMLDivElement>;
}) => {
	const options = useMemo(
		() =>
			({
				autofocus: false,
				spellChecker: false,
				toolbar: false,
			}) as SimpleMDEReactProps["options"],
		[],
	);

	return <SimpleMDE options={options} ref={forwardedRef} {...props} />;
};

TextareaEditor.displayName = "TextareaEditor";

export { TextareaEditor };
