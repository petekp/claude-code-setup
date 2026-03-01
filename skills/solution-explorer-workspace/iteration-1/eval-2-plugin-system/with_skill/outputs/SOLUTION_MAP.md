# Solution Map: CLI Plugin System

## Paradigm 1: Convention-Based npm Package Loading

**Core bet:** Plugins are npm packages that follow a naming convention. The CLI discovers them by scanning `node_modules` for packages matching the pattern (e.g., `mycli-plugin-*` or `@scope/mycli-plugin-*`). Plugin code runs in the same Node.js process as the host. This is the ESLint/Prettier model.

### Approach 1a: Naming Convention + Default Export Contract

- **How it works:** Plugins are npm packages named `<cli>-plugin-<name>`. Each package's main export is an object conforming to a `Plugin` interface (exported from a `@mycli/plugin-sdk` package). The CLI at startup scans `node_modules` for matching package names, `require()`s each, validates the export shape, and registers the commands/hooks. The plugin SDK package provides TypeScript types and a `definePlugin()` helper for type inference.

  ```typescript
  // @mycli/plugin-sdk
  type Plugin = {
    name: string;
    version: string;
    commands: CommandDefinition[];
    hooks?: Partial<LifecycleHooks>;
  };
  export function definePlugin(plugin: Plugin): Plugin;

  // mycli-plugin-deploy/src/index.ts
  import { definePlugin } from '@mycli/plugin-sdk';
  export default definePlugin({
    name: 'deploy',
    version: '1.0.0',
    commands: [deployCommand],
  });
  ```

- **Gains:** Extremely familiar to the JS/TS ecosystem. Plugin authors already know npm. No new tooling required. Full TypeScript support via the SDK package. Auto-discovery means zero configuration for users ("install and it works"). ESLint, Prettier, Babel, and Gatsby all prove this model works at scale.

- **Gives up:** No isolation -- a plugin crash can take down the CLI (mitigated with try/catch). Scanning `node_modules` at startup has a latency cost that grows with the number of installed packages. No security boundary. Plugin naming collisions are possible.

- **Shines when:** The ecosystem is trusted (plugins installed intentionally by developers), the plugin API is narrow (register commands + a few hooks), and you want minimum friction for both plugin authors and users.

- **Risks:** `node_modules` scanning can be slow in monorepos or workspaces with many packages. If a plugin has a side-effect-heavy import, it slows startup even if the plugin's commands aren't invoked. Naming convention conflicts with unrelated packages.

- **Complexity:** Simple

### Approach 1b: Explicit Configuration File + Dynamic Import

- **How it works:** Instead of auto-discovery, the user lists plugins in a config file (e.g., `.myclirc.json` or `mycli.config.ts`). The CLI reads the config, then `import()`s each listed plugin. Plugins are still npm packages conforming to the same `Plugin` interface, but discovery is explicit rather than convention-based.

  ```json
  // .myclirc.json
  {
    "plugins": [
      "mycli-plugin-deploy",
      "./local-plugins/my-plugin",
      "@company/mycli-plugin-internal"
    ]
  }
  ```

- **Gains:** No `node_modules` scanning -- startup is fast and predictable. Users have full control over which plugins are active. Supports local file paths (great for development). Config file can include plugin-specific options. Dynamic `import()` enables lazy loading.

- **Gives up:** Requires manual configuration -- plugins don't "just work" after install. Users must know the plugin's package name. Config file management is another thing to maintain.

- **Shines when:** The CLI is used in projects where reproducibility matters (like build tools), plugin load order matters, or you want to support both npm packages and local file plugins.

- **Risks:** Config file format becomes a maintenance burden (validation, error messages, migration between versions). Users forget to add plugins to config after installing.

- **Complexity:** Simple

---

## Paradigm 2: Framework-Managed Plugin Architecture (oclif Model)

**Core bet:** Instead of bolting a plugin system onto an existing CLI, the entire CLI is built on a framework that treats plugins as first-class citizens. Commands, hooks, and lifecycle are all framework concepts. The framework handles discovery, loading, dependency resolution, and command routing. This is the Salesforce CLI (oclif) model.

### Approach 2a: Full oclif Adoption

- **How it works:** Build the CLI using oclif, which provides a complete plugin architecture out of the box. Plugins are npm packages with a specific directory structure (`src/commands/`, `src/hooks/`). The CLI discovers plugins via package.json `oclif.plugins` or by naming convention. oclif handles command routing, help generation, flag parsing, and plugin lifecycle.

  ```typescript
  // Plugin command (oclif pattern)
  import { Command, Flags } from '@oclif/core';

  export default class Deploy extends Command {
    static description = 'Deploy to production';
    static flags = {
      target: Flags.string({ required: true }),
    };

    async run() {
      const { flags } = await this.parse(Deploy);
      // implementation
    }
  }
  ```

- **Gains:** Battle-tested at Salesforce scale (their CLI has 100+ plugins). Handles the hard problems: plugin discovery, lazy loading, help generation, update notifications, TypeScript compilation, testing utilities. Large community and documentation. Plugins get auto-generated help, man pages, and completions.

- **Gives up:** Framework lock-in -- the entire CLI must be built on oclif's architecture. Heavy dependency tree. oclif's opinions may not match yours (class-based commands, specific directory structure). Plugin authors must learn oclif, not just your API. Harder to customize the plugin contract.

- **Shines when:** You're building a new CLI from scratch and want enterprise-grade plugin support without building it yourself. When the CLI will have many plugins and needs robust lifecycle management.

- **Risks:** oclif's maintenance and direction is controlled by Salesforce. If your needs diverge from oclif's opinions, you fight the framework. The abstraction is large -- debugging plugin loading issues means understanding oclif internals.

- **Complexity:** Moderate (framework adoption is moderate; the framework handles complexity for you, but you inherit all of it)

### Approach 2b: Custom Framework Inspired by oclif (Lightweight)

- **How it works:** Build a lightweight plugin framework that borrows oclif's best ideas but keeps only what you need. The core concepts: a `PluginLoader` that discovers plugins, a `CommandRegistry` that routes commands, and a `HookSystem` (using tapable-style hooks) that lets plugins tap into lifecycle events. Plugins are npm packages exporting a `register(host: PluginHost)` function.

  ```typescript
  // Plugin SDK
  type PluginHost = {
    registerCommand(cmd: CommandDefinition): void;
    hook(event: string, handler: HookHandler): void;
    getService<T>(token: ServiceToken<T>): T;
  };

  // Plugin entry point
  export function register(host: PluginHost) {
    host.registerCommand({
      name: 'deploy',
      description: 'Deploy to production',
      flags: { target: { type: 'string', required: true } },
      run: async (args, ctx) => { /* ... */ },
    });

    host.hook('preRun', async (ctx) => { /* ... */ });
  }
  ```

- **Gains:** Full control over the plugin API contract. No framework lock-in. Can be exactly as complex as needed and no more. The `register(host)` pattern is the dependency injection equivalent for plugins -- the host controls what capabilities plugins receive. Tapable-style hooks are proven (webpack's entire ecosystem is built on this pattern).

- **Gives up:** You build and maintain everything yourself: discovery, loading, error handling, help generation, lifecycle management. Lots of design decisions that oclif already made for you. Less community documentation.

- **Shines when:** You have specific opinions about the plugin API that don't align with existing frameworks. When you want a thin abstraction you fully understand and control.

- **Risks:** Scope creep -- you end up rebuilding oclif poorly. Under-investing in error messages and edge cases that frameworks handle well. The plugin API design is hard to get right the first time.

- **Complexity:** Moderate to Complex (depends on scope)

---

## Paradigm 3: Process-Isolated Plugins (VS Code / Terraform Model)

**Core bet:** Plugins run in separate processes and communicate with the host CLI over a defined protocol (IPC, gRPC, stdio JSON-RPC). This provides hard isolation: a plugin crash, memory leak, or malicious behavior cannot affect the host.

### Approach 3a: Subprocess + JSON-RPC over stdio

- **How it works:** Each plugin is a standalone executable (a Node.js script, but could be any language). The host CLI spawns the plugin as a child process and communicates via JSON-RPC over stdin/stdout. The protocol defines messages for capability negotiation, command registration, command execution, and lifecycle events.

  ```typescript
  // Plugin (runs as its own process)
  import { createPluginServer } from '@mycli/plugin-rpc';

  createPluginServer({
    manifest: {
      name: 'deploy',
      version: '1.0.0',
      commands: ['deploy', 'deploy:rollback'],
    },
    handlers: {
      'deploy': async (args) => { /* ... */ },
      'deploy:rollback': async (args) => { /* ... */ },
    },
  });

  // Host CLI spawns plugin process, sends JSON-RPC messages
  ```

- **Gains:** Hard process isolation -- plugin crashes don't affect the host. Language-agnostic -- plugins can be written in any language that speaks JSON-RPC. Clear security boundary (plugins can be sandboxed at the OS level). No shared memory means no subtle state corruption bugs. This is how Terraform, VS Code (extension host), and Language Server Protocol work.

- **Gives up:** Significant startup latency cost -- spawning a Node.js process takes ~40-80ms. Cross-process communication adds serialization overhead. More complex development workflow for plugin authors (debugging two processes). Much more protocol code to write and maintain. Streaming output and interactive prompts are harder.

- **Shines when:** Security is paramount, plugins come from untrusted sources, plugins are long-running or computationally heavy, or you want multi-language plugin support.

- **Risks:** Startup latency makes the CLI feel sluggish unless you use persistent plugin daemons (which adds complexity). Debugging cross-process issues is hard. The protocol becomes a versioning challenge.

- **Complexity:** Complex

### Approach 3b: WebAssembly Sandbox (Extism)

- **How it works:** Plugins are compiled to WebAssembly and run inside a WASM sandbox (using Extism or Wasmtime). The host CLI loads WASM modules and calls exported functions through a defined interface. WASM provides memory-safe sandboxing by default -- plugins cannot access host memory, filesystem, or network unless explicitly granted.

  ```typescript
  // Host CLI
  import Extism from '@extism/extism';

  const plugin = await Extism.createPlugin('deploy-plugin.wasm', {
    allowedHosts: ['api.example.com'],
  });
  const result = await plugin.call('deploy', JSON.stringify(args));
  ```

- **Gains:** Strongest security model -- WASM sandboxing is provably safe, not just "try/catch" safe. Near-native execution speed. Capability-based security (grant individual permissions). Language-agnostic (any language that compiles to WASM). No process spawn overhead -- WASM modules load in milliseconds.

- **Gives up:** Plugin authors must compile to WASM, which is a significant development experience burden for TypeScript developers (requires AssemblyScript or compiling via wasm-pack). Limited access to Node.js APIs and npm packages. Debugging WASM is harder than debugging Node.js. The ecosystem is immature for this use case. Data interchange is limited to what WASM supports (no passing complex objects, just bytes).

- **Shines when:** Running truly untrusted code from the internet. When security is the top priority and you're willing to accept a worse plugin DX.

- **Risks:** WASM toolchain for TypeScript is not mature. Plugin authors will struggle. The ecosystem of example plugins will be tiny because the barrier to entry is high. Performance gains don't matter for a CLI (startup time is the bottleneck, not compute).

- **Complexity:** Complex

---

## Paradigm 4: Event-Driven / Hook-Only Architecture

**Core bet:** Instead of plugins registering commands, the plugin system is entirely event-driven. The host CLI emits events at every meaningful point in its lifecycle, and plugins subscribe to those events. Commands are just one type of event. This is the webpack/tapable model applied to a CLI.

### Approach 4a: Tapable-Style Hook Pipeline

- **How it works:** The CLI core defines a set of typed hooks (using a tapable-inspired library or a custom implementation). Plugins tap into these hooks to modify behavior. The hook types include: `SyncHook` (notification), `SyncWaterfallHook` (transform data through a pipeline), `SyncBailHook` (short-circuit on first result), `AsyncSeriesHook` (sequential async), and `AsyncParallelHook` (concurrent async). Command registration is just one hook among many.

  ```typescript
  // Host defines hooks
  class CLIHooks {
    readonly init = new AsyncSeriesHook<[CLIContext]>();
    readonly resolveCommand = new SyncBailHook<[string], CommandDefinition | undefined>();
    readonly beforeRun = new AsyncSeriesHook<[CommandContext]>();
    readonly afterRun = new AsyncSeriesHook<[CommandContext, Result]>();
    readonly formatOutput = new SyncWaterfallHook<[string, OutputContext]>();
    readonly onError = new AsyncSeriesHook<[Error, CommandContext]>();
  }

  // Plugin taps into hooks
  export function register(hooks: CLIHooks) {
    hooks.resolveCommand.tap('deploy-plugin', (name) => {
      if (name === 'deploy') return deployCommand;
    });
    hooks.beforeRun.tapPromise('deploy-plugin', async (ctx) => {
      // pre-flight checks
    });
  }
  ```

- **Gains:** Maximum flexibility -- plugins can modify virtually any behavior. Well-understood pattern (webpack's entire ecosystem is built on it). Composable -- multiple plugins can tap the same hook. The waterfall pattern enables data transformation pipelines. Strongly typed hooks give plugin authors IDE support.

- **Gives up:** Harder to reason about -- execution order depends on tap order. Debugging "which plugin caused this behavior" is non-trivial. The API surface is large (many hooks to define and document). Overkill for simple "add a command" use cases. Plugin authors need to understand the hook model, which is less intuitive than "export a command."

- **Shines when:** The CLI needs deep customizability (not just new commands but modifying existing behavior). When plugins need to compose with each other. When the CLI is a build tool or pipeline processor.

- **Risks:** Hook spaghetti -- too many hooks with unclear ordering leads to unpredictable behavior. Performance overhead from running many tapped functions on every hook. The API surface becomes hard to maintain and version.

- **Complexity:** Moderate to Complex

---

## Paradigm 5: Configuration-as-Code (Declarative Plugin Model)

**Core bet:** Instead of plugins being executable code that runs in the host, plugins are declarative configurations that describe commands, their arguments, and how to execute them. The host CLI interprets these declarations. Execution might delegate to shell commands, HTTP endpoints, or scripting engines.

### Approach 5a: Declarative YAML/JSON Plugin Manifests

- **How it works:** A plugin is a YAML or JSON file (or a directory containing one) that declares commands, their flags, and how they execute. Execution targets can be shell scripts, HTTP APIs, or inline scripts. The host CLI reads these manifests and generates commands from them.

  ```yaml
  # deploy-plugin.yaml
  name: deploy
  version: 1.0.0
  commands:
    deploy:
      description: Deploy to production
      flags:
        target:
          type: string
          required: true
      execute:
        type: shell
        command: ./scripts/deploy.sh --target {{flags.target}}
    deploy:rollback:
      description: Rollback last deployment
      execute:
        type: http
        method: POST
        url: https://deploy-api.example.com/rollback
  ```

- **Gains:** Zero TypeScript knowledge required for simple plugins. Extremely easy to validate and version (it's just data). No code execution risk (the manifest itself is inert). Can be linted, checked into version control, shared as gists. The host has complete control over execution semantics.

- **Gives up:** Severely limited expressiveness -- complex logic requires escape hatches to code. Not TypeScript-native (this is a MUST criterion violation unless we add a TS layer). Shell command execution reintroduces security concerns. Templating languages for flag interpolation are fragile.

- **Shines when:** Most plugins are simple wrappers around existing tools or APIs. When the target audience is not TypeScript developers. When security/auditability is more important than expressiveness.

- **Risks:** The declarative format inevitably grows Turing-complete (conditionals, loops, variables) as users demand more expressiveness, at which point you've built a bad programming language. Fails the "TypeScript-native" MUST criterion unless combined with a code layer.

- **Complexity:** Simple (for the declarative layer) but grows complex as escape hatches are added

---

## Non-obvious options

### Hybrid: Convention Discovery + Explicit Config + Lazy Loading

Combine Approaches 1a and 1b. By default, the CLI auto-discovers plugins via npm naming convention (like 1a). But users can also explicitly list plugins in a config file (like 1b), which takes precedence. All plugin loading is lazy -- the CLI reads only the plugin's `manifest` export at startup (a plain object with name/description/commands metadata), and only `import()`s the full command implementation when that command is actually invoked. This gives you the "install and it works" UX of convention-based discovery with the control of explicit configuration and the performance of lazy loading.

### Meta-paradigm: Plugin System as a Plugin

Instead of building the plugin system into the CLI core, make the core CLI as minimal as possible and implement the plugin system *itself* as the first plugin. The core CLI only knows how to load a single "bootstrap" plugin (the plugin system), which then handles discovery, loading, and management of all other plugins. This is the microkernel architecture pattern. Benefits: the plugin system can be swapped, upgraded, or replaced independently of the core. Drawback: bootstrap complexity and circular dependency potential.

### "No Plugin System" Alternative: Code Generation

Instead of runtime plugin loading, provide a code generation tool that scaffolds plugin code directly into the CLI's codebase. `mycli generate plugin deploy` creates files in `src/plugins/deploy/`. Plugins are compiled and shipped as part of the CLI binary. This eliminates all runtime complexity (discovery, loading, isolation, versioning) but requires plugins to be part of the build. This is not a "plugin system" in the traditional sense but might solve the underlying need (letting others contribute commands) with dramatically less complexity.

### Hybrid: In-Process with Capability Tokens

Run plugins in-process (like Paradigm 1) but use a capability-token pattern for security. Instead of giving plugins direct access to `fs`, `net`, or `process`, provide them with a `PluginContext` that exposes only permitted operations. The context acts as a proxy -- plugins call `ctx.readFile(path)` instead of `fs.readFile(path)`, and the host can enforce access controls, audit logging, and rate limiting. This gives most of the security benefits of isolation without the performance cost of separate processes.

---

## Eliminated early

- **Dynamic code evaluation (eval / string-based code execution):** Loading plugins via string evaluation was considered and immediately eliminated. No type safety, no IDE support, massive security risk, impossible to debug. No legitimate reason to use this over `import()`.

- **Shared memory / Worker Threads:** Node.js Worker Threads were considered for isolation. Eliminated because they add significant complexity (SharedArrayBuffer, postMessage serialization) without the clean protocol boundary of separate processes. The overhead is similar to child processes but with a more complex API. Workers are designed for CPU-parallelism, not plugin isolation.

- **Remote plugins (microservices):** Plugins as HTTP microservices were considered. Eliminated because the latency of HTTP round-trips for every command execution is unacceptable for a CLI tool, and requiring plugin authors to deploy and maintain a running service is an enormous burden for what should be a simple local tool extension.

- **Monkey-patching / prototype pollution:** Letting plugins modify the CLI's internals by patching objects was considered. Eliminated because it is impossible to version, impossible to type-check, creates unpredictable interactions between plugins, and is a security vulnerability.
