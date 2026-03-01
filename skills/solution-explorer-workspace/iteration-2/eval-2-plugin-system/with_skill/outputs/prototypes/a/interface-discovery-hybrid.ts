/**
 * Prototype A: Interface Contract + Lazy Discovery Hybrid
 *
 * Core idea: Plugins are npm packages named `mycli-plugin-*` that
 * default-export an object conforming to a typed Plugin interface.
 * Discovery is automatic (scan node_modules); correctness is enforced
 * by runtime validation (zod schema derived from the TypeScript type).
 */

// ─── Plugin Contract (what plugin authors import from @mycli/sdk) ────────────

type ArgDef = {
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  default?: string | number | boolean;
};

type CommandDefinition = {
  name: string;
  description: string;
  args?: Record<string, ArgDef>;
  run: (ctx: CommandContext) => Promise<void>;
};

type PluginHooks = {
  beforeRun?: (ctx: HookContext) => Promise<void>;
  afterRun?: (ctx: HookContext & { result: unknown }) => Promise<void>;
  onError?: (ctx: HookContext & { error: Error }) => Promise<void>;
};

type Plugin = {
  name: string;
  version: string;
  apiVersion: 1;
  commands: CommandDefinition[];
  hooks?: Partial<PluginHooks>;
  activate?: (ctx: PluginContext) => Promise<void>;
  deactivate?: () => Promise<void>;
};

type CommandContext = {
  args: Record<string, unknown>;
  flags: Record<string, unknown>;
  logger: Logger;
  config: CLIConfig;
};

type HookContext = {
  command: string;
  args: Record<string, unknown>;
  logger: Logger;
};

type PluginContext = {
  logger: Logger;
  config: CLIConfig;
  cliVersion: string;
};

type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

type CLIConfig = Record<string, unknown>;

// ─── Runtime Validation (simplified zod-like schema) ─────────────────────────

function validatePlugin(obj: unknown): obj is Plugin {
  if (!obj || typeof obj !== "object") return false;
  const p = obj as Record<string, unknown>;
  if (typeof p.name !== "string") return false;
  if (typeof p.version !== "string") return false;
  if (p.apiVersion !== 1) return false;
  if (!Array.isArray(p.commands)) return false;
  for (const cmd of p.commands) {
    if (typeof cmd.name !== "string") return false;
    if (typeof cmd.description !== "string") return false;
    if (typeof cmd.run !== "function") return false;
  }
  return true;
}

// ─── Plugin Discovery ────────────────────────────────────────────────────────

async function discoverPlugins(prefix: string): Promise<string[]> {
  // In real implementation: scan node_modules for packages matching prefix
  // Here we simulate the discovery
  const { readdirSync, existsSync } = await import("fs");
  const { join } = await import("path");

  const nodeModulesPath = join(process.cwd(), "node_modules");
  if (!existsSync(nodeModulesPath)) return [];

  const discovered: string[] = [];

  // Check top-level packages
  for (const entry of readdirSync(nodeModulesPath)) {
    if (entry.startsWith(`${prefix}-plugin-`)) {
      discovered.push(entry);
    }
    // Check scoped packages
    if (entry.startsWith("@")) {
      const scopePath = join(nodeModulesPath, entry);
      for (const scoped of readdirSync(scopePath)) {
        if (scoped.startsWith("plugin-")) {
          discovered.push(`${entry}/${scoped}`);
        }
      }
    }
  }

  return discovered;
}

// ─── Plugin Loader (lazy) ────────────────────────────────────────────────────

type LoadedPlugin = {
  plugin: Plugin;
  source: string;
};

async function loadPlugin(packageName: string): Promise<LoadedPlugin | null> {
  try {
    const mod = await import(packageName);
    const exported = mod.default ?? mod;

    if (!validatePlugin(exported)) {
      console.warn(
        `Plugin ${packageName} does not conform to the Plugin interface. Skipping.`
      );
      return null;
    }

    return { plugin: exported, source: packageName };
  } catch (err) {
    console.warn(`Failed to load plugin ${packageName}: ${err}`);
    return null;
  }
}

// ─── CLI Core ────────────────────────────────────────────────────────────────

class CLI {
  private builtinCommands: CommandDefinition[] = [];
  private pluginCommands: Map<string, { cmd: CommandDefinition; source: string }> = new Map();
  private hooks: { before: PluginHooks["beforeRun"][]; after: PluginHooks["afterRun"][]; error: PluginHooks["onError"][] } = {
    before: [],
    after: [],
    error: [],
  };
  private loadedPlugins: LoadedPlugin[] = [];

  constructor(private prefix: string) {}

  registerBuiltinCommand(cmd: CommandDefinition) {
    this.builtinCommands.push(cmd);
  }

  async discoverAndLoadPlugins(): Promise<void> {
    const packageNames = await discoverPlugins(this.prefix);

    // Load all plugins in parallel
    const results = await Promise.all(packageNames.map(loadPlugin));

    for (const result of results) {
      if (!result) continue;

      this.loadedPlugins.push(result);

      // Register commands
      for (const cmd of result.plugin.commands) {
        if (this.pluginCommands.has(cmd.name)) {
          console.warn(
            `Command "${cmd.name}" from ${result.source} conflicts with ` +
            `existing command from ${this.pluginCommands.get(cmd.name)!.source}. Skipping.`
          );
          continue;
        }
        this.pluginCommands.set(cmd.name, { cmd, source: result.source });
      }

      // Register hooks
      if (result.plugin.hooks?.beforeRun) {
        this.hooks.before.push(result.plugin.hooks.beforeRun);
      }
      if (result.plugin.hooks?.afterRun) {
        this.hooks.after.push(result.plugin.hooks.afterRun);
      }
      if (result.plugin.hooks?.onError) {
        this.hooks.error.push(result.plugin.hooks.onError);
      }
    }

    // Activate plugins
    const ctx: PluginContext = {
      logger: console,
      config: {},
      cliVersion: "1.0.0",
    };
    for (const { plugin, source } of this.loadedPlugins) {
      if (plugin.activate) {
        try {
          await plugin.activate(ctx);
        } catch (err) {
          console.warn(`Plugin ${source} activation failed: ${err}`);
        }
      }
    }
  }

  async run(argv: string[]): Promise<void> {
    const [commandName, ...rest] = argv;

    // Resolve command (builtins take precedence)
    const builtin = this.builtinCommands.find((c) => c.name === commandName);
    const plugin = this.pluginCommands.get(commandName);
    const command = builtin ?? plugin?.cmd;

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      this.printHelp();
      return;
    }

    const ctx: CommandContext = {
      args: this.parseArgs(rest, command.args ?? {}),
      flags: {},
      logger: console,
      config: {},
    };

    const hookCtx: HookContext = {
      command: commandName,
      args: ctx.args,
      logger: console,
    };

    // Run before hooks
    for (const hook of this.hooks.before) {
      if (hook) await hook(hookCtx);
    }

    try {
      await command.run(ctx);

      // Run after hooks
      for (const hook of this.hooks.after) {
        if (hook) await hook({ ...hookCtx, result: undefined });
      }
    } catch (err) {
      // Run error hooks
      for (const hook of this.hooks.error) {
        if (hook) await hook({ ...hookCtx, error: err as Error });
      }
      throw err;
    }
  }

  printHelp(): void {
    console.log("\nAvailable commands:\n");
    for (const cmd of this.builtinCommands) {
      console.log(`  ${cmd.name.padEnd(20)} ${cmd.description}`);
    }
    for (const [, { cmd, source }] of this.pluginCommands) {
      console.log(`  ${cmd.name.padEnd(20)} ${cmd.description}  (from ${source})`);
    }
  }

  private parseArgs(
    argv: string[],
    defs: Record<string, ArgDef>
  ): Record<string, unknown> {
    // Simplified arg parsing for prototype
    const result: Record<string, unknown> = {};
    for (let i = 0; i < argv.length; i += 2) {
      const key = argv[i]?.replace(/^--/, "");
      const value = argv[i + 1];
      if (key) result[key] = value;
    }
    return result;
  }
}

// ─── Example: What a plugin author writes ────────────────────────────────────

const examplePlugin: Plugin = {
  name: "mycli-plugin-deploy",
  version: "1.0.0",
  apiVersion: 1,
  commands: [
    {
      name: "deploy",
      description: "Deploy the application to a target environment",
      args: {
        env: { type: "string", description: "Target environment", required: true },
        dry: { type: "boolean", description: "Dry run mode", default: false },
      },
      run: async (ctx) => {
        ctx.logger.info(`Deploying to ${ctx.args.env}...`);
        // Plugin implementation here
      },
    },
  ],
  hooks: {
    beforeRun: async (ctx) => {
      ctx.logger.info(`[deploy-plugin] Before command: ${ctx.command}`);
    },
  },
  activate: async (ctx) => {
    ctx.logger.info(`[deploy-plugin] Activated (CLI v${ctx.cliVersion})`);
  },
};

// ─── Example: CLI setup ──────────────────────────────────────────────────────

async function main() {
  const cli = new CLI("mycli");

  // Register built-in commands
  cli.registerBuiltinCommand({
    name: "help",
    description: "Show help information",
    run: async () => cli.printHelp(),
  });

  cli.registerBuiltinCommand({
    name: "version",
    description: "Show CLI version",
    run: async (ctx) => ctx.logger.info("mycli v1.0.0"),
  });

  // Discover and load third-party plugins
  await cli.discoverAndLoadPlugins();

  // Run the CLI
  await cli.run(process.argv.slice(2));
}

// Lines of code (excluding comments/blanks): ~150
// DX assessment: Plugin authors write a plain object conforming to a type.
//   No classes, no inheritance, no decorators. Just data + functions.
//   IDE autocomplete works because the Plugin type drives everything.

export { Plugin, CommandDefinition, CLI, validatePlugin, examplePlugin };
