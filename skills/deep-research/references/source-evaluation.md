# Source Evaluation Criteria

Detailed criteria for assessing source reliability and authority.

## The CRAAP Test (Modified for AI Research)

For each source, evaluate:

### Currency

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| Publication date | Within 1-2 years for tech; 5 years for stable topics | Undated or >5 years old |
| Last updated | Recently revised | No revision history |
| Links | Working, current | Broken, outdated |
| Version specificity | Matches current versions | References deprecated APIs/features |

**Red flags:**
- No date anywhere on the page
- References to "new" features that are now standard
- Broken external links
- Deprecated syntax or APIs

### Relevance

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| Depth | Directly addresses the question | Tangentially related |
| Audience | Appropriate technical level | Too basic or too advanced |
| Scope | Focused on specific topic | Overly broad coverage |
| Applicability | Matches user's context | Different domain/use case |

### Authority

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| Author credentials | Named expert with verifiable background | Anonymous or unknown |
| Publisher | Recognized organization, institution | Unknown domain |
| Peer review | Academic journal, official docs | Self-published |
| Citations | Well-cited by others | No external citations |

**Authority indicators by domain:**

| Domain Type | Authority Signals |
|-------------|-------------------|
| .gov | Government agency, high authority for regulations/data |
| .edu, .ac.* | Academic institution, peer-reviewed research |
| .org | Varies widely; check specific organization |
| Official docs | Primary source for that product/service |
| GitHub | Check stars, contributors, maintenance activity |
| Medium/blogs | Highly variable; verify author credentials |

### Accuracy

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| Citations | Claims backed by references | Unsourced assertions |
| Verifiability | Can be checked against primary sources | Unverifiable claims |
| Consistency | Agrees with other authoritative sources | Contradicts consensus |
| Methodology | Clear, reproducible | Vague or absent |

**Verification techniques:**
1. Check if cited sources actually support the claims
2. Cross-reference with official documentation
3. Test code examples if possible
4. Look for corroborating independent sources

### Purpose

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| Objectivity | Educational, informational | Marketing, promotional |
| Transparency | Disclosures, clear ownership | Hidden affiliations |
| Tone | Balanced, evidence-based | Sensational, one-sided |
| Intent | Help reader understand | Sell product/service |

**Bias indicators:**
- Affiliate links without disclosure
- Only positive coverage of a product
- Attacks on competitors
- Sponsored content not clearly labeled
- Author works for company being discussed

## Source Type Reliability Hierarchy

From most to least reliable (general guidelines, exceptions exist):

1. **Primary sources** — Official documentation, original research, firsthand accounts
2. **Academic/peer-reviewed** — Journal articles, conference papers, institutional research
3. **Authoritative secondary** — Well-sourced news from reputable outlets, industry analyst reports
4. **Expert analysis** — Known experts writing in their field, with citations
5. **Community consensus** — High-vote Stack Overflow answers, widely-used GitHub repos
6. **General secondary** — Wikipedia (follow its sources), established tech blogs
7. **Individual opinions** — Personal blogs, forum posts, social media
8. **Unknown/anonymous** — Unsourced claims, SEO content farms, AI-generated without verification

## Red Flags That Lower Source Trust

### Content Red Flags

- [ ] No author attribution
- [ ] No publication or update date
- [ ] No citations or references
- [ ] Claims that can't be verified
- [ ] Sensational or clickbait headlines
- [ ] Grammatical errors or poor writing quality
- [ ] Contradicts well-established facts
- [ ] "According to experts" without naming them

### Technical Red Flags

- [ ] Deprecated or non-working code examples
- [ ] Incorrect technical terminology
- [ ] Advice that contradicts official docs
- [ ] Missing security considerations
- [ ] Platform/version mismatch with current reality

### Structural Red Flags

- [ ] Excessive ads or pop-ups
- [ ] Content hidden behind paywalls with no credentials
- [ ] Domain looks like a content farm
- [ ] No About page or organizational info
- [ ] Recently created domain with authoritative claims

## Evaluating AI-Generated Content

AI content is increasingly common; evaluate carefully:

**Warning signs of unverified AI content:**
- Generic, surface-level coverage
- Confident claims without citations
- Plausible-sounding but incorrect technical details
- Inconsistencies within the same article
- Lack of specific examples or real-world context

**Mitigation:**
- Never trust AI summaries as primary sources
- Always trace claims back to original sources
- Verify technical claims against official docs
- Test code examples before accepting them

## Source Evaluation Checklist

Before citing any source, verify:

```markdown
- [ ] Author/organization identified and credible
- [ ] Publication date is acceptable for topic
- [ ] Claims are consistent with other sources
- [ ] Technical content is current and accurate
- [ ] No obvious commercial bias
- [ ] URL is functional and content is accessible
```

## Recording Source Quality

When documenting research, include:

```markdown
| Source | Type | Authority | Recency | Bias Risk | Notes |
|--------|------|-----------|---------|-----------|-------|
| [URL] | Official docs | High | Current | Low | Primary source |
| [URL] | Blog post | Medium | 2023 | Medium | Author works at competitor |
| [URL] | Research paper | High | 2022 | Low | Peer-reviewed, highly cited |
```
