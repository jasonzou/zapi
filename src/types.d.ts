// Type definitions for Zotero 7 Plugin API

import { ZoteroToolkit } from "zotero-plugin-toolkit";
import type Addon from "./addon";

// Global type declarations
declare global {
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
    openPreferences?(paneID?: string, options?: any): void;
  }

  interface ZoteroPrefs {
    get(pref: string, global?: boolean): any;
    set(pref: string, value: any, global?: boolean): void;
    clear(pref: string, global?: boolean): void;
    registerObserver(pref: string, callback: any, thisArg?: any): symbol;
    unregisterObserver(id: symbol): void;
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
    logError(error: any): void;
    getMainWindows(): ZoteroWindow[];
    getMainWindow(): ZoteroWindow;
    Prefs: ZoteroPrefs;
    PreferencePanes: ZoteroPreferencePanes;
    Items: any;
    Libraries: any;
    Collections: any;
    Search: any;
    CreatorTypes: any;
    Utilities: any;
    initializationPromise: Promise<void>;
    unlockPromise: Promise<void>;
    uiReadyPromise: Promise<void>;
    version: string;
  }

  const Zotero: ZoteroAPI;

  interface ServicesScriptLoader {
    loadSubScript(url: string, target?: any): void;
  }

  interface ServicesIO {
    newURI(uri: string): any;
  }

  interface ServicesPrompt {
    alert(parent: any, title: string, text: string): void;
  }

  interface ServicesPrefs {
    // Firefox preferences service
    [key: string]: any;
  }

  interface ServicesAPI {
    scriptloader: ServicesScriptLoader;
    io: ServicesIO;
    prompt: ServicesPrompt;
    prefs: ServicesPrefs;
  }

  const Services: ServicesAPI;

  // XUL Element types
  interface XULElement extends HTMLElement {
    checked?: boolean;
  }

  interface ZoteroDocument extends Document {
    createXULElement(tagName: string): XULElement;
  }

  class Localization {
    constructor(paths: string[], generateBundles?: boolean);
    formatMessagesSync(messages: any[]): any[];
  }

  // Zotero Types namespace
  namespace _ZoteroTypes {
    interface Item {
      id: number;
      key: string;
      libraryID: number;
      // Add other item properties as needed
      [key: string]: any;
    }

    interface MainWindow extends ZoteroWindow {
      // Add MainWindow-specific properties
    }

    interface Prefs {
      [key: string]: any;
    }
  }

  // Zotero namespace for types
  namespace Zotero {
    interface Collection {
      id: number;
      key: string;
      name: string;
      parentID: number | null;
      // Add other collection properties as needed
      [key: string]: any;
    }

    interface Item {
      id: number;
      key: string;
      libraryID: number;
      // Add other item properties as needed
      [key: string]: any;
    }
  }

  // Fluent types
  type FluentMessageId = string;

  // Global variables
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
  const OS: any;
  const rootURI: string;
}

export {}
