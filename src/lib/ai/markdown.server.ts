import { marked } from "marked";

const attr = /[&"<]/g;
const map = { "&": "&amp;", '"': "&quot;", "<": "&lt;" } as const;

const escape = (value: string) => {
	return value.replace(attr, (char) => map[char as keyof typeof map]);
};

export const renderMarkdown = (value: string) => {
	return marked.parseInline(escape(value), { async: false, breaks: true });
};
