# Language-Specific Skeleton Patterns

Reference examples for how to write type skeletons in different languages. The key principle is the same everywhere: define the contract (protocol/trait/interface), define all types with all fields, and provide a stub implementation that compiles but panics if called.

## Swift

```swift
// Protocols define the contracts
protocol RuntimeEngine {
    func start(config: RuntimeConfig) throws
    func stop() throws
    func currentSnapshot() -> RuntimeSnapshot
}

// Types are fully defined — all fields present
struct RuntimeConfig {
    let storagePath: URL
    let pollInterval: TimeInterval
}

enum RuntimeError: Error {
    case alreadyRunning
    case storageUnavailable(reason: String)
}

// Stub implementations so the project compiles
final class RuntimeEngineImpl: RuntimeEngine {
    func start(config: RuntimeConfig) throws {
        fatalError("Not implemented: RuntimeEngine.start")
    }
    func stop() throws {
        fatalError("Not implemented: RuntimeEngine.stop")
    }
    func currentSnapshot() -> RuntimeSnapshot {
        fatalError("Not implemented: RuntimeEngine.currentSnapshot")
    }
}
```

## Rust

```rust
// Traits define the contracts
pub trait RuntimeEngine {
    fn start(&mut self, config: RuntimeConfig) -> Result<(), RuntimeError>;
    fn stop(&mut self) -> Result<(), RuntimeError>;
    fn current_snapshot(&self) -> RuntimeSnapshot;
}

// Types are fully defined — all fields present
pub struct RuntimeConfig {
    pub storage_path: PathBuf,
    pub poll_interval: Duration,
}

pub enum RuntimeError {
    AlreadyRunning,
    StorageUnavailable { reason: String },
}

// Stub implementation so the project compiles
pub struct RuntimeEngineImpl;

impl RuntimeEngine for RuntimeEngineImpl {
    fn start(&mut self, config: RuntimeConfig) -> Result<(), RuntimeError> {
        todo!("RuntimeEngine::start")
    }
    fn stop(&mut self) -> Result<(), RuntimeError> {
        todo!("RuntimeEngine::stop")
    }
    fn current_snapshot(&self) -> RuntimeSnapshot {
        todo!("RuntimeEngine::current_snapshot")
    }
}
```

## TypeScript

```typescript
// Interfaces define the contracts
interface RuntimeEngine {
    start(config: RuntimeConfig): Promise<void>;
    stop(): Promise<void>;
    currentSnapshot(): RuntimeSnapshot;
}

// Types are fully defined
interface RuntimeConfig {
    storagePath: string;
    pollInterval: number;
}

type RuntimeError =
    | { kind: 'already_running' }
    | { kind: 'storage_unavailable'; reason: string };

// Stub implementation so tsc --noEmit passes
class RuntimeEngineImpl implements RuntimeEngine {
    async start(config: RuntimeConfig): Promise<void> {
        throw new Error('Not implemented: RuntimeEngine.start');
    }
    async stop(): Promise<void> {
        throw new Error('Not implemented: RuntimeEngine.stop');
    }
    currentSnapshot(): RuntimeSnapshot {
        throw new Error('Not implemented: RuntimeEngine.currentSnapshot');
    }
}
```

## Key Points

- **Swift**: Use `fatalError("Not implemented: ...")` for stubs
- **Rust**: Use `todo!("MethodName::method")` for stubs
- **TypeScript**: Use `throw new Error('Not implemented: ...')` for stubs
- Always include the method name in the stub message so it's obvious what's missing when a stub is accidentally called
- Stub implementations must satisfy all compiler checks (conformance, return types, etc.)
