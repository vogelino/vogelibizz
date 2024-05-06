export function randomItemFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function randomToMax(max: number) {
	const min = 0;
	const floatRandom = Math.random();
	const difference = max - min;
	const random = Math.round(difference * floatRandom);
	const randomWithinRange = random + min;
	return randomWithinRange;
}
