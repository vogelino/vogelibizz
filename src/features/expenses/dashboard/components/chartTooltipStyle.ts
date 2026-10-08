export const chartTextSmFontSize = 12.8;

export const chartTextStyle = {
  color: "var(--color-foreground)",
  fontSize: chartTextSmFontSize,
} as const;

export const chartTooltipStyle = {
  backgroundColor: "var(--color-popover)",
  borderColor: "var(--color-border)",
  textStyle: chartTextStyle,
} as const;
