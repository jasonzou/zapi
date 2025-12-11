# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZApi is a Zotero 7 plugin that provides REST API endpoints and Model Context Protocol (MCP) integration for accessing Zotero library data. The plugin runs an HTTP server within Zotero that AI clients can connect to via MCP protocol to search, retrieve, and analyze research items, annotations, PDFs, and collections.

## Build Commands

```bash
# Build the plugin (creates XPI in .scaffold/build/)
npm run build

# Start development server with hot reload
npm run start

# Run tests
npm run test

# Lint code
npm run lint:check
npm run lint:fix

# Clean build artifacts
npm run clean
```

The build process:
1. Uses `zotero-plugin-scaffold` to bundle TypeScript source
2. Compiles TypeScript with esbuild (target: Firefox 115)
3. Entry point: `src/index.ts` → `.scaffold/build/addon/content/scripts/zapi.js`
4. Processes template variables in `addon/manifest.json` and `addon/bootstrap.js`
5. Creates XPI package in `.scaffold/build/`

## Architecture Overview

### Build System

This plugin uses the **zotero-plugin-scaffold** system (NOT the legacy Make It Red approach). Key differences:

- **Modern build**: Uses `zotero-plugin-scaffold` CLI with esbuild bundling
- **Configuration**: `zotero-plugin.config.ts` defines build settings
- **Bootstrap pattern**: `addon/bootstrap.js` is a template that registers the plugin
- **Template variables**: `__addonRef__`, `__addonInstance__`, `__addonName__`, etc. are replaced during build

### Plugin Lifecycle

The plugin follows Zotero 7's bootstrap architecture:

1. **startup()** (in `addon/bootstrap.js`)
   - Registers chrome manifest
   - Loads bundled script into sandbox context (`ctx`)
   - Calls `Zotero.__addonInstance__.hooks.onStartup()`

2. **onStartup()** (in `src/hooks.ts`)
   - Waits for Zotero initialization promises
   - Initializes MCP settings with defaults
   - Starts HTTP server if enabled
   - Registers preference change observers
   - Shows first-install configuration prompt

3. **onMainWindowLoad()** / **onMainWindowUnload()**
   - Per-window initialization
   - Loads Fluent localization files

4. **shutdown()**
   - Stops HTTP server
   - Cleans up observers and ztoolkit registrations

### Code Structure

**Entry Points:**
- `src/index.ts` - Creates global `addon` object and initializes toolkit
- `src/addon.ts` - Main `Addon` class containing data and API surface
- `src/hooks.ts` - Lifecycle event handlers (startup, shutdown, window load/unload, prefs)

**Core Services:**
- `src/modules/httpServer.ts` - Main HTTP server class using nsIServerSocket
- `src/modules/streamableMCPServer.ts` - MCP protocol implementation
- `src/modules/apiHandlers.ts` - REST endpoint handlers for search, collections, etc.
- `src/modules/serverPreferences.ts` - Manages server port and enabled state

**Content Processing:**
- `src/modules/unifiedContentExtractor.ts` - Extracts fulltext from PDFs, notes, webpages
- `src/modules/smartAnnotationExtractor.ts` - Processes annotations and highlights
- `src/modules/searchEngine.ts` - Advanced search with relevance scoring
- `src/modules/aiInstructionsManager.ts` - Adds AI guidance to response metadata

**Utilities:**
- `src/utils/ztoolkit.ts` - Creates ZToolkit instance for UI operations
- `src/utils/prefs.ts` - Preference management helpers
- `src/utils/locale.ts` - Localization utilities

### HTTP Server Implementation

The server runs on port 3000 (configurable) and handles:

**MCP Endpoints:**
- `POST /mcp` - Main MCP protocol endpoint (JSON-RPC 2.0)
- `GET /mcp/status` - Server status and capabilities
- `GET /capabilities` or `/help` - Full API documentation

**Testing Endpoints:**
- `GET /ping` - Health check (returns "pong")
- `GET /test/mcp` - Integration testing

**Key Implementation Details:**
- Uses Firefox's `nsIServerSocket` for networking
- Custom request parsing with UTF-8 converter streams
- Session management for MCP connections (30s keep-alive, 5min timeout)
- Graceful handling of empty connections (health checks)

### MCP Protocol Integration

The plugin implements MCP (Model Context Protocol) for AI client integration:

**Available MCP Tools:**
- `search_library` - Advanced search with fulltext, boolean operators, relevance scoring
- `search_annotations` - Search notes and PDF annotations
- `search_fulltext` - Search within fulltext content with context
- `get_item_details` - Get metadata for specific items
- `get_item_fulltext` - Get comprehensive fulltext (PDFs, notes, abstracts, webpages)
- `get_attachment_content` - Extract text from specific attachments
- `get_annotation_by_id` - Retrieve specific annotation content
- `get_annotations_batch` - Batch retrieve multiple annotations
- `get_collections` - List all collections
- `search_collections` - Search collections by name
- `get_collection_details` - Get collection metadata
- `get_collection_items` - Get items in a collection

**MCP Response Structure:**
All MCP responses follow a unified structure with:
- `data` - The actual response content
- `metadata` - Response metadata including AI guidelines and tool-specific guidance
- `_dataIntegrity` - Hash for data validation (added by AIInstructionsManager)
- `_instructions` - AI processing instructions

### Global Variables and Context

The plugin uses a sandbox context system:

```typescript
// In addon/bootstrap.js (template):
const ctx = { rootURI };
ctx._globalThis = ctx;
Services.scriptloader.loadSubScript(`${rootURI}/content/scripts/zapi.js`, ctx);
```

**Global variables available in bundled code:**
- `_globalThis` - Sandbox root object
- `addon` - Main Addon instance (assigned to `Zotero.ZApiPlugin`)
- `ztoolkit` - ZToolkit instance for UI operations
- `Zotero` - Zotero API object

### Configuration and Preferences

**Build Configuration** (`package.json`):
```json
{
  "config": {
    "addonName": "Make It Red",
    "addonID": "zapi@gmail.com",
    "addonRef": "zapi",
    "addonInstance": "ZApiPlugin",
    "prefsPrefix": "extensions.zotero.zapi"
  }
}
```

**Zotero Preferences:**
- `extensions.zotero.zotero-mcp-plugin.mcp.server.enabled` - Enable/disable server
- `extensions.zotero.zotero-mcp-plugin.mcp.server.port` - Server port (default: 3000)
- `mcp.firstInstallPromptShown` - First-install prompt flag

Note: The codebase uses `zotero-mcp-plugin` prefix for many preferences (legacy naming).

### Important Implementation Notes

**Bootstrap Template Processing:**
The `addon/bootstrap.js` file contains placeholders that are replaced during build:
- `__addonRef__` → `zapi`
- `__addonInstance__` → `ZApiPlugin`

**Type Definitions:**
- `src/types.d.ts` - Contains Zotero-specific type definitions
- `zotero-types` package provides official Zotero API types
- TypeScript compilation uses `--noEmit` (type checking only)

**Localization:**
- Uses Fluent format (`.ftl` files) in `addon/locale/`
- Loaded via `MozXULElement.insertFTLIfNeeded()`
- Files: `addon.ftl`, `preferences.ftl`, `mainWindow.ftl`

**Content Extraction:**
The plugin can extract text from:
- PDFs (via Zotero's fulltext API)
- HTML snapshots (stored webpage content)
- Notes (including rich text)
- Annotations and highlights

### Development Workflow

1. **Making changes:**
   - Edit TypeScript files in `src/`
   - Modify UI templates in `addon/content/`
   - Update localization in `addon/locale/`

2. **Building:**
   - Run `npm run build` to create XPI
   - Output: `.scaffold/build/zapi.xpi`

3. **Testing:**
   - Install XPI in Zotero via Add-ons Manager
   - Or set up plugin development environment (see Zotero docs)
   - Check server status at `http://localhost:3000/capabilities`

4. **Debugging:**
   - Use Zotero's DevTools (Tools → Developer → Run JavaScript)
   - Check `Zotero.debug()` output in Zotero console
   - Server logs appear in debug output with `[HttpServer]` or `[MCP]` prefixes

### Common Patterns

**Logging:**
```typescript
ztoolkit.log(`Message`, "error" | "warn" | "info");  // Uses ztoolkit
Zotero.debug(`[Plugin] Message`);  // Direct Zotero debug
```

**Preference Access:**
```typescript
Zotero.Prefs.get("extensions.zotero.zapi.setting");
Zotero.Prefs.set("extensions.zotero.zapi.setting", value);
```

**Zotero API Usage:**
```typescript
const items = Zotero.Items.getAll();
const item = Zotero.Items.get(itemID);
const collections = Zotero.Collections.getAll();
```

## Technology Stack

- **Language**: TypeScript (compiled to ES2020)
- **Build Tool**: zotero-plugin-scaffold (with esbuild)
- **Target**: Firefox 115+ (Zotero 7 runtime)
- **Dependencies**:
  - `zotero-plugin-toolkit` - UI and utility helpers
  - `zotero-types` - TypeScript definitions for Zotero API
- **No npm dependencies in runtime** - All code bundled into single JS file
