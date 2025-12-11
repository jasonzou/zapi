/// <reference path="types.d.ts" />
var MakeItRed_Preferences = {
	init() {
		Zotero.debug("Make It Red: Initialize preference pane");

		const prefKey = 'extensions.make-it-red.color';
		const picker = document.getElementById("make-it-red-color") as HTMLInputElement;

		if (!picker) {
			Zotero.debug("Make It Red: Color picker element not found");
			return;
		}

		// Set default preference if not already set
		if (!Zotero.Prefs.get(prefKey, true)) {
			Zotero.Prefs.set(prefKey, '#ff0000');
		}

		// Load current preference value into the color picker
		const currentColor = Zotero.Prefs.get(prefKey, true);
		if (currentColor) {
			picker.value = currentColor as string;
		}

		// Save preference and update all windows when color changes
		picker.addEventListener("input", (e) => {
			const target = e.target as HTMLInputElement;
			const newColor = target.value;

			// Save to preferences
			Zotero.Prefs.set(prefKey, newColor);

			// Update CSS variable in all open Zotero windows
			for (let win of Zotero.getMainWindows()) {
				if (!win.ZoteroPane) continue;
				win.document.documentElement.style.setProperty('--make-it-red-style-color', newColor);
			}
		});
	}
};