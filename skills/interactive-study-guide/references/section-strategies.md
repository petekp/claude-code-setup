# Section Visualization Strategies

Detailed implementation patterns for transforming each study guide section into its interactive counterpart. Each entry includes the content model, layout approach, and working code patterns.

---

## 1. Purpose (Hero Section)

**Content model:** Problem statement, approach description, user perspective.

**Layout:** Full-viewport-height hero with centered content. No sidebar navigation visible in this section — it's the opening statement.

**Implementation:**

```html
<section class="section section--hero" id="purpose">
  <div class="hero__content">
    <p class="hero__label">A Study Guide</p>
    <h1 class="hero__title">[Project Name]</h1>
    <div class="hero__divider"></div>
    <blockquote class="hero__problem">
      <p>[The problem statement — extracted from "The problem:" field]</p>
    </blockquote>
    <p class="hero__approach">[The approach — extracted from "The approach:" field]</p>
  </div>
  <div class="hero__scroll-hint">
    <span>Scroll to begin</span>
  </div>
</section>
```

**Animation:** Elements fade in sequentially on page load with staggered delays:
1. Label (200ms)
2. Title (400ms)
3. Divider grows from center (600ms)
4. Problem quote (800ms)
5. Approach text (1000ms)
6. Scroll hint pulses gently after all text is visible

```javascript
function animateHero() {
  const elements = document.querySelectorAll('.hero__content > *');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + i * 200);
  });
}
```

**Key decisions:**
- Use blockquote for the problem statement — gives it visual weight with a left border
- The "before continuing" self-test prompt from the markdown becomes a subtle note below the fold, not part of the hero

---

## 2. Threshold Concepts (Expandable Cards)

**Content model:** 2-3 named concepts, each with explanation paragraphs and a "you'll see this in" list of file paths.

**Layout:** Vertical stack of cards. Each card starts collapsed showing only the concept name as a large heading. Click/tap expands to reveal the full explanation.

**Implementation:**

```html
<section class="section" id="big-ideas">
  <header class="section__header">
    <h2 class="section__title">The Big Ideas</h2>
    <p class="section__subtitle">The concepts that, once understood, make the rest click.</p>
  </header>

  <div class="concepts">
    <article class="concept-card" data-concept="1">
      <button class="concept-card__header" aria-expanded="false">
        <h3 class="concept-card__name">[Concept Name]</h3>
        <span class="concept-card__toggle" aria-hidden="true">+</span>
      </button>
      <div class="concept-card__body" hidden>
        <div class="concept-card__explanation">
          [Explanation paragraphs as HTML]
        </div>
        <div class="concept-card__locations">
          <p class="concept-card__locations-label">You'll see this in:</p>
          <div class="concept-card__pills">
            <code class="pill">[file/path.ts]</code>
            <code class="pill">[file/other.ts]</code>
          </div>
        </div>
      </div>
    </article>
  </div>

  <aside class="self-test">
    <p><strong>Self-test:</strong> Close this guide and explain each big idea in your own words.</p>
  </aside>
</section>
```

**Animation:** Use CSS grid-template-rows for smooth expand/collapse:

```css
.concept-card__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease;
}

.concept-card__body.expanded {
  grid-template-rows: 1fr;
}

.concept-card__body > div {
  overflow: hidden;
}
```

```javascript
document.querySelectorAll('.concept-card__header').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isExpanded));
    body.classList.toggle('expanded');
    body.hidden = false;
    btn.querySelector('.concept-card__toggle').textContent = isExpanded ? '+' : '\u2212';
  });
});
```

**Key decisions:**
- Cards start collapsed to embody progressive disclosure — the reader chooses their own depth
- File paths as pills with monospace font make them feel interactive and code-adjacent

---

## 3. System Map (Interactive D3 Graph)

**Content model:** A Mermaid graph TD diagram with nodes and edges, plus a table mapping systems to purpose and key files.

**Layout:** Full-width SVG canvas. Desktop: centered with hover tooltips. Mobile: horizontally scrollable.

**Parsing the Mermaid source:**

Extract nodes and edges from the Mermaid graph definition:

```javascript
function parseMermaidGraph(mermaidSource) {
  const nodes = new Map();
  const edges = [];

  const nodePattern = /(\w+)\[["']?([^\]"']+)["']?\]/g;
  let match;
  while ((match = nodePattern.exec(mermaidSource))) {
    nodes.set(match[1], { id: match[1], label: match[2] });
  }

  const edgePattern = /(\w+)\s*--?>?\|?"?([^"|]*)"?\|?\s*(\w+)/g;
  while ((match = edgePattern.exec(mermaidSource))) {
    edges.push({ source: match[1], target: match[3], label: match[2].trim() });
    if (!nodes.has(match[1])) nodes.set(match[1], { id: match[1], label: match[1] });
    if (!nodes.has(match[3])) nodes.set(match[3], { id: match[3], label: match[3] });
  }

  return { nodes: Array.from(nodes.values()), edges };
}
```

**D3 force-directed graph:**

```javascript
function createSystemMap(container, { nodes, edges }, systemTable) {
  const width = container.clientWidth;
  const height = Math.max(500, width * 0.6);

  const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('class', 'system-map__svg');

  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28).attr('refY', 0)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--ink-light)');

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(140))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50));

  const link = svg.append('g').attr('class', 'links')
    .selectAll('line').data(edges).join('line')
    .attr('stroke', 'var(--border)')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#arrowhead)');

  const linkLabel = svg.append('g').attr('class', 'link-labels')
    .selectAll('text').data(edges.filter(e => e.label)).join('text')
    .text(d => d.label)
    .attr('class', 'system-map__edge-label')
    .attr('text-anchor', 'middle');

  const node = svg.append('g').attr('class', 'nodes')
    .selectAll('g').data(nodes).join('g')
    .attr('class', 'system-map__node')
    .call(d3.drag()
      .on('start', (e, d) => {
        if (!e.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => {
        if (!e.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  node.append('circle').attr('r', 24)
    .attr('fill', 'var(--surface)')
    .attr('stroke', 'var(--ink)')
    .attr('stroke-width', 1.5);

  node.append('text').text(d => d.label)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('class', 'system-map__node-label');

  const tooltip = d3.select(container).append('div')
    .attr('class', 'system-map__tooltip')
    .style('opacity', 0);

  node.on('mouseenter', (e, d) => {
    const info = systemTable.find(s => s.name === d.label);
    if (info) {
      tooltip.html('<strong>' + d.label + '</strong><br>' + info.purpose + '<br><code>' + info.keyFiles + '</code>')
        .style('left', e.pageX + 12 + 'px')
        .style('top', e.pageY - 12 + 'px')
        .style('opacity', 1);
    }
  }).on('mouseleave', () => tooltip.style('opacity', 0));

  node.on('click', (e, d) => {
    const target = document.querySelector('[data-system="' + d.label + '"]');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    linkLabel.attr('x', d => (d.source.x + d.target.x) / 2)
             .attr('y', d => (d.source.y + d.target.y) / 2);
    node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
  });
}
```

**Key decisions:**
- Force-directed layout instead of static Mermaid renders the graph alive
- Draggable nodes invite exploration without requiring instruction
- Click-to-navigate connects the map to the deep dives

---

## 4. Request Walkthrough (Scroll-Driven Step-Through)

**Content model:** A named operation, a Mermaid sequence diagram, and multiple numbered steps each containing a code snippet with annotation.

**Layout:** Split panel: sticky diagram on the left (40% width), scrolling annotated steps on the right (60% width). As the reader scrolls through steps, the diagram highlights the active system.

**Implementation:**

```html
<section class="section section--walkthrough" id="walkthrough">
  <header class="section__header">
    <h2 class="section__title">Walking Through a Request</h2>
    <p class="section__subtitle">[Operation name]</p>
  </header>

  <div class="walkthrough__split">
    <div class="walkthrough__diagram">
      <svg id="walkthrough-diagram"></svg>
    </div>

    <div class="walkthrough__steps">
      <article class="walkthrough__step" data-step="1" data-system="SystemA">
        <div class="walkthrough__step-number">1</div>
        <h3 class="walkthrough__step-title">[Step title]</h3>
        <pre class="walkthrough__code"><code class="language-typescript">[code]</code></pre>
        <div class="walkthrough__annotation">
          <p>[Annotation explaining why, not just what]</p>
        </div>
      </article>
    </div>
  </div>
</section>
```

**Scroll-driven highlighting:**

```javascript
function initWalkthrough() {
  const steps = document.querySelectorAll('.walkthrough__step');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const systemName = entry.target.dataset.system;
        steps.forEach(s => s.classList.remove('active'));
        entry.target.classList.add('active');
        // Highlight corresponding system in diagram
        document.querySelectorAll('.system-map__node').forEach(n => {
          const label = n.querySelector('text');
          n.classList.toggle('highlighted',
            label && label.textContent === systemName);
        });
      }
    });
  }, { rootMargin: '-30% 0px -30% 0px' });

  steps.forEach(step => observer.observe(step));
}
```

**Code block treatment:** Use Prism.js for syntax highlighting. Apply line-by-line reveal animation when a step enters view:

```css
.walkthrough__step .walkthrough__code {
  opacity: 0.4;
  transition: opacity 0.4s ease;
}

.walkthrough__step.active .walkthrough__code {
  opacity: 1;
}
```

**Key decisions:**
- The sticky diagram is the anchor providing spatial orientation while the reader moves through temporal steps
- Highlighting the active system closes the cognitive gap between code and architecture
- Steps are dimmed when not active to focus attention on the current step

---

## 5. System Deep Dives (Tabbed Panels)

**Content model:** Multiple subsections, each with purpose, pattern name, abstractions table, interfaces, design tradeoff, elaborative interrogation prompt, and exploration task.

**Layout:** Horizontal tab bar at the top. Clicking a tab reveals that system's deep dive content.

**Implementation:**

```html
<section class="section" id="deep-dives">
  <header class="section__header">
    <h2 class="section__title">System Deep Dives</h2>
  </header>

  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" aria-selected="true" data-tab="system-a">System A</button>
    <button class="tab" role="tab" aria-selected="false" data-tab="system-b">System B</button>
  </div>

  <div class="tab-panels">
    <div class="tab-panel active" role="tabpanel" id="system-a" data-system="System A">
      <div class="deep-dive__purpose">
        <h3>[System Name]</h3>
        <p>[Purpose text]</p>
      </div>

      <div class="deep-dive__pattern">
        <span class="badge badge--pattern">[Pattern Name]</span>
        <a href="[link]" class="deep-dive__pattern-link">Learn more</a>
      </div>

      <table class="deep-dive__abstractions">
        <thead><tr><th>Abstraction</th><th>Role</th><th>Location</th></tr></thead>
        <tbody></tbody>
      </table>

      <aside class="callout callout--think">
        <h4>Why this way?</h4>
        <p>[Elaborative interrogation prompt]</p>
      </aside>

      <aside class="callout callout--explore">
        <h4>Explore</h4>
        <p>[PRIMM-style exploration task]</p>
      </aside>
    </div>
  </div>
</section>
```

**Tab switching:**

```javascript
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});
```

**Key decisions:**
- Tabs prevent information overload — the reader sees one system at a time
- "Why this way?" callouts use a distinct visual treatment (left border, warm background) to signal reflection, not information
- Exploration tasks are visually separate from content

---

## 6. Patterns (Searchable Card Grid)

**Content model:** Named patterns with description, locations, and rationale. Plus a naming conventions table.

**Layout:** Search/filter bar at top. Responsive card grid (2-3 columns desktop, 1 mobile). Naming conventions table below.

**Implementation:**

```html
<section class="section" id="patterns">
  <header class="section__header">
    <h2 class="section__title">Patterns & Conventions</h2>
    <p class="section__subtitle">Recognizing these is the difference between reading code and understanding it.</p>
  </header>

  <div class="patterns__search">
    <input type="search" placeholder="Filter patterns..." class="search-input" id="patternSearch">
  </div>

  <div class="patterns__grid">
    <article class="pattern-card" data-name="[pattern-name-lowercase]">
      <h3 class="pattern-card__name">[Pattern Name]</h3>
      <p class="pattern-card__description">[What it is]</p>
      <div class="pattern-card__locations">
        <code class="pill">[location]</code>
      </div>
      <p class="pattern-card__rationale">[Why it's used here]</p>
      <a class="pattern-card__link" href="[link]">Learn more</a>
    </article>
  </div>
</section>
```

**Filtering:**

```javascript
document.getElementById('patternSearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.pattern-card').forEach(card => {
    const matches = card.dataset.name.includes(query) ||
                    card.textContent.toLowerCase().includes(query);
    card.style.display = matches ? '' : 'none';
  });
});
```

---

## 7. Boundaries (Expandable Table)

**Content model:** Table of external systems with purpose, integration point, and pattern. Error handling philosophy.

**Layout:** Clean table with click-to-expand rows. Error handling philosophy as styled prose below.

```javascript
document.querySelectorAll('.boundaries-table tbody tr').forEach(row => {
  row.addEventListener('click', () => {
    row.classList.toggle('expanded');
    const detail = row.querySelector('.row-detail');
    if (detail) detail.hidden = !detail.hidden;
  });
});
```

---

## 8. Testing (Styled Prose with Interactive Callout)

**Content model:** Test structure, what to read first, exploration prompt.

**Layout:** Standard editorial prose. Exploration prompt in an interactive callout with "reveal hint" toggle.

```html
<aside class="callout callout--explore">
  <h4>Explore</h4>
  <p>[Exploration prompt]</p>
  <button class="hint-toggle">Show hint</button>
  <div class="hint" hidden>
    <p>[Hint text]</p>
  </div>
</aside>
```

---

## 9. Next Steps (Interactive Checklist)

**Content model:** Checklist items grouped by day.

**Layout:** Progress bar at top showing overall completion. Days as labeled groups. Checkboxes with localStorage persistence.

**Implementation:**

```javascript
const STORAGE_KEY = 'study-guide-progress';

function initChecklist() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  document.querySelectorAll('.checklist__item input[type="checkbox"]').forEach(cb => {
    const id = cb.id;
    if (saved[id]) cb.checked = true;

    cb.addEventListener('change', () => {
      saved[id] = cb.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      updateProgress();
    });
  });
}

function updateProgress() {
  const total = document.querySelectorAll('.checklist__item input').length;
  const checked = document.querySelectorAll('.checklist__item input:checked').length;
  const pct = Math.round((checked / total) * 100);
  document.querySelector('.progress__fill').style.width = pct + '%';
  document.querySelector('.progress__label').textContent = pct + '% complete';
}
```

---

## Navigation System

### Scroll-Spy Sidebar

```javascript
function initScrollSpy() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active',
            link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
}
```

### Reading Progress Bar

```javascript
function initProgressBar() {
  const bar = document.querySelector('.reading-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}
```

### Section Entrance Animations

```javascript
function initSectionAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(s => observer.observe(s));
}
```

```css
.section {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .section {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```
