export type ImportedMonthCalculationInput = {
	id: number;
};

export type ImportedTransactionCalculationInput = {
	expenseMonthId: number;
	expenseId: number | null;
	amount: number;
};

export type ConfiguredExpenseCalculationInput = {
	expenseId: number;
	monthlyAmount: number;
};

export type RecurringExpenseAverage = {
	expenseId: number;
	total: number;
	monthlyAverage: number | null;
};

export type ExpenseHistorySummary = {
	importedMonthCount: number;
	configuredMonthlyTotal: number;
	recurring: RecurringExpenseAverage[];
	other: {
		total: number;
		monthlyAverage: number;
	} | null;
	livingCostEstimate: number | null;
	observedMonthlyAverage: number | null;
};

export type ExpenseHistoryMonthlySummary = {
	total: number;
	matched: number;
	other: number;
};

export function calculateExpenseHistoryMonthlySummary(
	transactions: readonly {
		amount: number;
		expense: unknown | null;
	}[],
): ExpenseHistoryMonthlySummary {
	let total = 0;
	let matched = 0;
	let other = 0;

	for (const transaction of transactions) {
		assertNonNegativeFiniteAmount(transaction.amount, "Transaction amount");
		total += transaction.amount;
		if (transaction.expense === null) {
			other += transaction.amount;
		} else {
			matched += transaction.amount;
		}
	}

	return { total, matched, other };
}

export function calculateExpenseHistoryClassificationTotals<
	Transaction extends { amount: number },
>(
	transactions: readonly Transaction[],
	getClassification: (transaction: Transaction) => string | null,
) {
	const totals = new Map<string, number>();
	for (const transaction of transactions) {
		assertNonNegativeFiniteAmount(transaction.amount, "Transaction amount");
		const classification = getClassification(transaction) ?? "Unclassified";
		totals.set(
			classification,
			(totals.get(classification) ?? 0) + transaction.amount,
		);
	}
	return [...totals.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value);
}

export function calculateExpenseHistorySummary({
	importedMonths,
	transactions,
	configuredExpenses,
}: {
	importedMonths: readonly ImportedMonthCalculationInput[];
	transactions: readonly ImportedTransactionCalculationInput[];
	configuredExpenses: readonly ConfiguredExpenseCalculationInput[];
}): ExpenseHistorySummary {
	const importedMonthIds = new Set(importedMonths.map(({ id }) => id));
	if (importedMonthIds.size !== importedMonths.length) {
		throw new Error("Imported month ids must be unique");
	}

	const configuredExpenseIds = new Set(
		configuredExpenses.map(({ expenseId }) => expenseId),
	);
	if (configuredExpenseIds.size !== configuredExpenses.length) {
		throw new Error("Configured expense ids must be unique");
	}

	let configuredMonthlyTotal = 0;
	const totalsByExpenseId = new Map<number, number>();
	for (const { expenseId, monthlyAmount } of configuredExpenses) {
		assertNonNegativeFiniteAmount(monthlyAmount, "Configured monthly amount");
		configuredMonthlyTotal += monthlyAmount;
		totalsByExpenseId.set(expenseId, 0);
	}

	let otherTotal = 0;
	let observedTotal = 0;
	for (const transaction of transactions) {
		if (!importedMonthIds.has(transaction.expenseMonthId)) {
			throw new Error(
				`Transaction references unknown imported month ${transaction.expenseMonthId}`,
			);
		}
		assertNonNegativeFiniteAmount(transaction.amount, "Transaction amount");
		observedTotal += transaction.amount;

		if (transaction.expenseId === null) {
			otherTotal += transaction.amount;
			continue;
		}

		const currentTotal = totalsByExpenseId.get(transaction.expenseId);
		if (currentTotal === undefined) {
			throw new Error(
				`Transaction references unknown configured expense ${transaction.expenseId}`,
			);
		}
		totalsByExpenseId.set(
			transaction.expenseId,
			currentTotal + transaction.amount,
		);
	}

	const importedMonthCount = importedMonthIds.size;
	const recurring = configuredExpenses.map(({ expenseId }) => {
		const total = totalsByExpenseId.get(expenseId) ?? 0;
		return {
			expenseId,
			total,
			monthlyAverage:
				importedMonthCount === 0 ? null : total / importedMonthCount,
		};
	});

	if (importedMonthCount === 0) {
		return {
			importedMonthCount,
			configuredMonthlyTotal,
			recurring,
			other: null,
			livingCostEstimate: null,
			observedMonthlyAverage: null,
		};
	}

	const otherMonthlyAverage = otherTotal / importedMonthCount;
	return {
		importedMonthCount,
		configuredMonthlyTotal,
		recurring,
		other: {
			total: otherTotal,
			monthlyAverage: otherMonthlyAverage,
		},
		livingCostEstimate: configuredMonthlyTotal + otherMonthlyAverage,
		observedMonthlyAverage: observedTotal / importedMonthCount,
	};
}

function assertNonNegativeFiniteAmount(amount: number, label: string) {
	if (!Number.isFinite(amount) || amount < 0) {
		throw new Error(`${label} must be a finite, non-negative number`);
	}
}
