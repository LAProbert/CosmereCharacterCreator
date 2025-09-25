export class CharacterCreator extends FormApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.currentStep = 0;
    this.maxAttributePoints = 12;
    this.maxAttributeEach = 3;
    this.maxSkillPoints = 4;
    this.maxSkillEach = 2;
    this._packsCache = {};
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "cosmere-character-creator",
      title: "Cosmere Character Creator",
      template: TEMPLATE_PATHS.WIZARD,
      width: 900,
      height: "auto",
      resizable: true,
      classes: ["cosmere-wizard"]
    });
  }

  async _loadPackItems(packCollection) {
    if (!packCollection) return [];
    if (this._packsCache[packCollection]) return this._packsCache[packCollection];
    const pack = game.packs.get(packCollection);
    if (!pack) return [];
    try {
      const docs = await pack.getDocuments();
      const list = docs.map(d => ({
        _id: d.id ?? d._id,
        id: d.id ?? d._id,
        name: d.name,
        type: d.type ?? (d.system?.type ?? ""),
        system: d.system ?? {},
        img: d.img ?? null,
        sourcePack: pack.collection
      }));
      this._packsCache[packCollection] = list;
      return list;
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to load pack ${packCollection}`, err);
      ui.notifications.error(`Cosmere Creator: Failed to load compendium ${packCollection}`);
      return [];
    }
  }

  async getData(options = {}) {
    const ancestryPack = game.settings.get(MODULE_ID, "ancestriesCompendium");
    const culturesPack = game.settings.get(MODULE_ID, "culturesCompendium");
    const heroicPack = game.settings.get(MODULE_ID, "heroicPathsCompendium");
    const radiantPack = game.settings.get(MODULE_ID, "radiantPathsCompendium");
    const itemsPack = game.settings.get(MODULE_ID, "itemsCompendium");
    const skillsPack = game.settings.get(MODULE_ID, "skillsCompendium");

    const [
      ancestries,
      cultures,
      heroicPaths,
      radiantPaths,
      items,
      skillsDocs
    ] = await Promise.all([
      this._loadPackItems(ancestryPack),
      this._loadPackItems(culturesPack),
      this._loadPackItems(heroicPack),
      this._loadPackItems(radiantPack),
      this._loadPackItems(itemsPack),
      this._loadPackItems(skillsPack)
    ]);

    const heroicFiltered = heroicPaths.filter(d => {
      return (String(d.type || "").toLowerCase() === "path") || (d.system?.tags?.includes?.("path"));
    }).length ? heroicPaths.filter(d => (String(d.type || "").toLowerCase() === "path") || (d.system?.tags?.includes?.("path"))) : heroicPaths;

    const skills = (skillsDocs && skillsDocs.length) ? skillsDocs : DEFAULT_SKILLS.map(s => ({ name: s }));

    const defaultAttributes = {};
    for (const [label, key] of Object.entries(ATTRIBUTE_MAP)) defaultAttributes[key] = 0;

    let prefill = { name: "New Cosmere Hero", attributes: defaultAttributes, skillValues: {} };
    if (this.actor) {
      prefill.name = this.actor.name || prefill.name;
      const sysAttrs = (this.actor.system && this.actor.system.attributes) ? this.actor.system.attributes : {};
      for (const [label, key] of Object.entries(ATTRIBUTE_MAP)) {
        prefill.attributes[key] = Number(sysAttrs[key]?.value ?? sysAttrs[key] ?? 0);
      }
      for (const i of this.actor.items) {
        const type = i.type ?? i.system?.type;
        const tname = (game.settings.get(MODULE_ID, "skillItemType") || "skill");
        if (type === tname || DEFAULT_SKILLS.includes(i.name)) {
          prefill.skillValues[i.name] = Number(i.system?.value ?? i.system?.rank ?? 0);
        }
      }
    } else {
      for (const s of skills) prefill.skillValues[s.name ?? s] = 0;
    }

    return {
      ancestries,
      cultures,
      heroicPaths: heroicFiltered,
      radiantPaths,
      basicItems: items,
      skills,
      attributes: Object.keys(ATTRIBUTE_MAP),
      prefill,
      actor: this.actor ? { id: this.actor.id, name: this.actor.name } : null
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    this._html = html;
    const steps = html.find(".wizard-step");
    const showStep = (n) => {
      steps.hide();
      $(steps[n]).show();
      this.currentStep = n;
      html.find(".step-indicator").text(`Step ${n} / ${steps.length - 1}`);
      html.find(".prev-step").prop("disabled", n === 0);
      html.find(".next-step").prop("disabled", n === steps.length - 1);
    };
    showStep(this.currentStep);

    html.find(".next-step").on("click", ev => {
      ev.preventDefault();
      const next = Math.min(this.currentStep + 1, steps.length - 1);
      showStep(next);
      this._updatePreview();
    });
    html.find(".prev-step").on("click", ev => {
      ev.preventDefault();
      const prev = Math.max(this.currentStep - 1, 0);
      showStep(prev);
      this._updatePreview();
    });

    html.find("input[name^='attr-']").on("input", () => {
      this._enforceAttributePoints();
      this._renderExpertiseInputs();
      this._updatePreview();
    });

    html.find(".skill-input").on("input", () => {
      this._enforceSkillPoints();
      this._updatePreview();
    });

    html.find("input[name='culture']").on("change", (ev) => {
      const checked = html.find("input[name='culture']:checked");
      if (checked.length > 2) {
        ev.target.checked = false;
        ui.notifications.warn("You may select up to 2 cultures.");
      }
      this._updatePreview();
    });

    html.find("select[name='items']").on("change", () => this._updatePreview());
    html.find("input[name='character-name']").on("input", () => this._updatePreview());
    html.find("input[name='attr-Intellect']").on("input", () => {
      this._renderExpertiseInputs();
      this._updatePreview();
    });

    this._enforceAttributePoints();
    this._enforceSkillPoints();
    this._renderExpertiseInputs();
    this._updatePreview();
  }

  _updatePreview() {
    const html = this._html;
    if (!html) return;
    const name = html.find("input[name='character-name']").val() || "New Cosmere Hero";
    html.find("#preview-name").text(name);

    const ancestry = html.find("select[name='ancestry'] option:checked").text();
    html.find("#preview-ancestry").text(ancestry && ancestry !== "— None —" ? ancestry : "—");

    const cultures = html.find("input[name='culture']:checked").map((i,el) => $(el).parent().text().trim()).get().join(", ");
    html.find("#preview-culture").text(cultures || "—");

    const heroic = html.find("select[name='heroicPath'] option:checked").text();
    html.find("#preview-heroicPath").text(heroic && heroic !== "— None —" ? heroic : "—");

    const radiant = html.find("select[name='radiantPath'] option:checked").text();
    html.find("#preview-radiantPath").text(radiant && radiant !== "— None —" ? radiant : "—");

    for (const attr of Object.keys(ATTRIBUTE_MAP)) {
      const val = html.find(`input[name='attr-${attr}']`).val() || 0;
      html.find(`#preview-attr-${attr}`).text(val);
    }

    const skillsList = html.find("#preview-skills-list").empty();
    html.find(".skill-input").each((i, el) => {
      const $el = $(el);
      const name = $el.data("skill");
      const val = Number($el.val() || 0);
      if (val > 0) skillsList.append($("<li>").text(`${name}: ${val}`));
    });

    const exList = html.find("#preview-expertise-list").empty();
    html.find(".expertise-input").each((i, el) => {
      const txt = $(el).val()?.trim();
      if (txt) exList.append($("<li>").text(txt));
    });

    const itemsSel = html.find("select[name='items']").val() || [];
    const itemsPreview = html.find("#preview-items").empty();
    itemsSel.forEach(id => {
      const opt = html.find(`select[name='items'] option[value='${id}']`);
      if (opt.length) itemsPreview.append($("<div>").text(opt.text()));
    });
  }

  _enforceAttributePoints() {
    const html = this._html;
    if (!html) return;
    const inputs = html.find("input[name^='attr-']");
    let total = 0;
    inputs.each((i, el) => {
      const $el = $(el);
      let v = Number($el.val() || 0);
      if (v < 0) v = 0;
      if (v > this.maxAttributeEach) v = this.maxAttributeEach;
      $el.val(v);
      total += v;
    });
    if (total > this.maxAttributePoints) {
      let over = total - this.maxAttributePoints;
      $(inputs.get().reverse()).each((i, el) => {
        if (over <= 0) return;
        const $el = $(el);
        let v = Number($el.val() || 0);
        const reducible = Math.min(v, over);
        if (reducible > 0) {
          v -= reducible;
          over -= reducible;
          $el.val(v);
        }
      });
    }
    total = 0;
    inputs.each((i, el) => total += Number($(el).val() || 0));
    html.find("#attr-points-remaining").text(Math.max(0, this.maxAttributePoints - total));
  }

  _enforceSkillPoints() {
    const html = this._html;
    if (!html) return;
    const inputs = html.find(".skill-input");
    let total = 0;
    inputs.each((i, el) => {
      const $el = $(el);
      let v = Number($el.val() || 0);
      if (v < 0) v = 0;
      if (v > this.maxSkillEach) v = this.maxSkillEach;
      $el.val(v);
      total += v;
    });
    if (total > this.maxSkillPoints) {
      let over = total - this.maxSkillPoints;
      $(inputs.get().reverse()).each((i, el) => {
        if (over <= 0) return;
        const $el = $(el);
        let v = Number($el.val() || 0);
        const reducible = Math.min(v, over);
        if (reducible > 0) {
          v -= reducible;
          over -= reducible;
          $el.val(v);
        }
      });
    }
    total = 0;
    inputs.each((i, el) => total += Number($(el).val() || 0));
    html.find("#skills-points-remaining").text(Math.max(0, this.maxSkillPoints - total));
  }

  _renderExpertiseInputs() {
    const html = this._html;
    if (!html) return;
    const intellect = Number(html.find("input[name='attr-Intellect']").val() || 0);
    const container = html.find(".expertise-container").empty();
    for (let i = 1; i <= intellect; i++) {
      const el = $(`<input class="expertise-input" type="text" name="expertise-${i}" placeholder="Expertise ${i}" />`);
      el.on("input", () => this._updatePreview());
      container.append($("<div>").addClass("expertise-row").append(el));
    }
  }

  async _updateObject(event, formData) {
    event?.preventDefault?.();

    const html = this._html;
    if (!html) return;

    const name = formData["character-name"] || html.find("input[name='character-name']").val() || "New Cosmere Hero";

    // Build attribute values
    const attrValues = {};
    for (const attrLabel of Object.keys(ATTRIBUTE_MAP)) {
      const key = ATTRIBUTE_MAP[attrLabel];
      const val = Number(html.find(`input[name='attr-${attrLabel}']`).val() || 0);
      attrValues[key] = val;
    }

    // Create actor if needed, or update attributes preserving other system data
    let actor;
    try {
      if (this.actor) {
        actor = this.actor;
        // Build dot-path update object so other system fields are preserved
        const updates = { name };
        for (const [k, v] of Object.entries(attrValues)) updates[`system.attributes.${k}.value`] = v;
        await actor.update(updates);
      } else {
        // construct initial attributes object to satisfy common system schemas
        const sysAttrs = {};
        for (const [k, v] of Object.entries(attrValues)) sysAttrs[k] = { value: v };
        actor = await Actor.create({ name, type: "character", system: { attributes: sysAttrs } }, { renderSheet: true });
      }
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to create/update actor`, err);
      return ui.notifications.error("Failed to create or update actor.");
    }

    // Deduplicate items previously created by this module (if updating an existing actor)
    try {
      if (this.actor) {
        const toDelete = actor.items.filter(i => i.getFlag(MODULE_ID, "createdBy"));
        if (toDelete.length) {
          await actor.deleteEmbeddedDocuments("Item", toDelete.map(i => i.id));
        }
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | Could not remove previous items:`, err);
    }

    // Prepare to create items (ancestry, cultures, paths, basic items)
    const packSettingMap = {
      ancestry: game.settings.get(MODULE_ID, "ancestriesCompendium"),
      culture: game.settings.get(MODULE_ID, "culturesCompendium"),
      heroicPath: game.settings.get(MODULE_ID, "heroicPathsCompendium"),
      radiantPath: game.settings.get(MODULE_ID, "radiantPathsCompendium"),
      items: game.settings.get(MODULE_ID, "itemsCompendium")
    };

    const toCreate = [];

    // Helper to load a pack document and convert to object with flags
    const loadAndFlag = async (packCollection, id) => {
      if (!packCollection || !id) return null;
      const pack = game.packs.get(packCollection);
      if (!pack) return null;
      try {
        const doc = await pack.getDocument(id);
        if (!doc) return null;
        const obj = doc.toObject();
        obj.flags = obj.flags || {};
        obj.flags[MODULE_ID] = { createdBy: true, sourcePack: pack.collection, sourceId: id };
        return obj;
      } catch (err) {
        console.warn(`${MODULE_ID} | Failed to load document ${id} from ${packCollection}`, err);
        return null;
      }
    };

    // ancestry
    const ancestryId = html.find("select[name='ancestry']").val();
    if (ancestryId && packSettingMap.ancestry) {
      const obj = await loadAndFlag(packSettingMap.ancestry, ancestryId);
      if (obj) toCreate.push(obj);
    }

    // cultures (0..2)
    const cultureVals = html.find("input[name='culture']:checked").map((i,el) => $(el).val()).get();
    for (const cv of cultureVals) {
      if (cv && packSettingMap.culture) {
        const obj = await loadAndFlag(packSettingMap.culture, cv);
        if (obj) toCreate.push(obj);
      }
    }

    // heroicPath
    const heroicId = html.find("select[name='heroicPath']").val();
    if (heroicId && packSettingMap.heroicPath) {
      const obj = await loadAndFlag(packSettingMap.heroicPath, heroicId);
      if (obj) toCreate.push(obj);
    }

    // radiantPath
    const radiantId = html.find("select[name='radiantPath']").val();
    if (radiantId && packSettingMap.radiantPath) {
      const obj = await loadAndFlag(packSettingMap.radiantPath, radiantId);
      if (obj) toCreate.push(obj);
    }

    // basic items multi-select
    const selectedItems = html.find("select[name='items']").val() || [];
    if (selectedItems.length && packSettingMap.items) {
      for (const id of selectedItems) {
        const obj = await loadAndFlag(packSettingMap.items, id);
        if (obj) toCreate.push(obj);
      }
    }

    // Skills as items (use configured item type)
    const skillItemType = game.settings.get(MODULE_ID, "skillItemType") || "skill";
    html.find(".skill-input").each((i, el) => {
      const $el = $(el);
      const sname = $el.data("skill");
      const sval = Number($el.val() || 0);
      if (!sname) return;
      if (sval > 0) {
        const itemData = {
          name: sname,
          type: skillItemType,
          img: "icons/svg/book.svg",
          system: { value: sval },
          flags: { [MODULE_ID]: { createdBy: true, generated: true } }
        };
        toCreate.push(itemData);
      }
    });

    // Expertises
    const expertiseItemType = game.settings.get(MODULE_ID, "expertiseItemType") || "expertise";
    html.find(".expertise-input").each((i, el) => {
      const txt = $(el).val()?.trim();
      if (txt) {
        const obj = {
          name: txt,
          type: expertiseItemType,
          img: "icons/svg/target.svg",
          system: { value: 1 },
          flags: { [MODULE_ID]: { createdBy: true, generated: true } }
        };
        toCreate.push(obj);
      }
    });

    // Bulk create embedded items
    try {
      if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to create embedded items`, err);
      ui.notifications.error("Failed to create some items on the actor.");
    }

    try { actor.sheet?.render(true); } catch (err) {}
    ui.notifications.info("Cosmere Character Creator: Character saved.");
    this.close();
  }
}
