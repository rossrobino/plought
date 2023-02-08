export const capitalize = (str: string) => {
	const list = str.trim().split(" ");
	list.forEach((word, i) => {
		const splitWord = word.split("");
		splitWord[0] = splitWord[0].toUpperCase();
		const joinedWord = splitWord.join("");
		list[i] = joinedWord;
	});
	return list.join(" ");
};
