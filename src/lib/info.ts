export const info = {
	author: { name: "Ross Robino", url: "https://robino.dev" },
	name: "Plought",
	github: "https://github.com/rossrobino/plought",
};

class App {
	path: string;
	desc: string;

	constructor(path: string, desc: string) {
		this.path = path;
		this.desc = desc;
	}

	get title() {
		return this.getTitle();
	}

	getTitle() {
		return this.path.replace(/[^A-Z]/gi, " ");
	}
}

export const apps = [
	new App("/weighted-sum", "Evaluate alternatives based on weighted criteria."),
];
