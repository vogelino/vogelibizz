import {
	currencyEnum,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";

function randomItemFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomToMax(max: number) {
	const min = 0;
	const floatRandom = Math.random();
	const difference = max - min;
	const random = Math.round(difference * floatRandom);
	const randomWithinRange = random + min;
	return randomWithinRange;
}

const expensesSeedData = Array(randomToMax(100))
	.fill(null)
	.map((_, i) => ({
		name: `Expense ${i + 1}`,
		category: randomItemFromArray(expenseCategoryEnum.enumValues),
		type: randomItemFromArray(expenseTypeEnum.enumValues),
		rate: randomItemFromArray(expenseRateEnum.enumValues),
		price: randomToMax(100000),
		original_currency: randomItemFromArray(currencyEnum.enumValues),
	}));

export default expensesSeedData;
