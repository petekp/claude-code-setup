# When to Mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes; prefer a real or in-memory test database when cheap)
- Time/randomness
- File system (sometimes)

Prefer a fake, fixture, or real lightweight dependency before building a tower of
stubs.

Do not mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

If mocking your own module feels necessary, treat that as a design smell. Improve
the seam instead.

## Designing for Mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally:

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each mock returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint

## Prefer These Rewrites

- Replace deep mock trees with a single fake at the boundary
- Replace mock-heavy unit tests with an integration test through the module's
  public API
- Replace global patching with explicit dependency injection

The test should stay focused on behavior. The mock should only make the boundary
deterministic.
