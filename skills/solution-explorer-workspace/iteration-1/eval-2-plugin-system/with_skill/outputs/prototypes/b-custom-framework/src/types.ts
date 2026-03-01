// ============================================================
// Prototype B: Custom Lightweight Framework
// ============================================================
// This approach uses the "register(host)" pattern where the
// host controls what capabilities plugins receive via a
// PluginHost interface. Hooks are strongly typed.
// ============================================================

// --- Core types ---

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
  run: (flags: ParsedFlags, ctx: CommandContext) => Promise<void>;
};

export type CommandContext = {
  commandName: string;
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

// --- Hook system (strongly typed) ---

export type HookMap = {
  init: [ctx: { config: CLIConfig }];
  preRun: [ctx: CommandContext];
  postRun: [ctx: CommandContext, result: { success: boolean }];
  onError: [ctx: CommandContext, error: Error];
  commandNotFound: [commandName: string];
};

export type HookName = keyof HookMap;

export type HookHandler<K extends HookName = HookName> = (
  ...args: HookMap[K]
) => void | Promise<void>;

// --- Service system (type-safe DI) ---

export type ServiceToken<T> = {
  readonly id: symbol;
  readonly _phantom?: T; // enables type inference
};

export function createServiceToken<T>(name: string): ServiceToken<T> {
  return { id: Symbol(name) } as ServiceToken<T>;
}

// Built-in service tokens
export const LoggerService = createServiceToken<Logger>('logger');
export const ConfigService = createServiceToken<CLIConfig>('config');

// --- Plugin Host interface (what plugins see) ---

export type PluginHost = {
  registerCommand(cmd: CommandDefinition): void;
  hook<K extends HookName>(event: K, handler: HookHandler<K>): void;
  getService<T>(token: ServiceToken<T>): T;
};

// --- Plugin registration function type ---

export type PluginRegistration = {
  name: string;
  version: string;
  description?: string;
  register: (host: PluginHost) => void | Promise<void>;
};

// Helper for type inference
export function definePlugin(registration: PluginRegistration): PluginRegistration {
  return registration;
}
