import {
	CheckCircle2,
	Circle,
	Handshake,
	MessageCircleMore,
	PauseCircle,
	PlayCircle,
	XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectType } from "@/db/schema";

type ColorType = "default" | "blue" | "green" | "red" | "orange";
const statusToColorMap: Record<string, ColorType> = {
	todo: "default",
	active: "blue",
	paused: "orange",
	done: "green",
	cancelled: "red",
	negotiating: "orange",
	waiting_for_feedback: "orange",
};
export type StatusType = ProjectType["status"];
const statusToLabelMap: Record<StatusType, string> = {
	todo: "Todo",
	active: "Active",
	paused: "Paused",
	done: "Done",
	cancelled: "Cancelled",
	negotiating: "Negotiating",
	waiting_for_feedback: "Waiting for feedback",
};
const statusToIconMap: Record<StatusType, ReactNode> = {
	todo: <Circle size={16} />,
	active: <PlayCircle size={16} />,
	paused: <PauseCircle size={16} />,
	done: <CheckCircle2 size={16} />,
	cancelled: <XCircle size={16} />,
	negotiating: <Handshake size={16} />,
	waiting_for_feedback: <MessageCircleMore size={20} />,
};

export const statusList = Object.keys(statusToLabelMap).map((key) => ({
	label: statusToLabelMap[key as StatusType],
	value: key as StatusType,
}));

export function mapStatusToColor(status: StatusType): ColorType {
	return statusToColorMap[status] || "default";
}

export function mapStatusToColorClass(status: StatusType): string {
	switch (mapStatusToColor(status)) {
		case "blue":
			return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
		case "green":
			return "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300";
		case "red":
			return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
		case "orange":
			return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
		default:
			return "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300";
	}
}

export function mapStatusToLabel(status: StatusType): string {
	return statusToLabelMap[status] || status;
}

export function mapStatusToIcon(status: StatusType): ReactNode {
	return statusToIconMap[status] || null;
}
