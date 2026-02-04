# Experiment Design Patterns

## Experiment Checklist

Before creating an experiment:

1. **Hypothesis**: "If we [change], then [metric] will [improve/decrease] by [amount] because [reason]"
2. **Primary metric**: One metric that defines success
3. **Guardrail metrics**: Metrics that should NOT degrade
4. **Sample size**: Use PostHog's MDE calculator (default 30% is reasonable)
5. **Duration**: Plan for at least 1-2 weeks minimum

## Common Experiment Types

### Conversion Optimization

**Goal**: Increase signup, purchase, or activation rates

```
Hypothesis: Simplifying the signup form will increase conversions
Primary metric: Funnel (signup_start → signup_complete)
Guardrail: Account quality (% completing onboarding)
```

**Setup with MCP:**
```
1. feature-flag-get-all (check for existing flags)
2. experiment-create:
   - feature_flag_key: "simple-signup-form"
   - primary_metrics: [{
       metric_type: "funnel",
       funnel_steps: ["signup_start", "signup_complete"]
     }]
   - secondary_metrics: [{
       metric_type: "funnel",
       funnel_steps: ["signup_complete", "onboarding_complete"]
     }]
```

### Engagement Experiments

**Goal**: Increase feature usage, session depth, or return visits

```
Hypothesis: Adding tooltips will increase feature discovery
Primary metric: Trend (feature_used events per user)
Guardrail: Task completion rate
```

### Pricing Experiments

**Goal**: Optimize pricing page conversion or plan selection

```
Hypothesis: Highlighting annual pricing will increase annual subscriptions
Primary metric: Funnel (pricing_page → annual_subscription)
Guardrail: Total conversion rate (any subscription)
```

## Metric Configuration

### Funnel Metrics (Conversion)

```json
{
  "metric_type": "funnel",
  "event_name": "first_step_event",
  "funnel_steps": ["step_1", "step_2", "step_3"]
}
```

Use for: Conversion rates, multi-step flows, onboarding completion

### Mean Metrics (Averages)

```json
{
  "metric_type": "mean",
  "event_name": "event_to_measure"
}
```

Use for: Average revenue, session duration, events per user

## Variant Configuration

### Standard A/B Test

```json
"variants": [
  {"key": "control", "rollout_percentage": 50},
  {"key": "test", "rollout_percentage": 50}
]
```

### Multi-Variant Test

```json
"variants": [
  {"key": "control", "rollout_percentage": 34},
  {"key": "variant_a", "rollout_percentage": 33},
  {"key": "variant_b", "rollout_percentage": 33}
]
```

### Holdout Test

Use `holdout_id` to exclude users already in another experiment.

## Interpreting Results

Use `experiment-results-get` to check:

1. **Statistical significance**: Is p-value < 0.05?
2. **Effect size**: Is the lift meaningful for the business?
3. **Consistency**: Do all segments show similar effects?
4. **Guardrails**: Are secondary metrics stable?

**Decision Framework:**
- Significant positive lift + stable guardrails → Ship it
- Significant negative lift → Don't ship, investigate
- Not significant after adequate sample → No clear winner, consider other factors
- Guardrails degraded → Don't ship even if primary metric improved

## Common Pitfalls

1. **Peeking too early**: Wait for adequate sample size
2. **Too many variants**: Dilutes statistical power
3. **Wrong metric**: Proxy metrics may not reflect real value
4. **Ignoring segments**: Overall results may hide segment differences
5. **Novelty effects**: New things get attention; measure long-term
