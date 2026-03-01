# Assumptions Made Without User Confirmation

Since this is a test run with no human in the loop, the following assumptions were made at points where the skill prescribes asking the user for confirmation. Each assumption is documented with the phase where it arose and how it influenced the exploration.

## Phase 1: Problem Framing

### Assumption 1: Vercel / serverless deployment
**Where the skill said to ask:** "Surface assumptions. Verify each with the user."
**What I assumed:** The app is deployed on Vercel or a similar serverless platform (not a self-hosted Node.js server).
**Impact:** This was the single most consequential assumption. It eliminated two approaches (SSE Route Handler, WebSocket Server) from the finalist pool because they require long-lived server processes. If the app were self-hosted on a VPS or Railway, SSE via Route Handler would have been a top-2 finalist due to its zero-dependency simplicity.

### Assumption 2: PostgreSQL or equivalent relational database
**Where the skill said to ask:** "Surface assumptions."
**What I assumed:** The app uses (or will use) a relational database like PostgreSQL, not Supabase or Convex.
**Impact:** This influenced the elimination of Supabase Realtime (would be a top choice if already on Supabase) and the ranking of Convex (elegant but requires full backend commitment). If the answer were "we're using Supabase," Approach 2b would likely be the recommendation.

### Assumption 3: Small team, no dedicated DevOps
**Where the skill said to ask:** "Surface assumptions."
**What I assumed:** A small team (1-5 engineers) with frontend strength, no dedicated infrastructure/DevOps person.
**Impact:** Favored managed services over self-hosted solutions. Eliminated approaches with high operational overhead (self-hosted Novu, separate WebSocket server).

### Assumption 4: Budget sensitivity
**Where the skill said to ask:** Implicit in "Constraints."
**What I assumed:** The app is pre-revenue or early-stage. A $250/month fixed cost for notifications is undesirable until there's traction.
**Impact:** This was the primary reason Knock was not the top recommendation despite being the most feature-complete. If budget were not a concern, Knock would be the recommendation.

### Assumption 5: "Real-time" means 1-3 seconds, not instant
**Where the skill said to ask:** Phase 1, "Define success criteria."
**What I assumed:** Users expect notifications to appear within a few seconds, not sub-100ms. Social notification latency expectations are closer to "within a couple seconds" than "instant."
**Impact:** This kept all real-time approaches viable (SSE, WebSocket, Upstash, Supabase, Pusher all deliver within 1-3s). It also properly eliminated polling at 5-15s.

## Phase 2: Solution Exploration

### Assumption 6: Not already using Supabase or Convex
**Where the skill said to ask:** Research phase, integration surface exploration.
**What I assumed:** The app hasn't committed to a backend platform yet (it's greenfield).
**Impact:** Supabase Realtime and Convex were evaluated as "requires adopting the platform" rather than "leverage what you already have." Both would rank higher if already in use.

## Phase 3: Analysis

### Assumption 7: Batching/digests are SHOULD, not MUST
**Where the skill said to ask:** Criteria ranking.
**What I assumed:** The initial launch can ship individual notifications without batching ("Alice liked your post" + "Bob liked your post" as separate items). Batching can come later.
**Impact:** This was critical for the Upstash recommendation. Knock's built-in batching is one of its strongest features; if batching were a MUST, Knock would be the clear winner.

## Phase 5: Decision

### Assumption 8: Migration path matters
**Where the skill said to ask:** Implicit in the decision criteria.
**What I assumed:** The team values the ability to change their mind later. A low-commitment starting point with a clear upgrade path is preferable to a high-commitment "best final answer."
**Impact:** Upstash's low vendor lock-in (~30 lines of Upstash-specific code) was weighted heavily. The decision document includes explicit migration paths to Knock if more sophisticated features become needed.
