# Analysis: CLI Plugin System for Third-Party Extensibility

## Tradeoff Matrix

All 10 approaches (plus 4 non-obvious options) evaluated against success criteria from PROBLEM_BRIEF.md.

### MUST Criteria

| Criterion | 1a: oclif Adoption | 1b: Custom Convention | 2a: Tapable Hooks | 2b: Lightweight Hooks | 3a: Interface Contract | 3b: Abstract Base Class | 4a: Middleware Pipeline | 4b: Fastify Encapsulation | 5a: WASM/Extism | 5b: Child Process | N1: Interface+Discovery Hybrid | N2: Package Scripts | N3: Git-Style PATH+SDK | N4: Config-as-Code |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M1: npm distribution | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial (WASM binary + npm) | Yes | Yes | Yes | Partial (PATH not npm) | Yes |
| M2: Register custom commands | Yes | Yes | Yes | Yes | Yes | Yes | Yes (side-channel) | Yes | Yes (via IPC) | Yes (via IPC) | Yes | Yes (via config) | Yes | Yes |
| M3: <100ms startup overhead | No (85-135ms baseline) | Yes (lazy loading, ~10-30ms) | Depends (hook registration ~20ms, but all plugins register) | Yes (~10-20ms) | Yes (~15-25ms, config-driven) | Yes (~15-25ms) | Yes (~15-25ms) | Moderate (~30-50ms, DAG resolution) | No (WASM init ~100-300ms) | No (process spawn ~50-150ms per plugin) | Yes (~15-30ms) | Yes (~5-10ms) | Yes (~10-20ms, PATH scan) | Yes (~10-15ms, import config) |
| M4: Fully typed plugin API | Yes (oclif has TS support) | Yes (custom types) | Yes (tapable-ts or typed hooks) | Yes (custom typed hooks) | Yes (type IS the API) | Yes (abstract class enforcement) | Yes (typed middleware) | Yes (typed app instance) | Partial (types don't cross WASM boundary natively) | Partial (types don't cross process boundary) | Yes (type + convention) | No (arbitrary executables) | Partial (SDK is typed, but not required) | Yes (TypeScript config file) |
| M5: Install/update/remove without source changes | Yes (runtime plugin management) | Yes (npm install/remove) | Yes (npm install/remove) | Yes (npm install/remove) | Partial (must edit config file) | Partial (must edit config file) | Partial (must edit config file) | Partial (must edit config file) | Yes (if CLI manages WASM registry) | Yes (npm install/remove) | Yes (auto-discovery + npm) | Partial (must edit config) | Yes (just put on PATH) | No (must edit config file) |
| M6: Node >= 18 + ESM | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | N/A (WASM, not Node modules) | Yes | Yes | Yes | Yes | Yes |

### Approaches that FAIL a MUST criterion

| Approach | Failed Criterion | Reason |
|---|---|---|
| **1a: oclif Adoption** | M3 (startup <100ms) | Benchmarks show 85-135ms baseline before any user code runs. With plugins loaded, this exceeds 100ms overhead consistently. |
| **5a: WASM/Extism** | M3 (startup <100ms), M4 (fully typed) | WASM module initialization adds 100-300ms. TypeScript types don't survive WASM compilation boundary — types exist in the SDK but not at the host-guest interface. |
| **5b: Child Process** | M3 (startup <100ms) | Node.js child process spawn adds 50-150ms per plugin process. Even with a single plugin, this likely pushes over 100ms. |
| **N2: Package Scripts** | M4 (fully typed) | Arbitrary executables have no type contract. The CLI can't provide compile-time feedback to plugin authors about argument shapes or return types. |

### SHOULD Criteria (surviving approaches only)

| Criterion | 1b: Custom Convention | 2a: Tapable Hooks | 2b: Lightweight Hooks | 3a: Interface Contract | 3b: Abstract Base Class | 4a: Middleware | 4b: Fastify Encap. | N1: Hybrid | N3: PATH+SDK | N4: Config-as-Code |
|---|---|---|---|---|---|---|---|---|---|---|
| S7: Scaffold new plugin | Easy (generate pkg matching convention) | Moderate (scaffold + hook registration boilerplate) | Moderate (scaffold + hook boilerplate) | Easy (generate pkg + typed exports) | Easy (generate class extending base) | Moderate (scaffold + middleware wiring) | Moderate (scaffold + encapsulation boilerplate) | Easy (same as 3a) | Easy (generate bin + SDK) | Not applicable (inline in config) |
| S8: Help system integration | Must build (but straightforward) | Must build (hooks can aggregate help) | Must build (hooks aggregate help) | Natural (commands array is introspectable) | Natural (commands array on class) | Must build (middleware doesn't expose commands naturally) | Must build (decoration-based) | Natural (same as 3a) | Partial (each binary has own --help) | Natural (commands defined in config) |
| S9: Lifecycle hooks | Not built-in (must add separately) | Native (this IS the model) | Native (this IS the model) | Supported via optional hooks field | Supported via lifecycle methods | Native (middleware wraps execution) | Native (plugin lifecycle via DAG) | Supported via hooks field | Not supported (separate processes) | Supported via hooks in config |
| S10: API versioning + compat check | Must build (version in manifest) | Must build (hook version checks) | Must build (version checks) | Natural (type version + zod validation) | Natural (base class version) | Must build | Must build | Natural (schema validation) | Not applicable (no shared API) | Natural (import versioned module) |
| S11: Error isolation | Moderate (try-catch per plugin) | Moderate (bail hooks can catch) | Moderate (try-catch per handler) | Moderate (try-catch per plugin.activate) | Moderate (try-catch per lifecycle) | Good (middleware can catch-and-continue) | Good (encapsulation isolates) | Moderate (try-catch per plugin) | Good (separate executable) | Moderate (try-catch) |
| S12: Local dev workflow | Must build link support | Must build link support | Must build link support | Config points to local path | Config points to local path | Config points to local path | Must build | Auto-discovers linked packages | PATH-based (just use the binary) | Already local (it's in the config file) |

### NICE Criteria (surviving approaches only)

| Criterion | 1b: Custom Convention | 2a: Tapable | 2b: Lightweight Hooks | 3a: Interface | 3b: Base Class | 4a: Middleware | 4b: Fastify | N1: Hybrid | N3: PATH+SDK | N4: Config-as-Code |
|---|---|---|---|---|---|---|---|---|---|---|
| N13: Plugin-to-plugin DI | Hard | Moderate (shared context via hooks) | Moderate | Hard (no shared context) | Moderate (base class has context) | Hard | Native (encapsulation + decoration) | Hard | N/A | Hard |
| N14: Marketplace/registry | Easy (npm search by convention) | Moderate | Moderate | Moderate (must publish + tag) | Moderate | Moderate | Moderate | Easy (npm search) | Easy (PATH scan) | N/A |
| N15: Tab completion for plugin commands | Must build | Must build | Must build | Introspectable (args defined in type) | Introspectable (args on class) | Must build | Must build | Introspectable | Must build per binary | Introspectable |
| N16: Hot reload during dev | Hard (module cache) | Hard | Hard | Moderate (re-import config) | Hard (class instances) | Hard | Hard | Moderate | Easy (re-run binary) | Easy (re-import config) |
| N17: Plugin-to-plugin deps | Hard | Moderate (hook ordering) | Moderate | Must build | Must build | Implicit (middleware order) | Native (DAG) | Must build | N/A | Must build |

## Eliminated

- **1a: oclif Adoption**: Eliminated on M3 (startup overhead). oclif's 85-135ms baseline before user code exceeds the 100ms budget. This is a measured, not theoretical, limitation — Vonage's CLI framework comparison benchmarked this on a 2023 MacBook Pro with Node.js 20.

- **5a: WASM/Extism**: Eliminated on M3 (startup latency: 100-300ms for WASM init) and M4 (TypeScript types don't cross the WASM host-guest boundary). The DX friction of WASM compilation would also suppress ecosystem growth, but it was eliminated on hard criteria before that mattered.

- **5b: Child Process Isolation**: Eliminated on M3 (50-150ms per process spawn). Even a single plugin invocation would risk exceeding the budget. Could be viable for a daemon-mode CLI with pre-warmed processes, but our assumption is a command-based CLI.

- **N2: Package Scripts**: Eliminated on M4 (no type safety). Arbitrary executables can't participate in a typed plugin contract. This approach works for user-level customization but not for a third-party plugin ecosystem.

## Finalists

After elimination, the remaining approaches cluster into three archetypes. I'm selecting one representative from each to ensure the finalists are genuinely different:

1. **N1: Interface Contract + Lazy Discovery Hybrid** — from Paradigm 3 + Paradigm 1 (the non-obvious hybrid). Selected because it combines the strongest elements of two paradigms: auto-discovery UX from convention-based systems with compile-time type safety from interface contracts. It scores well across all MUST criteria and most SHOULD criteria. This is the most balanced approach.

2. **2b: Lightweight Custom Hooks** — from Paradigm 2. Selected because it represents a fundamentally different bet: that plugins need to do more than just add commands. If lifecycle hooks and cross-cutting concerns (auth, telemetry, error handling) matter, an event-driven system is the natural fit. It's the lightweight variant because tapable's full complexity isn't justified for a CLI.

3. **4a: Middleware Pipeline** — from Paradigm 4. Selected because it represents the functional composition paradigm, which is qualitatively different from both the type-contract and event-driven approaches. Middleware is the most natural model if the CLI's execution pipeline is the primary extension point. It also has the best error isolation story of the three (catch-and-continue semantics).

**Why not the others?**
- 1b (Custom Convention) is subsumed by N1, which adds type safety on top of conventions.
- 2a (Tapable) is eliminated in favor of 2b — full tapable complexity isn't justified for a CLI.
- 3a (Interface Contract) is subsumed by N1, which adds auto-discovery on top of the interface.
- 3b (Abstract Base Class) is similar to 3a but with more rigidity — the "fragile base class" risk tips the balance toward the interface approach.
- 4b (Fastify Encapsulation) is too complex for the expected scale (5-20 plugins near-term). DAG resolution overhead isn't justified.
- N3 (Git-style PATH+SDK) is creative but fails S10 (API versioning) and S8 (help integration) since each plugin is an independent binary.
- N4 (Config-as-Code) is excellent for small-scale customization but fails S12 (local dev) for third-party distribution — you can't npm install a plugin; you must copy code into your config.

## Key Differentiator

**The single question that would make the choice clear:** Is the primary plugin use case "add new commands" or "modify the behavior of existing commands"?

- If **add new commands** dominates: N1 (Interface + Discovery) wins — it has the cleanest model for command registration and the best DX for command-only plugins.
- If **modify behavior** dominates: 2b (Lightweight Hooks) or 4a (Middleware) wins — they have native support for intercepting, wrapping, and augmenting the CLI pipeline.
- If **both matter equally**: Middleware (4a) is the most versatile, but at the cost of a less natural command registration model.

Since this is a greenfield exercise, I'll assume the primary use case is "add new commands" with lifecycle hooks as a secondary concern. This is the most common pattern for CLI plugin systems in practice (oclif, Nx, ESLint all started with "add X" and grew into lifecycle hooks over time).

## Open Risks

1. **ESM/CJS interop**: All three finalists rely on dynamic `import()` to load plugins. The Node.js ESM/CJS interop landscape is still messy — CJS packages can't dynamically import ESM without using `import()` (not `require()`), and some plugins may be CJS-only. This needs prototyping to verify.

2. **pnpm/yarn PnP compatibility**: Convention-based discovery (N1) scans `node_modules`, which doesn't exist in Yarn PnP or may have a different structure in pnpm with hoisting disabled. This is a real-world edge case that could break discovery.

3. **Plugin ordering**: All three finalists have some sensitivity to plugin load order. Hooks and middleware are explicitly ordered; even the interface contract approach needs a deterministic order for command precedence (what if two plugins register a command with the same name?).

4. **Startup performance at scale**: We estimated <100ms for the common case, but what happens with 50+ plugins installed? Lazy loading (N1) defers the cost; hooks (2b) and middleware (4a) may eagerly register handlers from all plugins.
