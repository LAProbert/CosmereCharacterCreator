export const SYSTEM_ID = "cosmere-rpg";
export const MODULE_ID = "cosmere-character-creator";

export const TEMPLATE_PATHS = {
	WIZARD: `modules/${MODULE_ID}/templates/wizard.html`,
	SETTINGS: `modules/${MODULE_ID}/templates/settings.html`
};

export const ATTRIBUTE_MAP = {
	Strength: "str",
	Speed: "spd",
	Intellect: "int",
	Willpower: "wil",
	Awareness: "awa",
	Presence: "pre"
};

export const DEFAULT_SKILLS = [
	"Agility", "Athletics", "Heavy Weaponry", "Light Weaponry", "Stealth", "Thievery", "Crafting",
	"Deduction", "Discipline", "Intimidation", "Lore", "Medicine", "Deception", "Insight", "Leadership",
	"Perception", "Persuasion", "Survival"
];

// Minimal settings (created with config: false; FormApplication menu handles UI)
export const settingKeys = [
	"ancestriesCompendium",
	"culturesCompendium",
	"heroicPathsCompendium",
	"radiantPathsCompendium",
	"itemsCompendium",
	"skillsCompendium",
	"expertiseCompendium",
	"skillItemType",
	"expertiseItemType"
];
