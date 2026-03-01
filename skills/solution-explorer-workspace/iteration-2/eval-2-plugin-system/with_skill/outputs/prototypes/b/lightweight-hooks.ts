/**
 * Prototype B: Lightweight Custom Hooks
 *
 * Core idea: The CLI exposes a set of typed hooks at various lifecycle
 * points. Plugins are functions that receive the hook registry and tap
 * into whichever hooks they need. Commands are registered via a dedicated
 * hook. No external dependency — the hook system is custom.
 */

// ─── Hook System (~40 lines) ────────────────────────────────────────────────

type HookHandler<T> = (payload: T) => Promise<void>;

class Hook<T> {
  private handlers: { name: string; fn: HookHandler<T> }[] = [];

  tap(name: string, fn: HookHandler<T>): void {
    this.handlers.push({ name, fn });
  }

  async call(payload: T): Promise<void> {
    for (const { name, fn } of this.handlers) {
      try {
        await fn(payload);
      } catch (err) {
        console.warn(`Hook handler "${name}" threw: ${err}`);
      }
    }
  }

  get taps(): string[] {
    return this.handlers.map((h) => h.name);
  }
}

class BailHook<T, R> {
  private handlers: { name: string; fn: (payload: T) => Promise<R | undefined> }[] = [];

  tap(name: string, fn: (payload: T) => Promise<R | undefined>): void {
    this.handlers.push({ name, fn });
  }

  async call(payload: T): Promise<R | undefined> {
    for (const { fn } of this.handlers) {
      const result = await fn(payload);
      if (result !== undefined) return result;
    }
    return undefined;
  }
}

// ─── CLI Types ──────────────────────────────────────────────────────────────

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
  run: (ctx: RunContext) => Promise<void>;
};

type RunContext = {
  command: string;
  args: Record<string, unknown>;
  logger: Logger;
  config: CLIConfig;
};

type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

type CLIConfig = Record<string, unknown>;

// ─── Hook Registry (the plugin surface) ─────────────────────────────────────

type CLIHooks = {
  /** Called once when the CLI initializes. Use to register commands and set up state. */
  init: Hook<{ registerCommand: (cmd: CommandDefinition) => void; config: CLIConfig }>;

  /** Called before command resolution. Can modify args. */
  beforeResolve: Hook<{ argv: string[]; config: CLIConfig }>;

  /** Called before a command runs. Can be used for auth, validation, logging. */
  beforeRun: Hook<RunContext>;

  /** Called after a command completes successfully. */
  afterRun: Hook<RunContext & { duration: number }>;

  /** Called when a command throws. Bail semantics: first handler to return true "handles" the error. */
  onError: BailHook<{ error: Error; context: RunContext }, boolean>;

  /** Called when the CLI is shutting down. Use for cleanup. */
  shutdown: Hook<void>;
};

// ─── Plugin Type ────────────────────────────────────────────────────────────

type PluginFn = (hooks: CLIHooks, options?: Record<string, unknown>) => void;

type PluginDefinition = {
  name: string;
  version: string;
  apply: PluginFn;
};

// ─── CLI Core ───────────────────────────────────────────────────────────────

class CLI {
  private commands = new Map<string, CommandDefinition>();
  private plugins: PluginDefinition[] = [];

  readonly hooks: CLIHooks = {
    init: new Hook(),
    beforeResolve: new Hook(),
    beforeRun: new Hook(),
    afterRun: new Hook(),
    onError: new BailHook(),
    shutdown: new Hook(),
  };

  use(plugin: PluginDefinition, options?: Record<string, unknown>): this {
    this.plugins.push(plugin);
    plugin.apply(this.hooks, options);
    return this;
  }

  registerCommand(cmd: CommandDefinition): void {
    if (this.commands.has(cmd.name)) {
      console.warn(`Command "${cmd.name}" already registered. Overwriting.`);
    }
    this.commands.set(cmd.name, cmd);
  }

  async init(): Promise<void> {
    await this.hooks.init.call({
      registerCommand: (cmd) => this.registerCommand(cmd),
      config: {},
    });
  }

  async run(argv: string[]): Promise<void> {
    // Before resolve
    await this.hooks.beforeResolve.call({ argv, config: {} });

    const [commandName, ...rest] = argv;
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      this.printHelp();
      return;
    }

    const ctx: RunContext = {
      command: commandName,
      args: this.parseArgs(rest),
      logger: console,
      config: {},
    };

    // Before run
    await this.hooks.beforeRun.call(ctx);

    const start = Date.now();
    try {
      await command.run(ctx);
      const duration = Date.now() - start;
      await this.hooks.afterRun.call({ ...ctx, duration });
    } catch (err) {
      const handled = await this.hooks.onError.call({
        error: err as Error,
        context: ctx,
      });
      if (!handled) throw err;
    }
  }

  async shutdown(): Promise<void> {
    await this.hooks.shutdown.call();
  }

  printHelp(): void {
    console.log("\nAvailable commands:\n");
    for (const [name, cmd] of this.commands) {
      console.log(`  ${name.padEnd(20)} ${cmd.description}`);
    }
  }

  private parseArgs(argv: string[]): Record<string, unknown> {
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

const deployPlugin: PluginDefinition = {
  name: "deploy-plugin",
  version: "1.0.0",
  apply(hooks) {
    // Register commands during init
    hooks.init.tap("deploy-plugin", async ({ registerCommand }) => {
      registerCommand({
        name: "deploy",
        description: "Deploy the application to a target environment",
        args: {
          env: { type: "string", description: "Target environment", required: true },
        },
        run: async (ctx) => {
          ctx.logger.info(`Deploying to ${ctx.args.env}...`);
        },
      });
    });

    // Add cross-cutting behavior
    hooks.beforeRun.tap("deploy-plugin", async (ctx) => {
      ctx.logger.info(`[deploy-plugin] Before: ${ctx.command}`);
    });
  },
};

// Example: A telemetry plugin that hooks into lifecycle without adding commands
const telemetryPlugin: PluginDefinition = {
  name: "telemetry-plugin",
  version: "1.0.0",
  apply(hooks) {
    hooks.afterRun.tap("telemetry", async (ctx) => {
      ctx.logger.info(
        `[telemetry] Command "${ctx.command}" completed in ${ctx.duration}ms`
      );
    });

    hooks.onError.tap("telemetry", async ({ error, context }) => {
      ctx.logger.error(
        `[telemetry] Command "${context.command}" failed: ${error.message}`
      );
      // Don't handle the error — let it propagate
      return undefined;
    });
  },
};

// ─── Example: CLI setup ──────────────────────────────────────────────────────

async function main() {
  const cli = new CLI();

  // Register built-in commands
  cli.registerCommand({
    name: "help",
    description: "Show help information",
    run: async () => cli.printHelp(),
  });

  // Load plugins
  cli.use(deployPlugin);
  cli.use(telemetryPlugin);

  // Initialize (triggers init hooks)
  await cli.init();

  // Run
  await cli.run(process.argv.slice(2));
  await cli.shutdown();
}

// Lines of code (excluding comments/blanks): ~160
// DX assessment: Plugin authors write a function that receives typed hooks.
//   The hook taxonomy (init, beforeRun, afterRun, onError, shutdown) is
//   discoverable via the CLIHooks type. However, command registration
//   happens indirectly through a hook rather than declaratively.
//   This is more powerful but less obvious than Prototype A.

export { CLI, PluginDefinition, CLIHooks, Hook, BailHook, deployPlugin };
