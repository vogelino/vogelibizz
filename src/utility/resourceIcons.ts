import {
	Coins,
	FileText,
	FolderKanban,
	History,
	type LucideIcon,
	ReceiptText,
	Settings,
	Users,
	WalletCards,
} from "lucide-react";
import type { ResourceType } from "@/db/schema";

export type ResourceIconKey = ResourceType | "expense-history";

export const resourceIconMap = {
	clients: Users,
	projects: FolderKanban,
	invoices: ReceiptText,
	expenses: WalletCards,
	"expense-history": History,
	quotes: FileText,
	currencies: Coins,
	settings: Settings,
} satisfies Record<ResourceIconKey, LucideIcon>;
