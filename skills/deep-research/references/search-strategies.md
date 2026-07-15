# Search Strategies

Advanced query techniques for different research domains.

## General Search Techniques

### Query Formulation

**Start broad, then narrow:**
```
1. [topic] → Overview, discover terminology
2. [topic] + [specific aspect] → Targeted results
3. "[exact phrase]" → Precise matches
4. [topic] site:authoritative-domain.com → Limit to trusted sources
```

**Multiple query angles for the same topic:**
```
Topic: "How does React Server Components handle data fetching?"

Queries:
1. "React Server Components data fetching"
2. "RSC fetch data server side"
3. "React 18 server components tutorial"
4. "site:react.dev server components"
5. "React Server Components vs getServerSideProps"
```

### Search Operators

| Operator | Usage | Example |
|----------|-------|---------|
| `"quotes"` | Exact phrase | "machine learning pipeline" |
| `site:` | Limit to domain | site:github.com tensorflow |
| `-` | Exclude term | python tutorial -beginner |
| `OR` | Either term | (React OR Vue) state management |
| `filetype:` | Specific format | filetype:pdf research paper |
| `intitle:` | In page title | intitle:benchmarks database |
| `after:` | Date filter | AI developments after:2024 |

## Domain-Specific Strategies

### Technical Documentation

**Primary sources first:**
```
1. [library] official documentation
2. site:[official-docs-domain] [topic]
3. [library] [feature] example
4. [library] changelog [version]
```

**Use specialized tools:**
- Context7 for indexed library docs
- OpenAI MCP for OpenAI-specific APIs
- GitHub search for implementation examples

**Version-specific searches:**
```
[library] [version] [feature] (e.g., "React 18 useTransition")
[library] migration guide [from-version] to [to-version]
[library] breaking changes [version]
```

### Academic/Research

**Finding scholarly sources:**
```
[topic] research paper
[topic] study OR survey OR analysis
[topic] site:arxiv.org OR site:scholar.google.com
[topic] filetype:pdf peer reviewed
```

**Evaluating research:**
- Check citation count (Google Scholar)
- Look for recent papers citing older foundational work
- Find systematic reviews or meta-analyses for comprehensive coverage

### Current Events / Recent Information

**Time-sensitive queries:**
```
[topic] 2024 (or current year)
[topic] latest OR recent OR new
[topic] after:YYYY-MM
[company] announces [topic]
```

**News-specific:**
```
[topic] site:reuters.com OR site:bbc.com
[topic] press release
[topic] announced today
```

### Comparative Research

**Structured comparisons:**
```
[A] vs [B] comparison
[A] OR [B] benchmark
[A] vs [B] when to use
[A] vs [B] pros cons
"migrate from [A] to [B]"
```

**Avoid vendor bias:**
- Search for independent comparisons
- Check if comparison site has affiliate relationships
- Look for comparisons from users, not vendors

### Debugging / Problem-Solving

**Error messages:**
```
"exact error message" (in quotes)
[error message] [language/framework]
[error message] solution OR fix OR resolved
[error code] site:stackoverflow.com
```

**Expanding search when stuck:**
```
[symptom] instead of [specific error]
[what you're trying to do] [framework] not working
[framework] [operation] fails
```

### Security Research

**Vulnerability information:**
```
[product] CVE
[product] security advisory
[vulnerability type] [product] exploit
site:nvd.nist.gov [product]
```

**Best practices:**
```
[technology] security best practices
[technology] OWASP
[operation] secure implementation
```

## Tool-Specific Strategies

### WebSearch

Best for:
- Broad discovery of sources
- Recent/current information
- Finding multiple perspectives

Tips:
- Run 3-5 query variations
- Note which domains appear authoritative
- Use results to find better queries

### WebFetch

Best for:
- Reading full content from known URLs
- Extracting specific information from pages
- Following links from search results

Tips:
- Fetch full pages, not just snippets
- Follow "See also" and reference links
- Check for "Last updated" dates

### Playwright Browser

Best for:
- Interactive content (SPAs, dynamic sites)
- Sites requiring JavaScript
- Taking screenshots for documentation
- Checking current state of live systems

Tips:
- Use when WebFetch fails to get content
- Good for checking current pricing, features
- Capture screenshots for evidence

### Context7 / Documentation MCPs

Best for:
- Official library/framework documentation
- API references
- Code examples from docs

Tips:
- Use `resolve-library-id` first
- Query with specific technical terms
- Good for "how to" questions about libraries

### Codebase Search (Grep/Glob/Read)

Best for:
- Finding existing implementations
- Understanding how something works in practice
- Researching patterns in open source

Tips:
- Search for function/class names
- Look at tests for usage examples
- Check commit history for context

## Multi-Source Verification Strategy

For important claims, use this verification ladder:

```
Level 1: Find initial source
    ↓
Level 2: Find independent corroboration (different author/org)
    ↓
Level 3: Check primary source (if secondary source cited one)
    ↓
Level 4: Look for contradicting evidence
    ↓
Level 5: Assess why sources agree or disagree
```

## Search Debugging

When searches aren't finding good results:

| Problem | Solution |
|---------|----------|
| Too many irrelevant results | Add specific terms, use quotes, try site: |
| Too few results | Remove terms, try synonyms, broaden scope |
| Results are outdated | Add year, use "after:" operator |
| Results are too basic | Add "advanced" or specific technical terms |
| Results are too advanced | Add "introduction" or "beginner" or "explained" |
| Wrong domain context | Add domain-specific terms (e.g., "programming" vs "statistics") |

## Recording Search Process

Document your search journey:

```markdown
## Search Log

### Query 1: "[initial query]"
- Results: [X useful, Y total]
- Useful sources found: [list]
- New terms discovered: [terminology to add to future queries]

### Query 2: "[refined query]"
- Results: [X useful, Y total]
- Useful sources found: [list]
- Conflicts with previous: [any contradictions]

### Query 3: "[verification query]"
- Purpose: Verify claim about [X]
- Result: Confirmed/Refuted/Unclear
```
