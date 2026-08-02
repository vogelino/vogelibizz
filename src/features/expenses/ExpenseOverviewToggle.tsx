import { ChartPie } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const storageKey = "vogelibizz:expenses:show-overview";
const changeEvent = "vogelibizz:expenses:show-overview-change";
let fallbackVisibility = false;

function getStoredVisibility() {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem(storageKey) === "true";
	} catch {
		return fallbackVisibility;
	}
}

function subscribeToVisibility(onChange: () => void) {
	const handleStorage = (event: StorageEvent) => {
		if (event.key === storageKey) onChange();
	};
	window.addEventListener("storage", handleStorage);
	window.addEventListener(changeEvent, onChange);
	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(changeEvent, onChange);
	};
}

export function useExpenseOverviewVisibility() {
	const visible = useSyncExternalStore(
		subscribeToVisibility,
		getStoredVisibility,
		() => false,
	);
	const toggle = useCallback(() => {
		const nextVisibility = !getStoredVisibility();
		fallbackVisibility = nextVisibility;
		try {
			if (nextVisibility) window.localStorage.setItem(storageKey, "true");
			else window.localStorage.removeItem(storageKey);
		} catch {
			// Keep the preference usable for this session when storage is unavailable.
		} finally {
			window.dispatchEvent(new Event(changeEvent));
		}
	}, []);

	return { toggle, visible };
}

export function ExpenseOverviewToggle({
	visible,
	onToggle,
}: {
	visible: boolean;
	onToggle: () => void;
}) {
	return (
		<Button
			variant={visible ? "default" : "ghost"}
			size="icon"
			aria-label={visible ? "Hide spending overview" : "Show spending overview"}
			aria-expanded={visible}
			title={visible ? "Hide spending overview" : "Show spending overview"}
			onClick={onToggle}
		>
			<ChartPie size={20} aria-hidden="true" />
		</Button>
	);
}
