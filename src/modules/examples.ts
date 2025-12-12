
export class BasicExampleFactory {
  static registerPrefs() {
    Zotero.PreferencePanes.register({
      pluginID: addon.data.config.addonID,
      src: rootURI + "content/preferences.xhtml",
      scripts: [],
      image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
    } as any);
  }
}
