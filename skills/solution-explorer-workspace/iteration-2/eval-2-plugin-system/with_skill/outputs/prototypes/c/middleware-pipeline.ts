/**
 * Prototype C: Middleware Pipeline
 *
 * Core idea: The CLI execution is a pipeline. Plugins insert middleware
 * functions that can transform, augment, or short-circuit the pipeline.
 * Commands are registered as a side-effect during plugin setup, but the
 * primary extension mechanism is the middleware chain.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

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
  run: (ctx: CLIContext) => Promise<void>;
};

type CLIContext = {
  command: string;
  args: Record<string, unknown>;
  rawArgv: string[];
  logger: Logger;
  config: CLIConfig;
  state: Map<string, unknown>; // shared mutable state for middleware communication
  startTime: number;
};

type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

type CLIConfig = Record<string, unknown>;

type NextFn = () => Promise<void>;
type Middleware = (ctx: CLIContext, next: NextFn) => Promise<void>;

// ─── Middleware Composer ─────────────────────────────────────────────────────

function compose(middlewares: Middleware[]): Middleware {
  return async (ctx: CLIContext, next: NextFn) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;

      const fn = i < middlewares.length ? middlewares[i] : next;
      await fn(ctx, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}

// ─── Plugin Type ────────────────────────────────────────────────────────────

type PluginSetupFn = (app: CLIApp) => void;

type PluginDefinition = {
  name: string;
  version: string;
  setup: PluginSetupFn;
};

// ─── CLI App (what plugins interact with) ───────────────────────────────────

type CLIApp = {
  /** Register a command */
  command: (def: CommandDefinition) => void;

  /** Add middleware to the execution pipeline */
  use: (middleware: Middleware) => void;

  /** Read CLI config */
  config: CLIConfig;
};

// ─── CLI Core ───────────────────────────────────────────────────────────────

class CLI {
  private commands = new Map<string, CommandDefinition>();
  private middlewares: Middleware[] = [];
  private plugins: PluginDefinition[] = [];
  private config: CLIConfig = {};

  private createApp(): CLIApp {
    return {
      command: (def) => {
        if (this.commands.has(def.name)) {
          console.warn(`Command "${def.name}" already registered. Overwriting.`);
        }
        this.commands.set(def.name, def);
      },
      use: (mw) => {
        this.middlewares.push(mw);
      },
      config: this.config,
    };
  }

  registerPlugin(plugin: PluginDefinition): this {
    this.plugins.push(plugin);
    const app = this.createApp();
    try {
      plugin.setup(app);
    } catch (err) {
      console.warn(`Plugin "${plugin.name}" setup failed: ${err}`);
    }
    return this;
  }

  registerCommand(def: CommandDefinition): this {
    this.commands.set(def.name, def);
    return this;
  }

  async run(argv: string[]): Promise<void> {
    const [commandName, ...rest] = argv;
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      this.printHelp();
      return;
    }

    const ctx: CLIContext = {
      command: commandName,
      args: this.parseArgs(rest),
      rawArgv: argv,
      logger: console,
      config: this.config,
      state: new Map(),
      startTime: Date.now(),
    };

    // The innermost function is the actual command execution
    const executeCommand: Middleware = async (ctx, _next) => {
      await command.run(ctx);
    };

    // Compose all middleware + command execution
    const pipeline = compose([...this.middlewares, executeCommand]);

    // Run the full pipeline
    await pipeline(ctx, async () => {});
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
  setup(app) {
    // Register commands
    app.command({
      name: "deploy",
      description: "Deploy the application to a target environment",
      args: {
        env: { type: "string", description: "Target environment", required: true },
      },
      run: async (ctx) => {
        ctx.logger.info(`Deploying to ${ctx.args.env}...`);
      },
    });
  },
};

// Example: A timing middleware plugin (no commands, just behavior)
const timingPlugin: PluginDefinition = {
  name: "timing-plugin",
  version: "1.0.0",
  setup(app) {
    app.use(async (ctx, next) => {
      const start = Date.now();
      try {
        await next();
        const duration = Date.now() - start;
        ctx.logger.info(`[timing] ${ctx.command} completed in ${duration}ms`);
      } catch (err) {
        const duration = Date.now() - start;
        ctx.logger.error(`[timing] ${ctx.command} failed after ${duration}ms`);
        throw err;
      }
    });
  },
};

// Example: An auth middleware plugin
const authPlugin: PluginDefinition = {
  name: "auth-plugin",
  version: "1.0.0",
  setup(app) {
    app.use(async (ctx, next) => {
      // Short-circuit if not authenticated
      const token = process.env.MY_CLI_TOKEN;
      if (!token) {
        ctx.logger.error("Not authenticated. Run `mycli login` first.");
        return; // Don't call next() — pipeline stops here
      }
      ctx.state.set("authToken", token);
      await next();
    });
  },
};

// Example: An error-handling middleware (wraps everything)
const errorHandlerPlugin: PluginDefinition = {
  name: "error-handler-plugin",
  version: "1.0.0",
  setup(app) {
    // This should be the FIRST middleware so it wraps everything
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err instanceof Error) {
          ctx.logger.error(`Error: ${err.message}`);
          if (process.env.DEBUG) {
            ctx.logger.error(err.stack ?? "");
          }
        } else {
          ctx.logger.error(`Unknown error: ${err}`);
        }
        process.exitCode = 1;
      }
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

  // Load plugins (order matters for middleware!)
  cli.registerPlugin(errorHandlerPlugin); // First: catches all errors
  cli.registerPlugin(timingPlugin);       // Second: times everything
  cli.registerPlugin(authPlugin);         // Third: auth gate
  cli.registerPlugin(deployPlugin);       // Commands (no middleware)

  // Run
  await cli.run(process.argv.slice(2));
}

// Lines of code (excluding comments/blanks): ~140
// DX assessment: Plugin authors interact with a simple `app` object.
//   Command registration is clean (app.command()). Middleware is familiar
//   to Node.js developers (Express/Koa pattern). However, middleware
//   ordering is critical and implicit — getting it wrong causes subtle bugs.
//   The `state` Map is a footgun for inter-middleware communication.

export { CLI, PluginDefinition, Middleware, compose, CLIContext };
