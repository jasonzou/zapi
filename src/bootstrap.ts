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

declare var MakeItRed: MakeItRedPlugin;

function log(msg: string): void {
	Zotero.debug("Make It Red - Jason: " + msg);
}

function install(): void {
	log("Installed 2.0");
}

async function startup({ id, version, rootURI }: BootstrapParams): Promise<void> {
	log("Starting 2.0");

	Zotero.PreferencePanes.register({
		pluginID: 'make-it-red@gmail.com',
		src: rootURI + 'preferences.xhtml',
		scripts: [rootURI + 'preferences.js']
	});

	Services.scriptloader.loadSubScript(rootURI + 'make-it-red.js');
	MakeItRed.init({ id, version, rootURI });
	MakeItRed.addToAllWindows();
	await MakeItRed.main();
}

function onMainWindowLoad({ window }: MainWindowParams): void {
	MakeItRed.addToWindow(window as ZoteroWindow);
}

function onMainWindowUnload({ window }: MainWindowParams): void {
	MakeItRed.removeFromWindow(window as ZoteroWindow);
}

function shutdown(): void {
	log("Shutting down 2.0");
	MakeItRed.removeFromAllWindows();
	delete (globalThis as any).MakeItRed;
}

function uninstall(): void {
	log("Uninstalled 2.0");
}
