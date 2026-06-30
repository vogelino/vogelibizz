import { Font } from "@react-pdf/renderer";
import { lazy, Suspense, useEffect } from "react";
import ClientOnly from "@/components/ClientOnly";
import { cn } from "@/utility/classNames";
import { InvoicePdfDocument } from "./InvoicePdfDocument";
import type { InvoicePdfDataType } from "./invoicePdfData";

const PDFViewer = lazy(async () => {
	const mod = await import("@react-pdf/renderer");
	return { default: mod.PDFViewer };
});

let fontsRegistered = false;

export function InvoicePdfPreview({
	data,
	className,
}: {
	data: InvoicePdfDataType;
	className?: string;
}) {
	useEffect(() => {
		if (fontsRegistered) return;
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
		fontsRegistered = true;
	}, []);

	return (
		<ClientOnly fallback={<p>Loading PDF preview...</p>}>
			<Suspense fallback={<p>Loading PDF preview...</p>}>
				<PDFViewer className={cn("h-full w-full border-0", className)}>
					<InvoicePdfDocument data={data} />
				</PDFViewer>
			</Suspense>
		</ClientOnly>
	);
}
