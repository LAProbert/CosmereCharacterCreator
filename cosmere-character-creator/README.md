Cosmere Character Creator
=========================

Foundry VTT module to create Cosmere RPG characters via a multi-step wizard.

Version: 1.0.0
Module ID: cosmere-character-creator

Overview
--------
This module presents a multi-step wizard to create or update Cosmere RPG characters.
It sources ancestries, cultures, paths, items, skills and expertises from configurable compendia.

Features
- 8-step wizard:
  0. Name
  1. Ancestry
  2. Culture (checkboxes, max 2)
  3. Heroic Path (filtered to type "Path")
  4. Radiant Path
  5. Attributes (point allocation)
  6. Skills & Expertises
  7. Items
- Supports updating an open character sheet (actor) instead of creating a new Actor.
- Loads compendium data using Foundry VTT v12 API (pack.getDocuments, pack.getDocument).
- Configurable compendium selections and item type names via a settings dialog.
- Live preview of the created character.
- Sidebar button and actor-sheet header button for quick access.

Installation
------------
1. Place the folder `cosmere-character-creator` into your Foundry Data directory under `Data/modules/`.
2. In Foundry, go to "Manage Modules" and enable "Cosmere Character Creator".
3. Ensure you enable the module for your World.

Configuration
-------------
1. Navigate to Settings -> Module Settings -> Cosmere Character Creator -> Configure.
2. In the Configure dialog, select compendia for:
   - Ancestries
   - Cultures
   - Heroic Paths
   - Radiant Paths
   - Items (basic items)
   - Skills
   - Expertises
3. If your Cosmere RPG system uses different item.types for skills/expertises, set those in the configuration (defaults: "skill" and "expertise").

Using the Wizard
----------------
- Open the Actors sidebar. The module adds a button (wizard/hat icon) to the Actors directory footer. Click it to open the wizard.
- From an open Actor sheet (character type), use the feather icon appended to the header to open the wizard prefilled and configured to update that actor.
- Follow the steps to set name, ancestry, cultures (max 2), heroic/radiant paths, attributes (12 points, max 3 each), skills & expertises (4 points total, max 2 per skill), and starting items.
- Click Finish to create the Actor (or update the selected Actor).
- After creation/update, the actor's sheet is rendered and embedded items are added to the Items tab.

Testing
-------
- Create sample compendia containing items for ancestries, cultures, paths, skills and expertises.
- In module configuration select those compendia.
- Open the wizard and verify lists populate.
- Create a sample character and verify:
  - Actor created or updated in Actors directory.
  - Actor.system.attributes contains mapped attributes (system.attributes.<key>.value).
  - Skills and expertises appear under the Actor's Items tab.
- For debugging, open browser console and call:
  - window.CosmereCharacterCreator._testLoadPacks()
  This returns the loaded data arrays used by the wizard for inspection.

Notes on Compatibility with Cosmere RPG system
----------------------------------------------
- The module maps human-facing attributes to system keys via ATTRIBUTE_MAP in main.js.
  Default mapping:
    Strength -> str
    Speed -> spd
    Intellect -> int
    Willpower -> wil
    Awareness -> awa
    Presence -> pre

- Skills and Expertises are created as Items. The Item.type strings used can be configured in module settings.

- If your system uses a different schema for items or attributes, you may need to adapt the payload construction in main.js (createEmbeddedDocuments payloads and attribute property paths).

Development & Extension
-----------------------
- The module is written to be extended with SYSTEM_MAP adapters, talent trees, or alternate skill storage strategies.
- Use window.CosmereCharacterCreator.open({ prefill: { actorId, name }}) to programmatically open the wizard.

Support
-------
Report issues at the module homepage URL in module.json or contact the module author.

License
-------
MIT
