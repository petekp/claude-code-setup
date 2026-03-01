// ============================================================
// Host CLI: Plugin loading and command execution
// ============================================================

import type {
  Plugin,
  CommandDefinition,
  PluginContext,
  LifecycleHooks,
  ParsedFlags,
} from './types';

type CLIConfigFile = {
  plugins: string[]; // package names or local paths
};

type LoadedPlugin = {
  plugin: Plugin;
  source: string; // where it was loaded from
};

export class CLIHost {
  private commands = new Map<string, { command: CommandDefinition; pluginName: string }>();
  private hooks: Array<{ pluginName: string; hooks: Partial<LifecycleHooks> }> = [];
  private plugins: LoadedPlugin[] = [];

  private ctx: PluginContext = {
    logger: {
      info: (msg) => console.log(`[INFO] ${msg}`),
      warn: (msg) => console.warn(`[WARN] ${msg}`),
      error: (msg) => console.error(`[ERROR] ${msg}`),
      debug: (msg) => {
        if (this.ctx.config.verbose) console.log(`[DEBUG] ${msg}`);
      },
    },
    config: {
      cwd: process.cwd(),
      verbose: false,
    },
  };

  async loadPluginsFromConfig(config: CLIConfigFile): Promise<void> {
    for (const pluginPath of config.plugins) {
      await this.loadPlugin(pluginPath);
    }
  }

  private async loadPlugin(source: string): Promise<void> {
    try {
      const mod = await import(source);
      const plugin: Plugin = mod.default ?? mod;

      // Validate plugin shape at runtime
      if (!plugin.manifest?.name || !plugin.manifest?.version) {
        this.ctx.logger.error(
          `Plugin from "${source}" is missing required manifest fields (name, version). Skipping.`
        );
        return;
      }

      if (!Array.isArray(plugin.commands)) {
        this.ctx.logger.error(
          `Plugin "${plugin.manifest.name}" has no commands array. Skipping.`
        );
        return;
      }

      // Register commands
      for (const cmd of plugin.commands) {
        const existing = this.commands.get(cmd.name);
        if (existing) {
          this.ctx.logger.warn(
            `Command "${cmd.name}" from plugin "${plugin.manifest.name}" conflicts with ` +
            `command from "${existing.pluginName}". Using first registered.`
          );
          continue;
        }
        this.commands.set(cmd.name, { command: cmd, pluginName: plugin.manifest.name });
      }

      // Register hooks
      if (plugin.hooks) {
        this.hooks.push({ pluginName: plugin.manifest.name, hooks: plugin.hooks });
      }

      this.plugins.push({ plugin, source });
      this.ctx.logger.debug(`Loaded plugin "${plugin.manifest.name}" from "${source}"`);
    } catch (err) {
      this.ctx.logger.error(
        `Failed to load plugin from "${source}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async executeCommand(name: string, flags: ParsedFlags): Promise<void> {
    const entry = this.commands.get(name);
    if (!entry) {
      this.ctx.logger.error(`Unknown command: "${name}"`);
      this.printHelp();
      return;
    }

    // Run preRun hooks
    for (const { pluginName, hooks } of this.hooks) {
      if (hooks.preRun) {
        try {
          await hooks.preRun(name, this.ctx);
        } catch (err) {
          this.ctx.logger.warn(
            `preRun hook from "${pluginName}" threw: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    // Execute command
    try {
      await entry.command.run(flags, this.ctx);

      // Run postRun hooks
      for (const { pluginName, hooks } of this.hooks) {
        if (hooks.postRun) {
          try {
            await hooks.postRun(name, undefined, this.ctx);
          } catch (err) {
            this.ctx.logger.warn(
              `postRun hook from "${pluginName}" threw: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }
    } catch (err) {
      // Run onError hooks
      const error = err instanceof Error ? err : new Error(String(err));
      for (const { pluginName, hooks } of this.hooks) {
        if (hooks.onError) {
          try {
            await hooks.onError(name, error, this.ctx);
          } catch (hookErr) {
            this.ctx.logger.warn(
              `onError hook from "${pluginName}" threw: ${hookErr instanceof Error ? hookErr.message : String(hookErr)}`
            );
          }
        }
      }
      this.ctx.logger.error(`Command "${name}" failed: ${error.message}`);
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
