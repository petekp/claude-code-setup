// ============================================================
// Host CLI: Plugin framework with typed hooks and services
// ============================================================

import type {
  PluginHost,
  PluginRegistration,
  CommandDefinition,
  CommandContext,
  HookMap,
  HookName,
  HookHandler,
  ServiceToken,
  Logger,
  CLIConfig,
  ParsedFlags,
} from './types';
import { LoggerService, ConfigService } from './types';

type CLIConfigFile = {
  plugins: string[];
};

export class CLIHost {
  private commands = new Map<string, { command: CommandDefinition; pluginName: string }>();
  private hooks = new Map<HookName, Array<{ pluginName: string; handler: HookHandler<HookName> }>>();
  private services = new Map<symbol, unknown>();
  private loadedPlugins: string[] = [];

  private logger: Logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    debug: (msg) => {
      if (this.config.verbose) console.log(`[DEBUG] ${msg}`);
    },
  };

  private config: CLIConfig = {
    cwd: process.cwd(),
    verbose: false,
  };

  constructor() {
    // Register built-in services
    this.registerService(LoggerService, this.logger);
    this.registerService(ConfigService, this.config);
  }

  registerService<T>(token: ServiceToken<T>, implementation: T): void {
    this.services.set(token.id, implementation);
  }

  async loadPluginsFromConfig(configFile: CLIConfigFile): Promise<void> {
    for (const pluginPath of configFile.plugins) {
      await this.loadPlugin(pluginPath);
    }
  }

  private async loadPlugin(source: string): Promise<void> {
    try {
      const mod = await import(source);
      const registration: PluginRegistration = mod.default ?? mod;

      if (!registration.name || !registration.version || !registration.register) {
        this.logger.error(
          `Plugin from "${source}" is missing required fields (name, version, register). Skipping.`
        );
        return;
      }

      // Create a scoped PluginHost for this plugin
      const pluginName = registration.name;
      const host: PluginHost = {
        registerCommand: (cmd) => this.addCommand(cmd, pluginName),
        hook: (event, handler) => this.addHook(event, handler, pluginName),
        getService: <T>(token: ServiceToken<T>) => this.resolveService(token),
      };

      // Call the plugin's register function
      await registration.register(host);

      this.loadedPlugins.push(pluginName);
      this.logger.debug(`Loaded plugin "${pluginName}" v${registration.version} from "${source}"`);
    } catch (err) {
      this.logger.error(
        `Failed to load plugin from "${source}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private addCommand(cmd: CommandDefinition, pluginName: string): void {
    const existing = this.commands.get(cmd.name);
    if (existing) {
      this.logger.warn(
        `Command "${cmd.name}" from plugin "${pluginName}" conflicts with ` +
        `command from "${existing.pluginName}". Using first registered.`
      );
      return;
    }
    this.commands.set(cmd.name, { command: cmd, pluginName });
  }

  private addHook<K extends HookName>(event: K, handler: HookHandler<K>, pluginName: string): void {
    const existing = this.hooks.get(event) ?? [];
    existing.push({ pluginName, handler: handler as HookHandler<HookName> });
    this.hooks.set(event, existing);
  }

  private resolveService<T>(token: ServiceToken<T>): T {
    const service = this.services.get(token.id);
    if (service === undefined) {
      throw new Error(`Service not found for token: ${String(token.id)}`);
    }
    return service as T;
  }

  private async runHooks<K extends HookName>(event: K, ...args: HookMap[K]): Promise<void> {
    const handlers = this.hooks.get(event) ?? [];
    for (const { pluginName, handler } of handlers) {
      try {
        await (handler as (...a: HookMap[K]) => void | Promise<void>)(...args);
      } catch (err) {
        this.logger.warn(
          `Hook "${event}" from "${pluginName}" threw: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  async executeCommand(name: string, flags: ParsedFlags): Promise<void> {
    const entry = this.commands.get(name);
    if (!entry) {
      await this.runHooks('commandNotFound', name);
      this.logger.error(`Unknown command: "${name}"`);
      this.printHelp();
      return;
    }

    const ctx: CommandContext = {
      commandName: name,
      logger: this.logger,
      config: this.config,
    };

    await this.runHooks('preRun', ctx);

    try {
      await entry.command.run(flags, ctx);
      await this.runHooks('postRun', ctx, { success: true });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.runHooks('onError', ctx, error);
      await this.runHooks('postRun', ctx, { success: false });
      this.logger.error(`Command "${name}" failed: ${error.message}`);
    }
  }

  printHelp(): void {
    console.log('\nAvailable commands:\n');
    for (const [name, { command, pluginName }] of this.commands) {
      console.log(`  ${name.padEnd(20)} ${command.description} (from: ${pluginName})`);
    }
    console.log();
  }
}
