# Comparison Criteria (defined before prototyping)

1. **Lines of code for the host plugin infrastructure** -- how much code does the host CLI need to support plugins? Fewer is better (less maintenance burden).

2. **Lines of code for a sample plugin** -- how much code does a plugin author write to register a command with flags, a lifecycle hook, and access to a shared service (logger)? Fewer is better (lower barrier to entry).

3. **Type safety quality** -- does the plugin author get full autocomplete and type errors in their IDE? Measured by: can we catch a misspelled hook name at compile time? Can we type command flags?

4. **Extensibility headroom** -- how hard is it to add a new capability (e.g., a new lifecycle hook, a new shared service) without breaking existing plugins?

5. **Startup path clarity** -- can we trace the startup path (discovery -> load -> register -> resolve command -> execute) and understand it in under 2 minutes of reading?

6. **Plugin isolation quality** -- if a plugin throws during registration or execution, does the host recover gracefully?
