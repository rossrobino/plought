export const capitalize = (str: string) => {
	const words = str.trim().split(" ");

	words.forEach(
		(word, i) => (words[i] = word.slice(0, 1).toUpperCase() + word.slice(1)),
	);

	return words.join(" ");
};
