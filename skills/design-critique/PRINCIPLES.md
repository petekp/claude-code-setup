# Design Critique Principles

Deep reference material for interface critique. See SKILL.md for the lean critique process and output contract.

## The Critique Lens

### What We're Looking For
- Does it feel inevitable? Like it couldn't be any other way?
- Does it get out of the way of what the user is trying to do?
- Would we be proud to ship this?
- Does every pixel earn its place?

### What Kills a Design
- Unnecessary complexity
- Inconsistency with itself or the platform
- Decoration that doesn't serve function
- Confusion about what's interactive
- Making the user think when they shouldn't have to

### The Question Behind Every Question
- "Why is this here?"
- If you can't answer clearly, it shouldn't be.

## Core Principles

### Clarity
The interface should be obvious.

**What we look for:**
- Can you tell what something does before you tap it?
- Is the hierarchy of information clear?
- Do icons communicate or decorate?
- Is text actually readable, or did you sacrifice legibility for aesthetics?

**Common failures:**
- Mystery icons without labels
- Competing visual hierarchies
- Text that's too small, too light, or too clever
- Relying on color alone to communicate

### Deference
The content is the hero. The interface serves it.

**What we look for:**
- Does the UI step back for the user's content?
- Are controls visible when needed, hidden when not?
- Is the interface competing with what the user came to see?
- Does it feel like a container or a distraction?

**Common failures:**
- Chrome that dominates the content
- Persistent UI that should be contextual
- Decoration that draws the eye away from what matters
- Showing off the interface instead of the content

### Depth
Visual and interactive layers that make sense.

**What we look for:**
- Do layers communicate relationship and hierarchy?
- Does motion feel physical and meaningful?
- Are elements appropriately elevated or recessed?
- Does depth clarify or just decorate?

**Common failures:**
- Flat when depth would clarify
- Shadows and elevations that don't mean anything
- Motion that distracts rather than orients
- Inconsistent use of the z-axis

## The Details

### Typography
Typography is not decoration. It's the interface.

**Critique points:**
- Is the type hierarchy doing real work?
- Are sizes and weights meaningfully differentiated?
- Is line length appropriate for reading?
- Does it use the system font, or justify the deviation?
- Is Dynamic Type supported? (If not, why not?)

**Red flags:**
- More than 2-3 type sizes on screen
- Weights that don't create clear hierarchy
- Custom fonts without clear purpose
- All caps where sentence case would work
- Text that doesn't respond to accessibility settings

### Spacing & Alignment
Spacing communicates relationship. Sloppiness breaks trust.

**Critique points:**
- Is spacing systematic or arbitrary?
- Do elements that belong together look like they belong together?
- Is there a consistent grid or rhythm?
- Does the eye flow naturally?

**Red flags:**
- Inconsistent margins between similar elements
- Misalignment that feels accidental
- Crowded layouts that create anxiety
- Spacing that changes for no reason

### Color
Color should work, not just look.

**Critique points:**
- Does color communicate meaning?
- Is there a clear, limited palette?
- Does it work in light and dark mode?
- Does it work for colorblind users?
- Is contrast sufficient for readability?

**Red flags:**
- Semantic color used decoratively (red when nothing is wrong)
- Too many colors competing for attention
- Colors that look different in different contexts
- Tint colors that clash with content
- Color as the only differentiator

### Icons
An icon should be instantly understood or not used.

**Critique points:**
- Would a user know what this does without a label?
- Is it consistent with system iconography?
- Does it scale well to different sizes?
- Is the metaphor clear or clever?

**Red flags:**
- Icons that require explanation
- Inconsistent stroke weights or styles
- Metaphors that don't translate across cultures
- Novel icons when system icons exist
- Icon-only actions that should have labels

### Touch Targets
If it's tappable, it needs to be tappable.

**Critique points:**
- Is every target at least 44x44 points?
- Is there enough space between targets?
- Is the tappable area larger than the visible element?
- Can you tap it easily with a thumb?

**Red flags:**
- Tiny targets that require precision
- Targets too close together
- Visual element smaller than tap area with no indication
- Assuming stylus-level precision

## Interaction Patterns

### Navigation
The user should always know where they are and how to get back.

**Critique points:**
- Is the navigation model clear?
- Can the user always get back?
- Does the structure match the user's mental model?
- Is depth communicated through animation?

**Red flags:**
- Navigation that breaks the back gesture
- Unclear hierarchy (where am I?)
- Modal takeovers with no escape
- Losing state when navigating

### Feedback
Every action deserves acknowledgment.

**Critique points:**
- Does the interface respond immediately to touch?
- Is there feedback for every action?
- Are loading states clear and appropriate?
- Do errors explain what happened and what to do?

**Red flags:**
- Actions with no visual response
- Spinners with no context
- Errors that blame the user
- Success states that aren't visible

### Animation
Motion should orient, not entertain.

**Critique points:**
- Does animation help the user understand what happened?
- Is timing appropriate (not too fast, not too slow)?
- Does it respect reduced motion preferences?
- Is it consistent throughout the experience?

**Red flags:**
- Animation for its own sake
- Motion that slows down the interaction
- Jarring transitions
- Inconsistent easing or timing
- Ignoring accessibility preferences

### Gestures
Standard gestures must work as expected. Custom gestures must be discoverable.

**Critique points:**
- Do standard gestures (swipe back, pull to refresh) work?
- Are custom gestures discoverable without instruction?
- Is there always a visible alternative to gestures?
- Do gestures feel natural and physical?

**Red flags:**
- Hijacking system gestures
- Hidden gesture-only functionality
- Gestures that conflict with platform patterns
- Requiring a tutorial for basic interaction

## Platform Consistency

### System Integration
The app should feel like it belongs on the platform.

**Critique points:**
- Does it use system controls where appropriate?
- Does it respect system settings (text size, contrast, etc.)?
- Does it integrate with system features (share sheets, notifications)?
- Does it follow platform navigation patterns?

**Red flags:**
- Custom controls that reinvent system controls (worse)
- Ignoring Dynamic Type
- Custom sharing mechanisms when system sheets exist
- Non-standard navigation that fights muscle memory

### The Human Interface Guidelines
Not suggestions. Guidelines.

**Critique points:**
- Have the HIG been consulted for every major decision?
- Where we deviate, is there clear justification?
- Are we using new platform capabilities appropriately?
- Would this pass App Store review?

**Red flags:**
- Deviations without justification
- Outdated patterns when new ones exist
- Novel solutions to solved problems
- "Android does it this way"

## The Crit Process

### How to Give Feedback
- Be specific. Point to the exact element.
- Explain why, not just what.
- Reference principles, not preferences.
- Offer alternatives when possible.
- Distinguish blockers from suggestions.

### Categories of Feedback
1. **Blockers**: Cannot ship until fixed
2. **Strong recommendations**: Should fix unless compelling reason
3. **Suggestions**: Would improve but acceptable without
4. **Praise**: Call out what's working

### Questions to Ask
- "What is the user trying to do here?"
- "What's the most important thing on this screen?"
- "What would happen if we removed this?"
- "Is this the simplest way to achieve this?"
- "Would a new user understand this?"

### The Hardest Question
- "Are we proud of this?"
- If the answer isn't yes, don't ship it.

## Common Critique Notes

### "Too busy"
- Too many things competing for attention
- Unclear hierarchy
- Remove until the important things breathe

### "Not discoverable"
- Hidden functionality
- Unlabeled icons
- Gestures without visible affordance
- The user shouldn't have to guess

### "Inconsistent"
- Different patterns for similar actions
- Visual language that changes
- Behavior that surprises
- Pick a pattern and commit

### "Feels off"
- Something in the details isn't right
- Usually spacing, alignment, or timing
- The eye knows before the mind can articulate
- Trust the feeling, find the cause

### "Overdesigned"
- Trying too hard
- Every effect turned up to 11
- Decoration overwhelming function
- Subtract until it feels inevitable

## The Standard

### What "Good" Looks Like
- You don't notice the interface
- Everything is where you expect it
- Actions feel instant
- You never feel lost
- It adapts to you, not the reverse

### What "Great" Looks Like
- Moments of delight that don't get in the way
- Details you discover over time
- Feels like it was made just for you
- You can't imagine it being different
- You forget it's software

### The Bar
- "Would Apple ship this?"
- Not as flattery—as a standard
- The details matter
- The polish matters
- The user's time and attention are precious
- Earn every pixel
