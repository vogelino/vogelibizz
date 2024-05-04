import projects from "./projectsSeedData";

const firstQuote = projects[0].quotes[0];
type QuoteSeedType = typeof firstQuote;

const allQuotes = projects
	.reduce((acc, project) => {
		for (const quote of project.quotes) {
			acc.set(quote.name, quote);
		}
		return acc;
	}, new Map<string, QuoteSeedType>())
	.values();

export default Array.from(allQuotes);
