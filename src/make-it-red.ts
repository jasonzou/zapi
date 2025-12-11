/// <reference path="types.d.ts" />

interface MakeItRedPlugin {
	id: string | null;
	version: string | null;
	rootURI: string | null;
	initialized: boolean;
	addedElementIDs: string[];

	init(params: BootstrapParams): void;
	log(msg: string): void;
	addToWindow(window: ZoteroWindow): void;
	addToAllWindows(): void;
	storeAddedElement(elem: Element): void;
	removeFromWindow(window: ZoteroWindow): void;
	removeFromAllWindows(): void;
	toggleGreen(window: ZoteroWindow, enabled: boolean): void;
	main(): Promise<void>;
}

declare global {
	var MakeItRed: MakeItRedPlugin;
}

(globalThis as any).MakeItRed = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],

	init({ id, version, rootURI }: BootstrapParams): void {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},

	log(msg: string): void {
		Zotero.debug("Make It Red: " + msg);
	},

	addToWindow(window: ZoteroWindow): void {
		const doc = window.document as ZoteroDocument;

		// Add a stylesheet to the main Zotero pane
		const link1 = doc.createElement('link') as HTMLLinkElement;
		link1.id = 'make-it-red-stylesheet';
		link1.type = 'text/css';
		link1.rel = 'stylesheet';
		link1.href = (this.rootURI || '') + 'style.css';
		doc.documentElement.appendChild(link1);
		const color = (Zotero.Prefs.get("extensions.make-it-red.color",true) || "#ff0000") as string;
		doc.documentElement.style.setProperty('--make-it-red-style-color', color);
		this.storeAddedElement(link1);

		// Use Fluent for localization
		window.MozXULElement.insertFTLIfNeeded("make-it-red.ftl");

		// Add menu option
		const menuitem = doc.createXULElement('menuitem') as XULElement;
		menuitem.id = 'make-it-green-instead';
		menuitem.setAttribute('type', 'checkbox');
		menuitem.setAttribute('data-l10n-id', 'make-it-red-green-instead');
		// MozMenuItem#checked is available in Zotero 7
		menuitem.addEventListener('command', () => {
			MakeItRed.toggleGreen(window, menuitem.checked || false);
		});
		const viewPopup = doc.getElementById('menu_viewPopup');
		if (viewPopup) {
			viewPopup.appendChild(menuitem);
		}
		this.storeAddedElement(menuitem);
	},

	addToAllWindows(): void {
		const windows = Zotero.getMainWindows();
		for (const win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},

	storeAddedElement(elem: Element): void {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},

	removeFromWindow(window: ZoteroWindow): void {
		const doc = window.document;
		// Remove all elements added to DOM
		for (const id of this.addedElementIDs) {
			doc.getElementById(id)?.remove();
		}
		const ftlLink = doc.querySelector('[href="make-it-red.ftl"]');
		if (ftlLink) {
			ftlLink.remove();
		}
	},

	removeFromAllWindows(): void {
		const windows = Zotero.getMainWindows();
		for (const win of windows) {
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},

	toggleGreen(window: ZoteroWindow, enabled: boolean): void {
		window.document.documentElement
			.toggleAttribute('data-green-instead', enabled);
	},

	async main(): Promise<void> {
		// Global properties are included automatically in Zotero 7
		const host = new URL('https://foo.com/path').host;
		this.log(`Host is ${host}`);

		// Retrieve a global pref
		this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
		this.log(`Color is ${Zotero.Prefs.get('extensions.make-it-red.color', true)}`);
	},
} as MakeItRedPlugin;

export {};
