# Catch-up: data fetching cleanup

## The short version

The data fetching was a mess — every screen did its own thing. That's now cleaned up and consolidated. The build passes. There's **one decision I need from you** and **one piece of unfinished work** (12 failing tests). Details below.

## What got done

**1. One shared way to fetch data, instead of many.**
Before, every screen wrote its own `fetch()` calls inside the component, each with its own loading spinner, error handling, and caching (some screens cached, some didn't). Now there's a single shared query client (TanStack Query) underneath, and components just call typed hooks like `useProjects()`. They no longer write fetch logic themselves. Loading and error states are handled in one place, so they're consistent everywhere.

Why it matters: less duplicated code, consistent behavior across screens, and adding a new screen no longer means reinventing data fetching.

**2. The favorite button feels instant now.**
When you click "favorite," the UI flips to favorited immediately instead of waiting for the server to reply. If the server call fails, it rolls back automatically. (This is called an optimistic update.)

**3. Auth token refresh is no longer duplicated.**
The app was refreshing the auth token in three different places, each with slightly different logic — the kind of thing that drifts and causes weird bugs. That's now consolidated into one place (a request interceptor): when a request hits an expired token, it refreshes once and retries the request automatically.

## One decision for you

**How fresh should data be?**

TanStack Query can serve recently-cached data for a window before it re-fetches (a setting called `staleTime`). The tradeoff:

- **Higher staleTime (e.g. 5 minutes):** fewer network requests, snappier feel, but users might briefly see slightly out-of-date data.
- **staleTime at 0 (always re-fetch):** always fresh, but more requests and a touch slower.

I left it at **0 (always re-fetch)** for now — the safe default — and flagged it for you. If most of your data doesn't change second-to-second, bumping this up (even to 30–60 seconds) is usually a clear win for perceived speed. Your call on the number.

## One thing not finished

**12 legacy tests are still red.**

The old tests under `tests/legacy-fetch/` were written against the fetch code we deleted. I removed the ones that no longer applied, but about **12 tests still reference removed helpers** and need to be rewritten against the new hooks. The app and build are fine — only these tests are failing. This is the remaining cleanup before the suite is green again.

## Suggested next steps

1. **Decide on `staleTime`** — tell me a number (0, 30s, 5min) and I'll set it.
2. **Let me rewrite the 12 legacy tests** against the new hooks so the suite goes green.

Want me to go ahead on the tests while you think about the freshness setting?
