// Type definitions for Zotero 7 Plugin API

import { ZoteroToolkit } from "zotero-plugin-toolkit";

// Global ZToolkit type
type ZToolkit = ZoteroToolkit;

interface BootstrapParams {
  id: string;
  version: string;
  rootURI: string;
}

interface MainWindowParams {
  window: Window;
}

interface ZoteroWindow extends Window {
  ZoteroPane?: any;
  MozXULElement: {
    insertFTLIfNeeded(ftlFile: string): void;
  };
}

interface ZoteroPrefs {
  get(pref: string, global?: boolean): any;
  set(pref: string, value: any, global?: boolean): void;
}

interface ZoteroPreferencePaneOptions {
  pluginID: string;
  src: string;
  scripts: string[];
}

interface ZoteroPreferencePanes {
  register(options: ZoteroPreferencePaneOptions): void;
  unregister(pluginID: string): void;
}

interface ZoteroAPI {
  debug(message: string): void;
  getMainWindows(): ZoteroWindow[];
  Prefs: ZoteroPrefs;
  PreferencePanes: ZoteroPreferencePanes;
}

declare const Zotero: ZoteroAPI;

interface ServicesScriptLoader {
  loadSubScript(url: string, target?: any): void;
}

interface ServicesIO {
  newURI(uri: string): any;
}

interface ServicesAPI {
  scriptloader: ServicesScriptLoader;
  io: ServicesIO;
}

declare const Services: ServicesAPI;

// XUL Element types
interface XULElement extends HTMLElement {
  checked?: boolean;
}

interface ZoteroDocument extends Document {
  createXULElement(tagName: string): XULElement;
}

// Global variables
import type Addon from "./addon";

declare global {
  const __env__: "development" | "production";
  const _globalThis: {
    addon: Addon;
    [key: string]: any;
  };
  const addon: Addon;
  const ztoolkit: ZToolkit;

  // Firefox XPCOM globals
  const Cc: any;
  const Ci: any;
  const Cu: any;
  const Cr: any;
  const Components: any;
}
