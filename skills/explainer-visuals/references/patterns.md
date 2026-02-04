# Visual Patterns Reference

Implementation patterns for common explainer visual types.

## Table of Contents

1. [Morphing Shape Transitions](#morphing-shape-transitions)
2. [Scroll-Driven Storytelling](#scroll-driven-storytelling)
3. [Interactive Slider Diagrams](#interactive-slider-diagrams)
4. [Step-Through Animations](#step-through-animations)
5. [Force-Directed Graphs](#force-directed-graphs)
6. [Unit/Waffle Charts](#unitwaffle-charts)
7. [Metaphor Diagrams](#metaphor-diagrams)
8. [Comparison Panels](#comparison-panels)

---

## Morphing Shape Transitions

Best for: Transformation, before/after, identity change

### CSS-Only Morph (Simple Shapes)

```html
<div class="morph-container">
  <div class="shape" id="morphShape"></div>
  <button class="morph-trigger">Transform</button>
</div>

<style>
.shape {
  width: 120px;
  height: 120px;
  background: var(--accent);
  border-radius: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.shape.morphed {
  border-radius: 50%;
  transform: rotate(180deg) scale(0.8);
  background: var(--cat-2);
}
</style>

<script>
document.querySelector('.morph-trigger').addEventListener('click', () => {
  document.getElementById('morphShape').classList.toggle('morphed');
});
</script>
```

### SVG Path Morph (Complex Shapes)

Requires GSAP MorphSVG or flubber.js for path interpolation:

```html
<svg viewBox="0 0 200 200">
  <path id="morphPath" d="M100,10 L190,190 L10,190 Z" fill="var(--accent)"/>
</svg>

<script src="https://cdnjs.cloudflare.com/ajax/libs/flubber/0.4.2/flubber.min.js"></script>
<script>
const triangle = "M100,10 L190,190 L10,190 Z";
const circle = "M100,10 A90,90 0 1,1 99.9,10 Z";

const interpolator = flubber.interpolate(triangle, circle);
const path = document.getElementById('morphPath');

function animate(progress) {
  path.setAttribute('d', interpolator(progress));
}

// Connect to scrubber or button
</script>
```

---

## Scroll-Driven Storytelling

Best for: Sequential revelation, narrative flow, long-form explanation

### Intersection Observer Pattern

```html
<div class="scroll-story">
  <section class="story-section" data-step="1">
    <div class="visual-panel">
      <div class="visual-element" id="el1"></div>
    </div>
    <div class="text-panel">
      <p>First, we start with a single element...</p>
    </div>
  </section>

  <section class="story-section" data-step="2">
    <div class="visual-panel">
      <div class="visual-element" id="el2"></div>
    </div>
    <div class="text-panel">
      <p>Then connections form between elements...</p>
    </div>
  </section>
</div>

<style>
.scroll-story {
  --panel-height: 100vh;
}

.story-section {
  min-height: var(--panel-height);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.visual-panel {
  position: sticky;
  top: 20vh;
  height: 60vh;
}

.visual-element {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.story-section.active .visual-element {
  opacity: 1;
  transform: translateY(0);
}
</style>

<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Trigger step-specific animations
      const step = entry.target.dataset.step;
      animateStep(step);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.story-section').forEach(section => {
  observer.observe(section);
});

function animateStep(step) {
  // Custom logic per step
}
</script>
```

---

## Interactive Slider Diagrams

Best for: Trade-offs, spectrums, cause-effect relationships

### Range Slider with Visual Response

```html
<div class="slider-diagram">
  <div class="visual-area">
    <div class="bar bar-a" style="--value: 50"></div>
    <div class="bar bar-b" style="--value: 50"></div>
  </div>

  <div class="control-area">
    <label>
      <span class="label-left">Speed</span>
      <input type="range" min="0" max="100" value="50" id="tradeoffSlider">
      <span class="label-right">Quality</span>
    </label>
  </div>
</div>

<style>
.visual-area {
  display: flex;
  justify-content: center;
  gap: 2rem;
  height: 200px;
  align-items: flex-end;
}

.bar {
  width: 60px;
  height: calc(var(--value) * 1.8px);
  transition: height 0.3s ease;
  border-radius: 4px 4px 0 0;
}

.bar-a { background: var(--cat-1); }
.bar-b { background: var(--cat-2); }

.control-area {
  margin-top: 2rem;
  text-align: center;
}

input[type="range"] {
  width: 200px;
  margin: 0 1rem;
}
</style>

<script>
const slider = document.getElementById('tradeoffSlider');
const barA = document.querySelector('.bar-a');
const barB = document.querySelector('.bar-b');

slider.addEventListener('input', (e) => {
  const value = e.target.value;
  barA.style.setProperty('--value', value);
  barB.style.setProperty('--value', 100 - value);
});
</script>
```

---

## Step-Through Animations

Best for: Processes, algorithms, sequential operations

### Controlled Step Animation

```html
<div class="step-animation">
  <div class="stage">
    <div class="step-visual" data-visible-at="1">Step 1 content</div>
    <div class="step-visual" data-visible-at="2">Step 2 content</div>
    <div class="step-visual" data-visible-at="3">Step 3 content</div>
  </div>

  <div class="controls">
    <button id="prevStep" disabled>← Previous</button>
    <span class="step-indicator">Step <span id="currentStep">1</span> of 3</span>
    <button id="nextStep">Next →</button>
  </div>

  <div class="step-description" id="stepDesc">
    First, we initialize the process...
  </div>
</div>

<style>
.stage {
  position: relative;
  height: 300px;
}

.step-visual {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.4s ease;
  pointer-events: none;
}

.step-visual.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<script>
const descriptions = [
  "First, we initialize the process...",
  "Then, the data flows through the transformer...",
  "Finally, the output emerges transformed."
];

let currentStep = 1;
const totalSteps = 3;

function updateStep(step) {
  currentStep = step;

  // Update visuals
  document.querySelectorAll('.step-visual').forEach(el => {
    el.classList.toggle('active', el.dataset.visibleAt == step);
  });

  // Update indicator
  document.getElementById('currentStep').textContent = step;
  document.getElementById('stepDesc').textContent = descriptions[step - 1];

  // Update buttons
  document.getElementById('prevStep').disabled = step === 1;
  document.getElementById('nextStep').disabled = step === totalSteps;
}

document.getElementById('prevStep').addEventListener('click', () => {
  if (currentStep > 1) updateStep(currentStep - 1);
});

document.getElementById('nextStep').addEventListener('click', () => {
  if (currentStep < totalSteps) updateStep(currentStep + 1);
});

// Initialize
updateStep(1);
</script>
```

---

## Force-Directed Graphs

Best for: Relationships, networks, emergent structure

Requires D3.js:

```html
<div id="forceGraph"></div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
const data = {
  nodes: [
    { id: "A", group: 1 },
    { id: "B", group: 1 },
    { id: "C", group: 2 },
    { id: "D", group: 2 }
  ],
  links: [
    { source: "A", target: "B", value: 1 },
    { source: "B", target: "C", value: 2 },
    { source: "C", target: "D", value: 1 },
    { source: "D", target: "A", value: 3 }
  ]
};

const width = 600, height = 400;

const svg = d3.select("#forceGraph")
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
  .selectAll("line")
  .data(data.links)
  .join("line")
  .attr("stroke", "var(--ink-light)")
  .attr("stroke-width", d => Math.sqrt(d.value));

const node = svg.append("g")
  .selectAll("circle")
  .data(data.nodes)
  .join("circle")
  .attr("r", 20)
  .attr("fill", d => d.group === 1 ? "var(--cat-1)" : "var(--cat-2)")
  .call(drag(simulation));

const label = svg.append("g")
  .selectAll("text")
  .data(data.nodes)
  .join("text")
  .text(d => d.id)
  .attr("text-anchor", "middle")
  .attr("dy", "0.35em")
  .attr("fill", "white")
  .style("pointer-events", "none");

simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  label
    .attr("x", d => d.x)
    .attr("y", d => d.y);
});

function drag(simulation) {
  return d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x; d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    });
}
</script>
```

---

## Unit/Waffle Charts

Best for: Proportions, making large numbers tangible

### Animated Unit Chart

```html
<div class="unit-chart" id="unitChart">
  <!-- 100 units generated by JS -->
</div>
<div class="unit-legend">
  <span class="legend-item"><span class="swatch active"></span> Active (73%)</span>
  <span class="legend-item"><span class="swatch inactive"></span> Inactive (27%)</span>
</div>

<style>
.unit-chart {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-width: 300px;
}

.unit {
  aspect-ratio: 1;
  background: var(--ground-alt);
  border-radius: 2px;
  transition: background 0.3s ease, transform 0.3s ease;
}

.unit.filled {
  background: var(--accent);
  transform: scale(1.05);
}

.unit-legend {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 0.5rem;
}

.swatch.active { background: var(--accent); }
.swatch.inactive { background: var(--ground-alt); }
</style>

<script>
const chart = document.getElementById('unitChart');
const filledCount = 73;

// Create 100 units
for (let i = 0; i < 100; i++) {
  const unit = document.createElement('div');
  unit.className = 'unit';
  unit.dataset.index = i;
  chart.appendChild(unit);
}

// Animate filling
const units = document.querySelectorAll('.unit');
units.forEach((unit, i) => {
  if (i < filledCount) {
    setTimeout(() => {
      unit.classList.add('filled');
    }, i * 20); // Staggered animation
  }
});
</script>
```

---

## Metaphor Diagrams

Best for: Abstract concepts, mental models, making unfamiliar familiar

### Iceberg Diagram (Hidden Complexity)

```html
<div class="iceberg">
  <div class="water-line"></div>
  <div class="above-water">
    <div class="tip">What people see</div>
  </div>
  <div class="below-water">
    <div class="layer" style="--depth: 1">Research</div>
    <div class="layer" style="--depth: 2">Failed attempts</div>
    <div class="layer" style="--depth: 3">Years of practice</div>
    <div class="layer" style="--depth: 4">Foundational knowledge</div>
  </div>
</div>

<style>
.iceberg {
  position: relative;
  height: 400px;
  background: linear-gradient(
    to bottom,
    var(--ground) 0%,
    var(--ground) 25%,
    #e3f2fd 25%,
    #bbdefb 100%
  );
  overflow: hidden;
}

.water-line {
  position: absolute;
  top: 25%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--cat-1);
}

.above-water {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.tip {
  background: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-weight: 600;
}

.below-water {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.layer {
  background: rgba(255,255,255,0.9);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  opacity: 0;
  transform: translateY(20px);
  animation: emerge 0.5s ease forwards;
  animation-delay: calc(var(--depth) * 0.2s);
}

@keyframes emerge {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

---

## Comparison Panels

Best for: Side-by-side analysis, showing differences

### Synchronized Comparison

```html
<div class="comparison">
  <div class="panel panel-a">
    <h3>Before</h3>
    <div class="comparison-content">
      <div class="item" data-pair="1">Old approach</div>
      <div class="item" data-pair="2">Complex process</div>
      <div class="item" data-pair="3">Manual steps</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="panel panel-b">
    <h3>After</h3>
    <div class="comparison-content">
      <div class="item" data-pair="1">New approach</div>
      <div class="item" data-pair="2">Simplified</div>
      <div class="item" data-pair="3">Automated</div>
    </div>
  </div>
</div>

<style>
.comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
}

.divider {
  width: 2px;
  background: var(--ground-alt);
}

.panel h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--ink-light);
}

.item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.panel-a .item {
  background: #ffebee;
  border-left: 3px solid var(--cat-3);
}

.panel-b .item {
  background: #e8f5e9;
  border-left: 3px solid var(--cat-5);
}

.item.highlighted {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>

<script>
// Highlight corresponding items on hover
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const pair = item.dataset.pair;
    document.querySelectorAll(`[data-pair="${pair}"]`).forEach(el => {
      el.classList.add('highlighted');
    });
  });

  item.addEventListener('mouseleave', () => {
    document.querySelectorAll('.item').forEach(el => {
      el.classList.remove('highlighted');
    });
  });
});
</script>
```

---

## Animation Utilities

### Staggered Entrance

```javascript
function staggerEntrance(selector, delayMs = 50) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.4s ease';

    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * delayMs);
  });
}
```

### Number Counter Animation

```javascript
function animateNumber(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
```

### Typewriter Effect

```javascript
function typewriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}
```
