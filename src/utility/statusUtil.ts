import { ProjectType } from "@db/schema";

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
type StatusType = ProjectType["status"];
const statusToLabelMap: Record<StatusType, string> = {
  todo: "Todo",
  active: "Active",
  paused: "Paused",
  done: "Done",
  cancelled: "Cancelled",
  negotiating: "Negotiating",
  waiting_for_feedback: "Waiting for feedback",
};
const statusToIconMap: Record<StatusType, string> = {
  todo: "⬜️ ",
  active: "🕥 ",
  paused: "⏸️ ",
  done: "✅ ",
  cancelled: "❌ ",
  negotiating: "🤑 ",
  waiting_for_feedback: "⏳ ",
};

export const statusList = Object.keys(statusToLabelMap).map((key) => ({
  label: statusToLabelMap[key],
  value: key,
}));

export function mapStatusToColor(status: StatusType): ColorType {
  return statusToColorMap[status] || "default";
}

export function mapStatusToLabel(status: StatusType): string {
  return statusToLabelMap[status] || status;
}

export function mapStatusToIcon(status: StatusType): string {
  return statusToIconMap[status] || "clock-circle";
}
