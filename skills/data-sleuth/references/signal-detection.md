# Signal Detection Techniques

Comprehensive guide to identifying non-obvious patterns using techniques from data journalism, forensic accounting, and OSINT investigation.

## Table of Contents
1. [Temporal Fingerprinting](#1-temporal-fingerprinting)
2. [Ratio Analysis](#2-ratio-analysis)
3. [Absence Detection](#3-absence-detection)
4. [Cross-Dataset Triangulation](#4-cross-dataset-triangulation)
5. [Outlier Contextualization](#5-outlier-contextualization)
6. [Linguistic Forensics](#6-linguistic-forensics)
7. [Network Topology Analysis](#7-network-topology-analysis)
8. [Behavioral Segmentation](#8-behavioral-segmentation)
9. [Counter-Intuitive Correlation Mining](#9-counter-intuitive-correlation-mining)
10. [Benford's Law Analysis](#10-benfords-law-analysis)

---

## 1. Temporal Fingerprinting

**What it finds:** Unique patterns in timing that reveal habits, schedules, time zones, and behavioral rhythms.

### Technique

1. **Hour-of-day distribution** — Plot activity by hour. Look for:
   - Peak activity hours (reveals work schedule, lifestyle)
   - Dead zones (sleep patterns, commitments)
   - Unusual late-night/early-morning activity spikes

2. **Day-of-week patterns** — Compare weekday vs weekend behavior:
   - Topic shifts (professional Mon-Fri, personal Sat-Sun)
   - Volume changes (may indicate work obligations)
   - Engagement style differences

3. **Temporal anomalies** — Flag deviations from established patterns:
   - Sudden schedule shifts (life changes, travel, crisis)
   - Activity during unusual hours (insomnia, different time zone)
   - Gap analysis (unexplained silence periods)

### What it reveals

- Likely time zone and location
- Work schedule and lifestyle
- Life events (vacations, job changes, personal crises)
- Authenticity signals (bots have unnatural timing)

### Example signals

```
Finding: Activity spike at 3-4 AM local time for 2 weeks in March 2024
Possible interpretations:
- Travel to different time zone
- Insomnia/stress period
- Caring for infant
- New job with unusual hours
Cross-reference: Check content during these periods for context clues
```

---

## 2. Ratio Analysis

**What it finds:** Unusual proportions that suggest hidden behaviors or gaming.

### Key ratios to examine

1. **Engagement ratios**
   - Likes given : Likes received
   - Comments given : Comments received
   - Posts : Replies ratio
   - Original content : Shared content

2. **Content ratios**
   - Text : Media posts
   - Questions asked : Answers given
   - Positive : Negative sentiment
   - Public : Private (replies) content

3. **Network ratios**
   - Following : Followers
   - Connections in : Connections out
   - Engaged contacts : Passive contacts

### Red flags

| Ratio | Normal Range | Suspicious Signal |
|-------|--------------|-------------------|
| Followers:Following | 0.5-3x | >10x or <0.1x |
| Likes:Posts | 5-50x | >500x (lurker) or <1x (broadcaster) |
| Replies:Original | 0.2-2x | <0.05x (broadcast only) |
| Engagement rate | 1-10% | >50% (bot network) |

### What unusual ratios reveal

- **High lurker ratio:** Consumer, not creator; may have stronger opinions than visible
- **Broadcast-only:** Not interested in dialogue; promotional intent
- **Asymmetric network:** Influencer aspirations or parasocial relationships
- **Engagement anomalies:** Purchased followers, bot activity, or highly targeted niche

---

## 3. Absence Detection

**What it finds:** Gaps, missing expected patterns, or conspicuous silence.

### The "Dog That Didn't Bark" Principle

Absence of expected signals is itself a signal. Look for:

1. **Topic avoidance**
   - Major events in their field with no mention
   - Personal milestones with no acknowledgment
   - Controversial topics they consistently avoid

2. **Temporal gaps**
   - Unexplained silence periods
   - Missing data in exports (deletions?)
   - Inconsistent archiving

3. **Structural absences**
   - No mentions of family/relationships when otherwise personal
   - No political content in politically active circles
   - No work content despite professional platform use

4. **Expected but missing**
   - No holiday posts during holidays
   - No responses to @mentions
   - No engagement with close connections

### How to investigate absences

```
For each identified absence:
1. Confirm it's truly absent (not just rare)
2. Establish baseline expectation (why would we expect it?)
3. Generate hypotheses for absence
4. Look for circumstantial evidence supporting hypotheses
5. Note confidence level
```

### What absences reveal

- Compartmentalization strategies
- Privacy boundaries
- Topics that cause discomfort
- Potential life events during gaps
- Deleted content (self-censorship)

---

## 4. Cross-Dataset Triangulation

**What it finds:** Patterns that only emerge when comparing multiple data sources.

### Triangulation methods

1. **Temporal alignment**
   - Plot activities from multiple platforms on same timeline
   - Look for correlated spikes/dips across platforms
   - Identify platform-specific timing patterns

2. **Content correlation**
   - Same topic discussed differently across platforms
   - Information shared on one platform but not another
   - Contradictions between platforms

3. **Behavioral consistency**
   - Communication style comparison
   - Topic preferences per platform
   - Engagement patterns

4. **Identity verification**
   - Cross-reference biographical details
   - Check for inconsistencies in stated facts
   - Verify timeline consistency

### Correlation matrix approach

For each finding, score across datasets:

| Finding | Twitter | LinkedIn | Instagram | Combined Confidence |
|---------|---------|----------|-----------|---------------------|
| Interest in X | Strong | Absent | Weak | Medium (compartmentalized?) |
| Career change | Weak | Strong | Absent | High (professional signal) |
| Relationship | Absent | Absent | Strong | High (personal boundary) |

### What triangulation reveals

- Audience-specific personas
- Information hierarchy (what they share where)
- Authenticity signals (consistency = authentic)
- Hidden aspects of identity
- Compartmentalization strategies

---

## 5. Outlier Contextualization

**What it finds:** Whether statistical anomalies are meaningful signals or noise.

### The investigator's outlier framework

Don't automatically exclude outliers. Instead:

1. **Identify** — Use statistical methods (Z-score, IQR)
2. **Contextualize** — What was happening when this occurred?
3. **Categorize:**
   - **Error outliers:** Data entry mistakes, parsing errors
   - **Contextual outliers:** Unusual but explainable (vacation, event)
   - **Signal outliers:** Genuine deviation revealing hidden pattern

### Contextualization questions

For each outlier, ask:
- What was happening in the world at this time?
- What was happening in their life (if known)?
- Does this correlate with outliers in other metrics?
- Is this the start of a trend or truly isolated?
- Could this be a data artifact?

### Signal outlier indicators

High probability of meaningful signal if:
- Multiple independent outliers correlate temporally
- Outlier marks beginning of sustained change
- Outlier contradicts established pattern strongly
- Outlier has contextual explanation that reveals new information

---

## 6. Linguistic Forensics

**What it finds:** Vocabulary shifts, tone changes, and writing pattern evolution.

### Analysis dimensions

1. **Vocabulary evolution**
   - Track new terms adoption over time
   - Identify jargon entry points (new job, community, interest)
   - Note abandoned vocabulary (changing interests)

2. **Sentiment trajectory**
   - Overall sentiment over time
   - Topic-specific sentiment
   - Emotional range (consistent vs volatile)

3. **Formality shifts**
   - Platform-specific register
   - Time-of-day register changes
   - Audience-specific adjustments

4. **Linguistic fingerprints**
   - Characteristic phrases
   - Punctuation habits
   - Emoji usage patterns
   - Capitalization style

### What to look for

```
Linguistic shift detection:
- Sudden vocabulary changes → new influence source
- Gradual formality increase → professional growth
- Sentiment drops → life challenges
- New jargon clusters → new community membership
- Writing style change → potential ghostwriting or shared account
```

### Forensic applications

- Detect potential account sharing/ghostwriting
- Identify influence sources (who taught them this vocabulary?)
- Track worldview evolution through language change
- Authenticate identity across platforms

---

## 7. Network Topology Analysis

**What it finds:** Connection patterns, community structures, and influence flows.

### Analysis approaches

1. **Centrality analysis**
   - Who do they engage with most?
   - Who engages with them most?
   - Who bridges them to other communities?

2. **Community detection**
   - What clusters exist in their network?
   - How do they move between clusters?
   - Which communities are they peripheral vs central to?

3. **Influence mapping**
   - Who do they amplify?
   - Who amplifies them?
   - What ideas flow through them?

4. **Evolution tracking**
   - How has their network changed over time?
   - Who are they distancing from?
   - Who are they moving toward?

### Key signals

| Pattern | Interpretation |
|---------|----------------|
| Dense single cluster | Deep specialization, potential echo chamber |
| Multiple sparse clusters | Bridge builder, diverse interests |
| Asymmetric engagement | Aspirational connections or fan behavior |
| Rapidly changing network | Life transition, identity exploration |
| Stable core + evolving periphery | Healthy growth pattern |

---

## 8. Behavioral Segmentation

**What it finds:** Distinct modes of operation within a single user's activity.

### Segmentation dimensions

1. **By time period**
   - Before/after significant events
   - Seasonal patterns
   - Day vs night personas

2. **By platform context**
   - Reply behavior vs original posting
   - Public vs semi-private content
   - Professional vs personal contexts

3. **By topic**
   - Work topics behavior
   - Hobby topics behavior
   - Controversial topics behavior

4. **By audience**
   - How they engage with different connection types
   - Responses to strangers vs known contacts
   - Behavior toward high-status vs peer accounts

### Multi-persona detection

Signs of distinct behavioral modes:
- Statistically different engagement patterns by segment
- Topic-specific vocabulary or tone shifts
- Audience-specific content strategies
- Time-based behavioral switching

---

## 9. Counter-Intuitive Correlation Mining

**What it finds:** Unexpected relationships between variables.

### Approach

1. **Generate correlation matrix** for all quantifiable variables
2. **Flag unexpected correlations:**
   - Variables that "shouldn't" correlate but do
   - Expected correlations that don't exist
   - Negative correlations where positive expected

3. **Investigate mechanisms:**
   - Is this spurious (third variable)?
   - Is this causal (which direction)?
   - Is this revealing hidden behavior?

### Examples of counter-intuitive findings

```
Finding: Negative correlation between post length and engagement
Expected: Longer = more thoughtful = more engagement
Reality: Their audience prefers brevity
Implication: Adapt communication style recommendations

Finding: Weekend activity correlates with negative sentiment
Expected: Weekend = leisure = positive
Reality: Weekend posts come from loneliness/boredom
Implication: Important insight for personality profile
```

---

## 10. Benford's Law Analysis

**What it finds:** Data manipulation, fabrication, or unusual generation patterns.

### Application

Benford's Law: In naturally occurring datasets, the digit 1 appears as the leading digit ~30% of the time, with decreasing frequency for higher digits.

### Where to apply

- Engagement metrics (likes, shares, views)
- Follower/following counts over time
- Time intervals between activities
- Any numerical data that spans multiple orders of magnitude

### Red flags

Deviation from Benford's distribution may indicate:
- Purchased engagement/followers
- Bot-generated activity
- Data manipulation
- Artificial constraints on the data

### Caveat

Only applies to data spanning multiple orders of magnitude. Not valid for bounded ranges (e.g., hours 1-24) or uniform distributions.

---

## Applying Techniques Together

The most powerful insights come from combining techniques:

1. **Temporal + Linguistic:** When vocabulary shifted, did timing patterns also change?
2. **Ratio + Absence:** Do unusual ratios correlate with topic avoidance?
3. **Network + Behavioral:** Do they behave differently with different network segments?
4. **Cross-Dataset + Outlier:** Do outliers on one platform correlate with activity on another?

Always document methodology and confidence levels for each finding.
