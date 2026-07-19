import {
	type CurrencyIdType,
	currencyEnum,
	type SettingsType,
} from "@/db/schema";
import useSettings from "@/utility/data/useSettings";
import useSettingsUpdate from "@/utility/data/useSettingsUpdate";
import { Combobox } from "./ui/combobox";
import { Skeleton } from "./ui/skeleton";

type CurrencySettingSelectProps = {
	initialSettings?: SettingsType;
};

export function CurrencySettingSelect({
	initialSettings,
}: CurrencySettingSelectProps) {
	const settingsQuery = useSettings(initialSettings);
	const settingsUpdate = useSettingsUpdate();
	const targetCurrency = settingsQuery.data?.targetCurrency ?? "CLP";
	const currencyOptions = currencyEnum.enumValues.map((currency) => ({
		value: currency,
		label: currency,
	}));
	return (
		<>
			{settingsQuery.isPending ? (
				<Skeleton className="h-9 w-24" />
			) : (
				<Combobox
					options={currencyOptions}
					value={targetCurrency}
					onChange={(value) => settingsUpdate.mutate(value as CurrencyIdType)}
					className="min-w-24"
				/>
			)}
		</>
	);
}
