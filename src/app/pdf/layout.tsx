"use client";
import { Font } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import type React from "react";

const _PDFViewer = dynamic(
	() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
	{
		ssr: false,
		loading: () => <p>Loading...</p>,
	},
);
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

export default function PDFLayout({ children }: { children: React.ReactNode }) {
	return <main className="h-screen w-screen">{children}</main>;
}
