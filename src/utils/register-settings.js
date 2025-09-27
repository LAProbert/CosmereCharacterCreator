import { CosmereSettingsForm } from "../applications/cosmere-settings-form";
import { settingKeys, MODULE_ID } from "./constants";

export function registerSettings() {
	for (const key of settingKeys) {
		if (!game.settings.settings.has(`${MODULE_ID}.${key}`)) {
			game.settings.register(MODULE_ID, key, {
				name: key,
				scope: "world",
				config: false,
				type: String,
				default: ""
			});
		}
	}

	game.settings.registerMenu(MODULE_ID, "compendiums", {
		name: "Cosmere Compendiums",
		label: "Configure Cosmere Compendiums",
		icon: "fas fa-book",
		type: CosmereSettingsForm,
		restricted: true
	});
}
