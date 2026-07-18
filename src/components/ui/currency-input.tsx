import { Banknote } from "lucide-react";
import { type HTMLProps, type PropsWithChildren, useMemo } from "react";
import ReactCurrencyInput, {
	type CurrencyInputProps,
} from "react-currency-input-field";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyEnum, type ExpenseType } from "@/db/schema";
import { cn } from "@/utility/classNames";
import { locale } from "@/utility/formatUtil";
import { Combobox } from "./combobox";

const currencyDisplay = new Intl.DisplayNames(["en-GB"], { type: "currency" });

function CurrencyInput({
	className,
	inputProps,
	currencyProps,
	currency,
	value,
	onCurrencyChange,
	onValueChange,
	label = "Amount",
	loading = false,
	currencyReadOnly = false,
}: PropsWithChildren<{
	inputProps?: CurrencyInputProps;
	currencyProps?: HTMLProps<HTMLInputElement>;
	onCurrencyChange: (currency: ExpenseType["originalCurrency"]) => void;
	onValueChange: (value: number) => void;
	currency: ExpenseType["originalCurrency"];
	value: number | undefined;
	label?: string;
	className?: string;
	loading?: boolean;
	currencyReadOnly?: boolean;
}>) {
	const options = useMemo(
		() =>
			currencyEnum.enumValues.map((c) => ({
				label: (
					<span className="flex gap-2 justify-between w-full">
						<span>{currencyDisplay.of(c)}</span>
						<span className="text-muted-foreground opacity-80 flex gap-2">
							<span>{getCurrencySymbol(c)}</span>
							<span>·</span>
							<span>{c}</span>
						</span>
					</span>
				),
				value: c,
			})),
		[],
	);

	return (
		<FormInputWrapper
			label={label}
			loading={loading}
			loadingChildren={
				<div className="flex gap-2">
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-24" />
				</div>
			}
		>
			{!loading && (
				<div className="flex">
					<div className="relative w-full">
						<div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none text-muted-foreground opacity-80">
							<Banknote />
						</div>
						<ReactCurrencyInput
							{...inputProps}
							className={cn(
								"form-input dark:bg-card",
								"ps-12 w-full font-mono border-r-0",
								inputProps?.className,
								className,
							)}
							placeholder="0.00"
							required
							value={value}
							onValueChange={(_value, _name, values) =>
								onValueChange(values?.float ?? 0)
							}
							intlConfig={{ locale }}
							decimalScale={2}
						/>
					</div>
					{currencyProps && (
						<input type="hidden" {...currencyProps} value={currency} />
					)}
					{currencyReadOnly ? (
						<div className="flex min-w-20 items-center justify-center border border-border bg-muted px-3 text-sm">
							{currency}
						</div>
					) : (
						<Combobox
							className={className}
							options={options}
							value={currency}
							onChange={(currency) =>
								onCurrencyChange(currency as ExpenseType["originalCurrency"])
							}
							selectedValueFormater={() => <span>{currency}</span>}
						/>
					)}
				</div>
			)}
		</FormInputWrapper>
	);
}

function getCurrencySymbol(currency: ExpenseType["originalCurrency"]) {
	return (0)
		.toLocaleString("en-GB", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
		.replace(/\d/g, "")
		.trim();
}

export default CurrencyInput;
