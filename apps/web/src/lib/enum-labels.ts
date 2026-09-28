export function formatEnumLabel(value: string | null | undefined) {
	if (!value) return "—";

	const lowercaseWords = new Set(["and", "for", "in", "of", "on", "to"]);

	return value
		.toLowerCase()
		.split("_")
		.map((word, index) => {
			if (word === "dtm") return "DTM";
			if (index > 0 && lowercaseWords.has(word)) return word;
			return `${word[0]?.toUpperCase()}${word.slice(1)}`;
		})
		.join(" ");
}
