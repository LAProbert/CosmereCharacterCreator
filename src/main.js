/* eslint-disable no-undef */

import { CharacterCreator } from "./applications/character-creator";
import { MODULE_ID, SYSTEM_ID } from "./utils/constants";
import { registerHandlebars } from "./utils/register-handlebars";
import { registerSettings } from "./utils/register-settings";

/*
  Cosmere Character Creator - main.js (updated)
  Foundry VTT v12 — attribute merge, item deduplication, creation flags
*/
Hooks.once("init", () => {
	console.log(`${MODULE_ID} | Initializing`);

	registerHandlebars();
	registerSettings();
});

Hooks.once("ready", () => {
	console.log(`${MODULE_ID} | Ready`);
}),

Hooks.on("getSceneControlButtons", controls => {
	const tokenControls = controls.find(c => c.name === "token");
	if (!tokenControls) return;
	tokenControls.tools.push({
		name: "cosmere-wizard",
		title: "Open Cosmere Character Creator",
		icon: "fas fa-hat-wizard",
		onClick: () => new CharacterCreator().render(true),
		button: true
	});
});

//CosmereActor
Hooks.on("renderCOSMERE.Actor.Sheet", (app, html) => {
	const actor = app.COSMERE.Actor.Sheet;
	if (!actor) return;
	if (html.find(".header-button.cosmere-wizard").length) return;
	const btn = $(`<button class="header-button cosmere-wizard" title="Open Cosmere Character Creator"><i class="fas fa-hat-wizard"></i></button>`);
	btn.on("click", () => new CharacterCreator({ actor }).render(true));
	html.find(".window-title").after(btn);
});
