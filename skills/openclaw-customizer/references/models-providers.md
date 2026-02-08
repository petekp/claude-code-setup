# OpenClaw Models & Providers

## Model Reference Format

Models use `provider/model` format: `anthropic/claude-opus-4-6`, `openai/gpt-5.2`, etc.

## Setting Default Model

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["anthropic/claude-sonnet-4-5", "openai/gpt-5.2"]
      }
    }
  }
}
```

Per-agent override: set `model` in `agents.list[]` entries.

## Built-in Providers

| Provider | Env Var | Provider ID |
|----------|---------|-------------|
| Anthropic | `ANTHROPIC_API_KEY` | `anthropic` |
| OpenAI | `OPENAI_API_KEY` | `openai` |
| Google Gemini | `GEMINI_API_KEY` | `google` |
| OpenRouter | `OPENROUTER_API_KEY` | `openrouter` |
| xAI (Grok) | `XAI_API_KEY` | `xai` |
| Groq | `GROQ_API_KEY` | `groq` |
| Cerebras | `CEREBRAS_API_KEY` | `cerebras` |
| Mistral | `MISTRAL_API_KEY` | `mistral` |
| GitHub Copilot | (OAuth) | `github-copilot` |
| Vercel AI Gateway | | `vercel-ai-gateway` |

## Built-in Aliases

- `opus` = `anthropic/claude-opus-4-6`
- `sonnet` = `anthropic/claude-sonnet-4-5`
- `gpt` = `openai/gpt-5.2`
- `gpt-mini` = `openai/gpt-5-mini`
- `gemini` = `google/gemini-3-pro-preview`
- `gemini-flash` = `google/gemini-3-flash-preview`

## Custom Providers

Add custom or self-hosted providers via `models.providers`:

```json5
{
  models: {
    providers: {
      "my-provider": {
        baseUrl: "https://api.example.com/v1",
        apiKey: "${MY_API_KEY}",
        api: "openai-completions",         // or "anthropic-messages"
        models: [
          {
            id: "my-model",
            name: "My Model",
            contextWindow: 128000,
            maxTokens: 4096,
            reasoning: false,
            input: ["text", "image"],
            cost: { input: 0.01, output: 0.03 }
          }
        ],
        params: { temperature: 0.7 }
      }
    }
  }
}
```

## Local Models

**Ollama** (auto-detected at `http://127.0.0.1:11434/v1`):
```json5
{
  models: {
    providers: {
      ollama: {
        baseUrl: "http://127.0.0.1:11434/v1",
        api: "openai-completions",
        models: [{ id: "llama3.3", name: "Llama 3.3 70B" }]
      }
    }
  }
}
```

**LM Studio**: Same pattern, typically `http://localhost:1234/v1`.

## Model Failover

Fallback chain: `model.primary` -> each entry in `model.fallbacks` in order.

Per-model parameters:
```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          alias: "opus",
          params: { temperature: 0.8, maxTokens: 8192 }
        }
      }
    }
  }
}
```

## Auth Profiles

Multiple auth methods per provider with failover:

```json5
{
  auth: {
    profiles: {
      "anthropic-oauth": { provider: "anthropic", mode: "oauth" },
      "anthropic-key": { provider: "anthropic", mode: "api_key" }
    },
    order: {
      anthropic: ["anthropic-oauth", "anthropic-key"]
    }
  }
}
```

## CLI Commands

- `openclaw models list` — show available models
- `openclaw models set <provider/model>` — set default
- `openclaw models auth login --provider <provider>` — authenticate
- `openclaw onboard --auth-choice <provider>` — initial setup

## Thinking Levels

- `thinkingDefault: "off"` — no extended thinking (default)
- `thinkingDefault: "low"` — light reasoning
- `thinkingDefault: "high"` — deep reasoning (uses more tokens)
- Per-cron/per-request overrides: `off|minimal|low|medium|high|xhigh`
