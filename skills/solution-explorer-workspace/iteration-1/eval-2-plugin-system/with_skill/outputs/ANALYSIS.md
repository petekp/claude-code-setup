# Analysis: CLI Plugin System

## Tradeoff Matrix

| Criterion | 1a: Convention + Export | 1b: Config + Import | 2a: oclif | 2b: Custom Framework | 3a: Subprocess JSON-RPC | 3b: WASM Sandbox | 4a: Tapable Hooks | 5a: Declarative YAML |
|-----------|----------------------|-------------------|-----------|---------------------|----------------------|-----------------|-------------------|---------------------|
| **MUST: Third-party command registration** | Yes, via `commands` array in plugin export | Yes, via `commands` array in plugin export | Yes, via file-convention command discovery | Yes, via `registerCommand()` on host | Yes, via manifest + RPC handlers | Yes, via WASM exports | Yes, via `resolveCommand` bail hook | Yes, via YAML command declarations |
| **MUST: TypeScript-native** | Full TS via SDK package with `definePlugin()` helper | Full TS via SDK package | Full TS (oclif is written in TS) | Full TS via custom SDK | TS for plugins but RPC layer adds runtime-only types for messages | TS not directly supported (needs AssemblyScript or compile step) | Full TS via typed hook classes | Not TypeScript-native -- YAML with shell/HTTP execution |
| **MUST: npm-distributable** | Yes, plugins ARE npm packages | Yes, plugins are npm packages listed in config | Yes, oclif plugins are npm packages | Yes, plugins are npm packages | Possible but unusual -- plugins are executables, not typical npm packages | No -- plugins are .wasm binaries, not npm packages in the traditional sense | Yes, plugins are npm packages | Partially -- YAML files can be in npm packages but aren't TypeScript modules |
| **MUST: Stable versioned API** | SDK package is the API; semver on the SDK | Same as 1a | oclif provides the API; their semver | SDK package is the API; full version control | Protocol version in JSON-RPC handshake | WASM ABI is the API; binary compatibility | Hook class types are the API; semver on types | YAML schema version |
| **MUST: Startup < 50ms per plugin** | ~5-15ms per plugin (require + validate). Risk: node_modules scan adds ~50-200ms one-time cost | ~2-5ms per plugin (dynamic import, no scan). Lazy loading possible | ~10-20ms per plugin (oclif has lazy loading built in) | ~2-10ms per plugin with lazy loading | ~40-80ms per plugin (process spawn). Unacceptable without daemon | ~5-15ms per plugin (WASM module instantiation is fast) | ~2-5ms per plugin (just registering tap callbacks) | ~1-3ms per plugin (parsing YAML is fast) |
| **MUST: Error isolation** | try/catch per plugin load and command execution. Sync throws caught; unhandled rejections need global handler | Same as 1a | oclif handles this with command-level error boundaries | try/catch per `register()` call and command execution | Full process isolation -- plugin crash = process exit, host unaffected | Full WASM isolation -- traps are caught by runtime | try/catch per tap execution. Hook errors need careful handling to not break pipeline | Full isolation -- YAML is inert; execution errors in shell commands are caught |
| **SHOULD: Lifecycle hooks** | Supported via `hooks` in plugin definition. Limited to predefined events | Same as 1a | Built-in hook system (init, prerun, postrun, command_not_found) | First-class via `host.hook()` -- custom events easy to add | Possible via RPC messages but adds protocol complexity | Requires explicit host function calls from WASM | This IS the core model -- maximum hook flexibility | Not supported -- declarative format has no lifecycle concept |
| **SHOULD: Plugin discovery** | Auto-discovery via naming convention | No auto-discovery (explicit config) | Auto-discovery via package.json config and naming convention | Can implement either strategy | Requires a plugin registry or config file pointing to executables | Requires a config pointing to .wasm files | Discovery is orthogonal -- can use any strategy | Config file listing YAML plugin locations |
| **SHOULD: Shared services** | Via context object passed to command `run()` | Same as 1a | Via `this.config`, `this.log()`, etc. on Command base class | Via `host.getService<T>(token)` -- explicit DI | Via RPC service methods -- adds protocol surface | Via host functions exposed to WASM -- limited to primitive data | Via hook context objects | Via template variables in YAML |
| **SHOULD: Local dev workflow** | Link local package via `npm link` | Config file can point to `./local-path` -- excellent | `oclif plugins:link ./path` -- built-in support | Config file can point to local paths | Run plugin process manually and connect | Compile to WASM locally -- slow iteration | Same as discovery mechanism used | Edit YAML file directly -- instant |
| **SHOULD: Plugin metadata** | In the plugin export object | Same as 1a | In package.json `oclif` field | In the `register()` manifest or separate export | In the RPC handshake manifest | In WASM module metadata | Plugin name in tap registration | In YAML frontmatter |
| **SHOULD: Conflict resolution** | Detect at registration time; error or configurable | Same as 1a + config order determines priority | oclif handles via plugin ordering in config | Detect at registration; customizable strategy | Detect at manifest collection time | Same as 3a | Last-tapped handler wins (tapable behavior) | Config order determines priority |
| **NICE: Sandboxed execution** | No | No | No | Partial (capability tokens on host object) | Yes (OS-level process isolation) | Yes (WASM memory isolation + capability-based) | No | Partial (shell commands run in subprocess) |
| **NICE: Hot reloading** | Via file watchers + re-require (cache invalidation needed) | Re-read config + re-import (ESM cache issue) | Not built-in; would need custom | Implementable but requires cache-busting | Restart plugin process | Reload WASM module (fast) | Re-tap hooks (need to untap first) | Re-read YAML (trivial) |
| **NICE: Auto help generation** | From `CommandDefinition` metadata | Same as 1a | Built-in (one of oclif's best features) | Must build from `CommandDefinition` metadata | From manifest metadata (separate from implementation) | From WASM module metadata | From command definitions registered via hooks | From YAML command descriptions |

## Eliminated

- **Approach 3b (WASM Sandbox):** Eliminated because it fails the **MUST: TypeScript-native** criterion. Plugin authors cannot write TypeScript directly -- they must use AssemblyScript or another WASM-targeting language. The toolchain is immature, debugging is poor, and the ecosystem barrier is too high. Also partially fails **MUST: npm-distributable** since .wasm binaries are not standard npm package artifacts. The security benefits are real but not required given our assumption that plugins are trusted code.

- **Approach 5a (Declarative YAML):** Eliminated because it fails the **MUST: TypeScript-native** criterion. YAML declarations with shell/HTTP execution are not TypeScript. Could be rescued with a TypeScript layer on top, but at that point you're building Approach 1b with extra steps. Also fails **SHOULD: Lifecycle hooks** since declarative formats don't have a lifecycle concept.

- **Approach 3a (Subprocess JSON-RPC):** Eliminated because it fails the **MUST: Startup < 50ms per plugin** criterion. Spawning a Node.js child process takes ~40-80ms per plugin. With 5 plugins, that's 200-400ms of startup latency -- unacceptable for a CLI tool. A persistent daemon would solve this but adds substantial complexity (daemon management, socket files, process lifecycle). The isolation benefits are not needed given our assumption that plugins are trusted code from npm.

## Survivors Ranked

After eliminating on MUST criteria, 5 approaches remain: 1a, 1b, 2a, 2b, 4a.

### SHOULD criteria comparison:

| SHOULD Criterion | Weight | 1a: Convention | 1b: Config | 2a: oclif | 2b: Custom Framework | 4a: Tapable |
|-----------------|--------|---------------|-----------|-----------|---------------------|-------------|
| Lifecycle hooks | High | Predefined set | Predefined set | Built-in, well-designed | Fully custom | Maximum flexibility |
| Plugin discovery | High | Auto (best UX) | Manual (explicit) | Auto + manual | Flexible | Orthogonal |
| Shared services | Medium | Context object | Context object | Class inheritance | Explicit DI (cleanest) | Context in hooks |
| Local dev workflow | High | npm link (clunky) | File paths (good) | oclif link (good) | File paths (good) | Depends on discovery |
| Plugin metadata | Low | In export | In export | In package.json | In register | In tap name |
| Conflict resolution | Medium | Detectable | Config-ordered | Built-in | Customizable | Last-wins (least control) |

### NICE criteria comparison:

| NICE Criterion | 1a | 1b | 2a | 2b | 4a |
|---------------|----|----|----|----|-----|
| Sandboxed execution | No | No | No | Partial (capability tokens) | No |
| Hot reloading | Cache issues | ESM cache issues | Not built-in | Implementable | Needs untap mechanism |
| Auto help generation | Must build | Must build | Excellent (built-in) | Must build | Must build |

## Finalists

1. **Approach 2b: Custom Lightweight Framework** -- from Paradigm 2. Selected because it scores highest across the SHOULD criteria: fully custom lifecycle hooks, flexible discovery, explicit dependency injection for shared services, and good local dev support. It gives full control over the plugin API contract without framework lock-in. The `register(host: PluginHost)` pattern is elegant, type-safe, and constrains what plugins can access. The main risk (scope creep) is manageable since we're explicitly scoping to a lightweight implementation.

2. **Approach 1b: Explicit Config + Dynamic Import** -- from Paradigm 1. Selected because it is the simplest approach that satisfies all MUST and most SHOULD criteria. The config file gives users explicit control, supports local file paths for development, and enables lazy loading. It's the "boring technology" choice -- easy to understand, easy to maintain, easy to debug. Selected specifically because it represents a fundamentally different bet than 2b (minimal infrastructure vs. structured framework).

3. **Approach 2a: Full oclif Adoption** -- from Paradigm 2. Selected as a third finalist because it represents the "buy vs. build" dimension that the other two don't. If oclif's opinions align with our needs, it eliminates the most code to write and maintain. Auto-generated help, testing utilities, and a large community are significant advantages. Selected specifically to test whether the framework overhead is worth the feature set.

## Key differentiator

**The question prototyping needs to answer:** How much code does the custom framework (2b) actually require, and does the explicit-config approach (1b) feel too bare-bones when you actually try to build a plugin with lifecycle hooks and shared services?

Put differently: is the gap between "simple config + import" (1b) and "lightweight framework with PluginHost" (2b) worth the extra complexity? If 1b can support hooks and services with a thin wrapper, 2b is over-engineering. If 1b becomes awkward when plugins need to interact with the host beyond registering commands, 2b is justified.

oclif (2a) is included to calibrate: if oclif provides what we need with little friction, the "build" options lose to "buy."

## Open risks

1. **Plugin API design is hard to get right the first time.** The initial API becomes a long-term contract. Getting it wrong means either breaking changes or permanent warts. Prototyping should focus on whether the API feels natural for common plugin use cases.

2. **Lazy loading complexity.** All finalists need lazy loading to meet the startup performance MUST. The implementation details of lazy loading (especially with TypeScript compilation) could reveal hidden complexity.

3. **TypeScript compilation in plugins.** How do plugin authors compile their TypeScript? Do they publish compiled JS? Does the host compile on-the-fly with tsx/ts-node? This affects both performance and developer experience.

4. **Testing story for plugins.** None of the finalists have an obvious answer for "how does a plugin author write tests?" This needs to be considered during prototyping.
