This session so far (TL;DR)

We cleaned up the data fetching like you asked. Every screen used to fetch in its own way; now they all go through one shared system. One decision is waiting on you, and about 12 old tests are still red.

What changed
- Every screen now gets its data the same way. Before, each screen wrote its own code to talk to the server, with its own loading spinners and error handling, some caching and some not. Now there's one shared system, and screens just ask for what they need (for example, "give me the projects"). Loading and error states are handled in one place.
- The favorite button feels instant now. When you tap it, the star flips right away instead of waiting for the server. If the server rejects it, the star quietly flips back.
- Login token refresh got untangled. The app's login token has to be refreshed periodically. That was happening in three different spots with slightly different logic. Now it happens in one place: when a request fails because the token expired, the app refreshes once and retries that request automatically.

Why
- The old setup was the same job done a dozen slightly different ways, which is where bugs and inconsistency hide. Pulling it into one shared path means a fix or improvement lands everywhere at once, and screens get caching and retries for free instead of each reinventing them.

Your call
- How fresh should data be? The new system can reuse recently loaded data for up to 5 minutes before checking the server again. That means fewer requests and a snappier feel, but someone could briefly see slightly stale numbers. We left it at "always check the server" for now, which is the safe, fresh-but-chattier default. Tell us if you want to trade some freshness for speed.

Still open
- About 12 old tests are still failing. They tested the old fetch code we deleted, so they're red, not because the app is broken but because they point at code that no longer exists. The app itself builds fine. These tests need rewriting against the new shared hooks; we cleared out some but ran out of road on these 12.
