export const capitalize = (str: string) => {
	const words = str.trim().split(" ");

	words.forEach((word, i) => {
		const letters = word.split("");

		if (letters[0]) {
			letters[0] = letters[0].toUpperCase();
		}

		const capitalizedWord = letters.join("");

		words[i] = capitalizedWord;
	});

	return words.join(" ");
};
