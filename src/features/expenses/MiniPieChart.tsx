import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function MiniPieChart({
	title,
	series,
	colorForLabel,
	loading,
	onSegmentClick,
}: {
	title: string;
	series: { label: string; value: number }[];
	colorForLabel: (label: string) => string;
	loading: boolean;
	onSegmentClick?: (label: string) => void;
}) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [tooltip, setTooltip] = useState<{
		label: string;
		percent: string;
		color: string;
		x: number;
		y: number;
		visible: boolean;
	}>({
		label: "",
		percent: "0%",
		color: "#94a3b8",
		x: 0,
		y: 0,
		visible: false,
	});

	if (loading) {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-xs text-muted-foreground">{title}</span>
				<div className="h-15 w-16 bg-background/70 p-1.5">
					<Skeleton className="h-full w-full bg-muted-foreground/20" />
				</div>
			</div>
		);
	}

	const trimmedSeries = series.slice(0, 4);
	const total = trimmedSeries.reduce((acc, item) => acc + item.value, 0);
	const positiveSeries = trimmedSeries.filter((item) => item.value > 0);
	const positiveCount = positiveSeries.length;
	const minRatio = positiveCount > 0 ? Math.min(0.03, 1 / positiveCount) : 0;
	const smallItems = positiveSeries.filter(
		(item) => item.value / total < minRatio,
	);
	const largeItems = positiveSeries.filter(
		(item) => item.value / total >= minRatio,
	);
	const totalLarge = largeItems.reduce((acc, item) => acc + item.value, 0);
	const reservedRatio = minRatio * smallItems.length;
	const remainingRatio = Math.max(0, 1 - reservedRatio);
	const size = 48;
	const strokeWidth = 10;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	let offset = 0;
	return (
		<div className="flex flex-col gap-2">
			<span className="text-xs text-muted-foreground">{title}</span>
			<div ref={wrapperRef} className="relative bg-background/70 px-2 py-1.5">
				{tooltip.visible ? (
					<div
						className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border border-border/40 bg-background px-2 py-1 text-xs text-foreground shadow-md flex flex-col"
						style={{ left: tooltip.x, top: tooltip.y }}
					>
						<span>{tooltip.label}</span>
						<span className="flex items-center gap-1">
							<span
								className="inline-flex h-2 w-2 rounded-full"
								style={{ backgroundColor: tooltip.color }}
							/>
							{tooltip.percent}
						</span>
					</div>
				) : null}
				<TooltipProvider>
					<svg
						width={size}
						height={size}
						viewBox={`0 0 ${size} ${size}`}
						aria-hidden="true"
					>
						<circle
							cx={size / 2}
							cy={size / 2}
							r={radius}
							className="stroke-muted-foreground/15"
							strokeWidth={strokeWidth}
							fill="none"
						/>
						{trimmedSeries.map((item) => {
							const baseRatio = total ? item.value / total : 0;
							const ratio =
								item.value === 0
									? 0
									: baseRatio < minRatio
										? minRatio
										: totalLarge > 0
											? (item.value / totalLarge) * remainingRatio
											: baseRatio;
							const dash = ratio * circumference;
							const dashArray = `${dash} ${circumference - dash}`;
							const dashOffset = circumference - offset;
							const stroke = colorForLabel(item.label);
							offset += dash;
							const percentLabel = total
								? `${Math.round(baseRatio * 100)}%`
								: "0%";
							return (
								<Tooltip key={item.label}>
									<TooltipTrigger asChild>
										{/* biome-ignore lint/a11y/useSemanticElements: SVG segments need pointer events; no semantic button in SVG */}
										<g
											role="button"
											tabIndex={0}
											aria-label={
												onSegmentClick
													? `Filter by ${item.label}`
													: `${item.label} segment`
											}
											aria-disabled={onSegmentClick ? undefined : true}
											className={
												onSegmentClick ? "cursor-pointer" : "cursor-default"
											}
											onMouseEnter={(event) => {
												const bounds =
													wrapperRef.current?.getBoundingClientRect();
												if (!bounds) return;
												setTooltip({
													label: item.label,
													percent: percentLabel,
													color: stroke,
													x: event.clientX - bounds.left,
													y: event.clientY - bounds.top,
													visible: true,
												});
											}}
											onMouseMove={(event) => {
												const bounds =
													wrapperRef.current?.getBoundingClientRect();
												if (!bounds) return;
												setTooltip((prev) => ({
													...prev,
													color: stroke,
													x: event.clientX - bounds.left,
													y: event.clientY - bounds.top,
												}));
											}}
											onMouseLeave={() => {
												setTooltip((prev) => ({ ...prev, visible: false }));
											}}
											onClick={() => onSegmentClick?.(item.label)}
											onKeyDown={(event) => {
												if (!onSegmentClick) return;
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													onSegmentClick(item.label);
												}
											}}
										>
											<circle
												cx={size / 2}
												cy={size / 2}
												r={radius}
												style={{ stroke }}
												strokeWidth={strokeWidth}
												strokeDasharray={dashArray}
												strokeDashoffset={dashOffset}
												fill="none"
											/>
										</g>
									</TooltipTrigger>
									<TooltipContent>
										{item.label} · {percentLabel}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</svg>
				</TooltipProvider>
			</div>
		</div>
	);
}

const categoryStrokeColors: Record<string, string> = {
	Charity: "#ef4444",
	Transport: "#3b82f6",
	Domain: "#22c55e",
	Entertainment: "#eab308",
	Essentials: "#a855f7",
	Hardware: "#ec4899",
	"Health & Wellbeing": "#f97316",
	Hobby: "#6366f1",
	Home: "#6b7280",
	Present: "#14b8a6",
	Savings: "#84cc16",
	Services: "#f59e0b",
	Software: "#8b5cf6",
	Travel: "#10b981",
	Administrative: "#0ea5e9",
	Dining: "#ff2056",
	Groceries: "#00a63e",
	Shopping: "#e12afb",
	"Cash Withdrawal": "#62748e",
	Taxes: "#0092b8",
	Payments: "#155dfc",
	"Other Income": "#009966",
};

export function getCategoryStrokeColor(label: string) {
	return categoryStrokeColors[label] ?? "#94a3b8";
}

export function getTypeStrokeColor(label: string) {
	if (label === "Freelance") return "#ef4444";
	if (label === "Personal") return "#3b82f6";
	return "#94a3b8";
}
