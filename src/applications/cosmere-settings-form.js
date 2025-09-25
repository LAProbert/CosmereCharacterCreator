export class CosmereSettingsForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "cosmere-settings",
      title: "Cosmere Character Creator — Compendium Settings",
      template: TEMPLATE_PATHS.SETTINGS,
      width: 600,
      resizable: true
    });
  }

  getData() {
    const packs = Array.from(game.packs).map(p => ({
      id: p.collection,
      label: `[${p.metadata.packageName}] ${p.metadata.label} (${p.collection})`
    })).sort((a,b) => a.label.localeCompare(b.label));

    return {
      packs,
      ancestriesCompendium: game.settings.get(MODULE_ID, "ancestriesCompendium"),
      culturesCompendium: game.settings.get(MODULE_ID, "culturesCompendium"),
      heroicPathsCompendium: game.settings.get(MODULE_ID, "heroicPathsCompendium"),
      radiantPathsCompendium: game.settings.get(MODULE_ID, "radiantPathsCompendium"),
      itemsCompendium: game.settings.get(MODULE_ID, "itemsCompendium"),
      skillsCompendium: game.settings.get(MODULE_ID, "skillsCompendium"),
      expertiseCompendium: game.settings.get(MODULE_ID, "expertiseCompendium"),
      skillItemType: game.settings.get(MODULE_ID, "skillItemType") || "skill",
      expertiseItemType: game.settings.get(MODULE_ID, "expertiseItemType") || "expertise"
    };
  }

  async _updateObject(event, formData) {
    await game.settings.set(MODULE_ID, "ancestriesCompendium", formData.ancestriesCompendium || "");
    await game.settings.set(MODULE_ID, "culturesCompendium", formData.culturesCompendium || "");
    await game.settings.set(MODULE_ID, "heroicPathsCompendium", formData.heroicPathsCompendium || "");
    await game.settings.set(MODULE_ID, "radiantPathsCompendium", formData.radiantPathsCompendium || "");
    await game.settings.set(MODULE_ID, "itemsCompendium", formData.itemsCompendium || "");
    await game.settings.set(MODULE_ID, "skillsCompendium", formData.skillsCompendium || "");
    await game.settings.set(MODULE_ID, "expertiseCompendium", formData.expertiseCompendium || "");
    await game.settings.set(MODULE_ID, "skillItemType", formData.skillItemType || "skill");
    await game.settings.set(MODULE_ID, "expertiseItemType", formData.expertiseItemType || "expertise");
    ui.notifications.info("Cosmere Character Creator settings saved.");
  }
}
