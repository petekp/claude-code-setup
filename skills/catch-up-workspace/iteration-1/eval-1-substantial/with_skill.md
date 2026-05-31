This session so far — TL;DR

We cleaned up the data fetching like you asked. Every screen used to fetch data its own way; now they all share one system. Two things need you: one decision about freshness, and one batch of broken tests we didn't finish.

What changed
- One shared way to fetch data. Before, each screen wrote its own code to talk to the server, with its own handling for "still loading" and "something broke." Some screens cached results, some didn't. We replaced all of that with a single shared setup. Screens now just ask for what they need (for example, "give me the projects") and the loading and error handling happen in one place instead of being copy-pasted everywhere.
- The favorite button feels instant now. When you click favorite, the star fills in immediately instead of waiting for the server to answer. If the server rejects it, the star quietly flips back. No more waiting on the round trip to see your own click land.
- Login token refresh is no longer in three places. The app's "stay logged in" logic was written three separate times, each slightly different. We merged it into one spot: when a request fails because the token expired, it refreshes once and retries the request automatically.

Why
- The scattered fetch code was the actual mess you flagged. Every screen reinventing loading, errors, and caching meant bugs hid in the differences and nothing was consistent. One shared system means a fix or improvement lands everywhere at once.
- The three copies of the token logic were a quiet risk. Three slightly different versions of "refresh the login" is the kind of thing that works until one copy drifts and people get logged out for no clear reason.

Your call
- How fresh should data be? The new system can reuse recently-fetched data for up to 5 minutes before going back to the server. Reusing it means fewer requests and a snappier feel, but someone could briefly see slightly stale data. For now we set it to always refetch (most correct, a bit more network traffic). Tell us if you want the faster, slightly-staler behavior, and whether it should apply everywhere or just some screens.
- 12 tests are still red, and that's on us to finish. The old tests checked the fetch code we deleted, so they broke. We removed the dead ones but about 12 still lean on helpers that no longer exist. They need rewriting against the new shared setup. The app itself builds and runs fine; this is test cleanup, not a broken feature. We can finish it next unless you'd rather we move on.
