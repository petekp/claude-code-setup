# SaaS Analytics Playbook

## The SaaS Metrics Hierarchy

### North Star Metric

Identify one metric that best captures value delivered to customers:
- **Collaboration tools**: Weekly active collaborators
- **Developer tools**: Deployments/builds per week
- **Content platforms**: Content created or consumed
- **Marketplaces**: Transactions completed

Query pattern:
```json
{
  "kind": "TrendsQuery",
  "dateRange": {"date_from": "-90d"},
  "interval": "week",
  "series": [{
    "kind": "EventsNode",
    "event": "north_star_event",
    "math": "weekly_active"
  }]
}
```

### Acquisition Metrics

| Metric | How to Measure |
|--------|----------------|
| Traffic | `$pageview` trends |
| Signups | `signup_completed` count |
| Signup Rate | Funnel: landing → signup |
| Source Attribution | Breakdown by `utm_source` or `$referring_domain` |

### Activation Metrics

Define "activated" based on when users first experience core value:

**Common Activation Events:**
- Completed onboarding
- Created first [thing]
- Invited team member
- Connected integration
- Used core feature X times

**Activation Funnel:**
```json
{
  "kind": "FunnelsQuery",
  "series": [
    {"event": "signup_completed", "custom_name": "Signed Up"},
    {"event": "onboarding_step_1", "custom_name": "Started Onboarding"},
    {"event": "first_value_action", "custom_name": "Activated"}
  ],
  "funnelsFilter": {
    "funnelWindowInterval": 7,
    "funnelWindowIntervalUnit": "day"
  }
}
```

### Retention Metrics

**Cohort Retention Analysis:**
- Week 1 retention: Baseline engagement
- Week 4 retention: Product stickiness
- Week 12 retention: Long-term value

**Warning Signs:**
- W1 retention < 40%: Activation problem
- Steep drop W1→W4: Feature depth problem
- Flat but low curve: Growth problem

### Revenue Metrics

| Metric | Calculation |
|--------|-------------|
| Trial Conversion | Funnel: trial_start → subscription_created |
| Upgrade Rate | Funnel: subscription_created → plan_upgraded |
| Expansion Revenue | Trend: upgrade/addon events |

## Diagnostic Frameworks

### Drop-Off Diagnosis

When funnel conversion drops:

1. **Segment the drop**: Break down by user property (plan, source, device)
2. **Time the drop**: When did it start? Correlate with releases
3. **Locate the drop**: Which funnel step has the biggest loss?
4. **Investigate errors**: `list-errors` around the problem area

### Retention Diagnosis

When retention declines:

1. **Cohort comparison**: Are recent cohorts worse than older ones?
2. **Segment analysis**: Which user types are churning?
3. **Feature correlation**: Do retained users use specific features?
4. **Error impact**: Are errors affecting key user journeys?

### Growth Diagnosis

When growth slows:

1. **Acquisition check**: Are signups declining or stable?
2. **Activation check**: Is signup→activated conversion dropping?
3. **Referral check**: Are viral loops (invites, shares) working?
4. **Market check**: Breakdown by source—which channels are declining?

## Dashboard Templates

### Executive Dashboard

Create with these insights:
1. WAU trend (90 days)
2. Signup trend (30 days)
3. Activation rate (30 days, funnel)
4. W4 retention (cohort)
5. Trial conversion (funnel)

### Product Health Dashboard

1. Feature usage breakdown (top 10 features)
2. Session depth (events per session)
3. Error rate trend
4. Core flow completion (main funnel)
5. Power user % (users with >X events/week)

### Growth Dashboard

1. Signup funnel (landing → signup)
2. Activation funnel (signup → activated)
3. Traffic by source
4. Viral coefficient (invites sent / invites accepted)
5. Payback indicators

## Alert Thresholds

Set up monitoring for:

| Metric | Yellow Alert | Red Alert |
|--------|-------------|-----------|
| DAU | -10% WoW | -20% WoW |
| Activation Rate | -5% from baseline | -10% from baseline |
| Error Rate | >1% of sessions | >5% of sessions |
| Core Funnel | -10% conversion | -20% conversion |

## Common Queries

### DAU/WAU/MAU Trend

```json
{
  "kind": "TrendsQuery",
  "dateRange": {"date_from": "-90d"},
  "interval": "day",
  "series": [
    {"event": "$pageview", "math": "dau", "custom_name": "DAU"},
    {"event": "$pageview", "math": "weekly_active", "custom_name": "WAU"}
  ]
}
```

### Feature Adoption Matrix

```json
{
  "kind": "TrendsQuery",
  "dateRange": {"date_from": "-30d"},
  "series": [
    {"event": "feature_a_used", "math": "dau", "custom_name": "Feature A"},
    {"event": "feature_b_used", "math": "dau", "custom_name": "Feature B"},
    {"event": "feature_c_used", "math": "dau", "custom_name": "Feature C"}
  ]
}
```

### User Segmentation

```json
{
  "kind": "TrendsQuery",
  "dateRange": {"date_from": "-30d"},
  "series": [{"event": "$pageview", "math": "dau"}],
  "breakdownFilter": {
    "breakdown": "plan_type",
    "breakdown_type": "person"
  }
}
```
