export function registerHandlebars() {
	Handlebars.registerHelper("lowercase", s => (s || "").toLowerCase());
	Handlebars.registerHelper("ifEquals", (a, b, opts) => (a == b) ? opts.fn(this) : opts.inverse(this));
	Handlebars.registerHelper("ifContains", (value, array, opts) => (Array.isArray(array) && array.includes(value)) ? opts.fn(this) : opts.inverse(this));
	Handlebars.registerHelper("eq", (a, b) => a === b);
}
