import type React from "react";

export default function PDFLayout({ children }: { children: React.ReactNode }) {
	return <main className="h-screen w-screen">{children}</main>;
}
