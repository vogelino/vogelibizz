import {
	currencyEnum,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
import { randomItemFromArray, randomToMax } from "@/utility/randomUti";

const expensesSeedData = Array(randomToMax(100))
	.fill(null)
	.map((_, i) => ({
		name: `Expense ${i + 1}`,
		category: randomItemFromArray(expenseCategoryEnum.enumValues),
		type: randomItemFromArray(expenseTypeEnum.enumValues),
		rate: randomItemFromArray(expenseRateEnum.enumValues),
		originalPrice: randomToMax(100000),
		originalCurrency: randomItemFromArray(currencyEnum.enumValues),
	}));

export default expensesSeedData;
