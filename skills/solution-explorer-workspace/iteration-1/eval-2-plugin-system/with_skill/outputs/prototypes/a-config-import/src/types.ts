// ============================================================
// Prototype A: Explicit Config + Dynamic Import
// ============================================================
// This is the "minimal infrastructure" approach. The plugin
// contract is a TypeScript type. Discovery is via config file.
// Loading is via dynamic import(). That's it.
// ============================================================

// --- Plugin SDK types (published as @mycli/plugin-sdk) ---

export type FlagDefinition = {
  type: 'string' | 'boolean' | 'number';
  description: string;
  required?: boolean;
  default?: string | boolean | number;
};

export type ParsedFlags = Record<string, string | boolean | number | undefined>;

export type CommandDefinition = {
  name: string;
  description: string;
  flags?: Record<string, FlagDefinition>;
  run: (flags: ParsedFlags, ctx: PluginContext) => Promise<void>;
};

export type LifecycleHooks = {
  preRun: (commandName: string, ctx: PluginContext) => Promise<void>;
  postRun: (commandName: string, result: unknown, ctx: PluginContext) => Promise<void>;
  onError: (commandName: string, error: Error, ctx: PluginContext) => Promise<void>;
};

export type PluginContext = {
  logger: Logger;
  config: CLIConfig;
};

export type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

export type CLIConfig = {
  cwd: string;
  verbose: boolean;
};

export type PluginManifest = {
  name: string;
  version: string;
  description?: string;
  compatibleWith?: string; // semver range for host CLI version
};

export type Plugin = {
  manifest: PluginManifest;
  commands: CommandDefinition[];
  hooks?: Partial<LifecycleHooks>;
};

// Helper for type inference
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}
