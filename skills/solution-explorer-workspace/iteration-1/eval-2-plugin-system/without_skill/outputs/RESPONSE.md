# Plugin System for a TypeScript CLI Tool

## Design Recommendation

I recommend a **convention-based plugin loader with a typed contract**. Plugins are npm packages that export a well-defined object conforming to a `Plugin` interface. The CLI discovers them at startup, validates them against the contract, and registers their commands into the existing command tree.

This approach balances simplicity (plugins are just npm packages), safety (typed contract + runtime validation), and power (plugins get access to a controlled API surface).

---

## Core Architecture

### 1. The Plugin Contract

The foundation is a TypeScript interface that every plugin must satisfy. Keep it narrow -- a plugin declares metadata and returns one or more commands.

```ts
// packages/cli/src/plugin/types.ts

type CommandArgDef = {
  name: string;
  description: string;
  required?: boolean;
  default?: string;
};

type CommandOptionDef = {
  flags: string;        // e.g. "-o, --output <path>"
  description: string;
  default?: unknown;
};

type CommandDef = {
  name: string;
  description: string;
  args?: CommandArgDef[];
  options?: CommandOptionDef[];
  action: (args: Record<string, unknown>, ctx: PluginContext) => Promise<void>;
};

type PluginMeta = {
  name: string;
  version: string;
  description?: string;
};

type Plugin = {
  meta: PluginMeta;
  commands: CommandDef[];
  activate?: (ctx: PluginContext) => Promise<void>;
  deactivate?: () => Promise<void>;
};
```

### 2. The Plugin Context (Controlled API Surface)

Rather than giving plugins raw access to internals, expose a curated `PluginContext` object. This is the key to maintaining stability -- you can evolve internals without breaking plugins as long as this contract holds.

```ts
// packages/cli/src/plugin/context.ts

type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

type PluginContext = {
  logger: Logger;
  config: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
  };
  cwd: string;
  cliVersion: string;
};
```

**Why this matters:** This is the *dependency inversion principle* in action. Plugins depend on an abstraction (`PluginContext`) rather than on your concrete implementation. You can swap out your logging library, change your config storage from JSON to YAML, or restructure your entire internals -- and plugins keep working as long as `PluginContext` still satisfies its type.

### 3. Plugin Discovery and Loading

Plugins are discovered through two mechanisms:

1. **Convention-based npm packages** -- any installed package whose name matches a pattern (e.g., `mycli-plugin-*` or `@mycli/plugin-*`).
2. **Explicit configuration** -- a `plugins` array in the CLI's config file for non-conventional names or local paths.

```ts
// packages/cli/src/plugin/loader.ts

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

type PluginEntry =
  | string                          // npm package name or path
  | { path: string; options?: Record<string, unknown> };

function resolvePluginEntries(configPath: string): PluginEntry[] {
  const entries: PluginEntry[] = [];

  // 1. Read explicit plugins from config
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    if (Array.isArray(config.plugins)) {
      entries.push(...config.plugins);
    }
  }

  // 2. Scan node_modules for convention-named packages
  const require = createRequire(import.meta.url);
  const nodeModulesPath = resolve("node_modules");
  if (existsSync(nodeModulesPath)) {
    // Check for mycli-plugin-* packages
    const dirs = readdirSync(nodeModulesPath);
    for (const dir of dirs) {
      if (dir.startsWith("mycli-plugin-")) {
        entries.push(dir);
      }
      // Handle scoped packages: @mycli/plugin-*
      if (dir === "@mycli") {
        const scopedDirs = readdirSync(join(nodeModulesPath, dir));
        for (const scopedDir of scopedDirs) {
          if (scopedDir.startsWith("plugin-")) {
            entries.push(`@mycli/${scopedDir}`);
          }
        }
      }
    }
  }

  return entries;
}
```

### 4. Plugin Validation

Runtime validation is critical. A plugin author might export the wrong shape, have a version mismatch, or accidentally shadow a built-in command. Validate at load time and fail with clear messages.

```ts
// packages/cli/src/plugin/validator.ts

type ValidationResult =
  | { ok: true; plugin: Plugin }
  | { ok: false; errors: string[] };

function validatePlugin(raw: unknown, source: string): ValidationResult {
  const errors: string[] = [];

  if (raw === null || typeof raw !== "object") {
    return { ok: false, errors: [`Plugin from ${source} did not export an object`] };
  }

  const obj = raw as Record<string, unknown>;

  // Validate meta
  if (!obj.meta || typeof obj.meta !== "object") {
    errors.push("Missing or invalid 'meta' field");
  } else {
    const meta = obj.meta as Record<string, unknown>;
    if (typeof meta.name !== "string") errors.push("meta.name must be a string");
    if (typeof meta.version !== "string") errors.push("meta.version must be a string");
  }

  // Validate commands
  if (!Array.isArray(obj.commands)) {
    errors.push("'commands' must be an array");
  } else {
    for (const cmd of obj.commands) {
      if (typeof cmd.name !== "string") errors.push("Each command must have a string 'name'");
      if (typeof cmd.action !== "function") errors.push(`Command '${cmd.name}' is missing an 'action' function`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, plugin: raw as Plugin };
}
```

### 5. Plugin Registry and Lifecycle

The registry manages loaded plugins and wires their commands into the CLI.

```ts
// packages/cli/src/plugin/registry.ts

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private ctx: PluginContext;

  constructor(ctx: PluginContext) {
    this.ctx = ctx;
  }

  async load(entry: PluginEntry): Promise<void> {
    const modulePath = typeof entry === "string" ? entry : entry.path;

    try {
      const mod = await import(modulePath);
      const exported = mod.default ?? mod;

      const result = validatePlugin(exported, modulePath);
      if (!result.ok) {
        this.ctx.logger.error(
          `Invalid plugin "${modulePath}":\n${result.errors.map(e => `  - ${e}`).join("\n")}`
        );
        return;
      }

      const plugin = result.plugin;
      if (this.plugins.has(plugin.meta.name)) {
        this.ctx.logger.warn(`Plugin "${plugin.meta.name}" is already loaded, skipping duplicate`);
        return;
      }

      // Run lifecycle hook
      if (plugin.activate) {
        await plugin.activate(this.ctx);
      }

      this.plugins.set(plugin.meta.name, plugin);
      this.ctx.logger.debug(`Loaded plugin: ${plugin.meta.name}@${plugin.meta.version}`);
    } catch (err) {
      this.ctx.logger.error(`Failed to load plugin "${modulePath}": ${String(err)}`);
    }
  }

  getCommands(): CommandDef[] {
    return Array.from(this.plugins.values()).flatMap(p => p.commands);
  }

  async shutdown(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.deactivate) {
        await plugin.deactivate();
      }
    }
    this.plugins.clear();
  }
}
```

### 6. Wiring Into the CLI

Assuming you're using something like Commander.js or a similar command framework, integration looks like this:

```ts
// packages/cli/src/main.ts

import { Command } from "commander";

async function main() {
  const program = new Command();
  program.name("mycli").version("1.0.0");

  // Register built-in commands
  registerBuiltinCommands(program);

  // Load plugins
  const ctx = createPluginContext();
  const registry = new PluginRegistry(ctx);

  const entries = resolvePluginEntries(getConfigPath());
  await Promise.all(entries.map(e => registry.load(e)));

  // Register plugin commands under a namespace or at the top level
  for (const cmd of registry.getCommands()) {
    const sub = program
      .command(cmd.name)
      .description(cmd.description);

    if (cmd.args) {
      for (const arg of cmd.args) {
        const syntax = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        sub.argument(syntax, arg.description, arg.default);
      }
    }

    if (cmd.options) {
      for (const opt of cmd.options) {
        sub.option(opt.flags, opt.description, opt.default);
      }
    }

    sub.action(async (...actionArgs: unknown[]) => {
      // Commander passes parsed args and options, then the Command object
      const opts = actionArgs[actionArgs.length - 2] as Record<string, unknown>;
      await cmd.action(opts, ctx);
    });
  }

  await program.parseAsync(process.argv);
  await registry.shutdown();
}

main();
```

---

## What a Plugin Looks Like (Author's Perspective)

A third-party plugin is an npm package with a default export:

```ts
// mycli-plugin-deploy/src/index.ts

import type { Plugin } from "mycli";  // Exported from your CLI's public API

const plugin: Plugin = {
  meta: {
    name: "deploy",
    version: "0.1.0",
    description: "Deploy to cloud providers",
  },

  async activate(ctx) {
    ctx.logger.debug("Deploy plugin activated");
  },

  commands: [
    {
      name: "deploy",
      description: "Deploy the current project",
      options: [
        { flags: "-t, --target <provider>", description: "Cloud provider", default: "aws" },
        { flags: "--dry-run", description: "Preview without deploying" },
      ],
      async action(args, ctx) {
        ctx.logger.info(`Deploying to ${args.target}...`);
        // ... implementation
      },
    },
  ],
};

export default plugin;
```

And the package.json:

```json
{
  "name": "mycli-plugin-deploy",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "keywords": ["mycli-plugin"],
  "peerDependencies": {
    "mycli": "^1.0.0"
  }
}
```

---

## Key Design Decisions and Rationale

### Why npm packages over a custom plugin format?

Distribution, versioning, and dependency management come for free. Plugin authors already know how to publish npm packages. You don't have to build a plugin registry, a download mechanism, or a versioning scheme. `npm install mycli-plugin-deploy` just works.

### Why a typed contract instead of dynamic registration?

A static `Plugin` type exported from your CLI package gives plugin authors autocomplete, compile-time checks, and documentation through types. This massively reduces the "guess and check" development cycle that plagues loosely-typed plugin systems.

### Why `PluginContext` instead of direct access?

This is the **facade pattern**. Without it, plugins reach into your internals and you can never refactor without breaking the ecosystem. With it, you have a stable API boundary. You can also:

- Add rate limiting or permission checks to specific context methods
- Scope logging per-plugin (prefix log lines with the plugin name)
- Mock the context entirely for testing

### Why runtime validation even though we have types?

Types are erased at runtime. A plugin author could ship broken JavaScript, or a user could point the config at a random module. The validator catches these cases and turns them into clear error messages instead of cryptic stack traces. This is a general principle worth internalizing: **types are a development-time guarantee, validation is a runtime guarantee. You need both at system boundaries.**

### Why `activate`/`deactivate` lifecycle hooks?

Some plugins need to set up resources (database connections, background watchers, temp directories). The lifecycle hooks give them a clean place to do this, and more importantly, a guaranteed teardown path. Without `deactivate`, plugins that allocate resources would leak them when the CLI exits.

---

## Extension Points for the Future

This design leaves room to grow without requiring a rewrite:

| Future Need | How to Add It |
|---|---|
| **Plugin hooks** (middleware-style, e.g., run before/after any command) | Add a `hooks` field to the `Plugin` type with named lifecycle points |
| **Plugin configuration** | Pass plugin-specific config from the CLI config file through `activate(ctx, pluginConfig)` |
| **Command namespacing** | Prefix plugin commands automatically (e.g., `mycli deploy:run`) to avoid collisions |
| **Lazy loading** | Don't `import()` the plugin until its command is actually invoked -- just read `meta` + `commands` from a manifest |
| **Plugin compatibility ranges** | Add an `engines: { mycli: "^1.0.0" }` field to plugin meta and check it during validation |
| **Sandboxing** | Run plugin `action` functions in a `vm` context or worker thread with limited APIs |

---

## Publish Strategy for the Types Package

Export the plugin types from your CLI's public API so plugin authors can import them:

```ts
// packages/cli/src/index.ts (public entry point)
export type { Plugin, PluginContext, CommandDef, PluginMeta } from "./plugin/types";
```

This means plugin authors add your CLI as a `peerDependency` and get full type support without pulling in your entire implementation. The types are the contract; the implementation is yours to change.

---

## Summary

The architecture is five components:

1. **Types** -- the `Plugin` interface and `PluginContext` that form the public contract
2. **Loader** -- discovers plugins from conventions and config
3. **Validator** -- runtime checks that loaded modules conform to the contract
4. **Registry** -- manages plugin lifecycle and collects commands
5. **Wiring** -- integrates plugin commands into the CLI framework

This gives you a plugin system that is simple to implement (no framework needed, just types + dynamic import), safe (validation + typed context), ergonomic for plugin authors (npm packages + TypeScript types), and extensible for future needs (hooks, lazy loading, sandboxing).
