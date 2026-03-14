# Durable Behavior Tests

A good test fails when behavior breaks and keeps passing through internal
refactors. A bad test is easy to satisfy without proving much.

## Aim for These Properties

- Test behavior callers or users care about
- Reach the code through a public or near-public seam
- Describe what happens, not how helpers cooperate
- Fail for the right reason
- Stay focused on one behavior, even if that behavior needs multiple assertions

## Rewrite Brittle Tests into Durable Ones

### Rewrite internal-call assertions into outcome assertions

```typescript
// Bad: proves collaboration details
test("checkout calls paymentService.process", async () => {
  const paymentService = { process: vi.fn().mockResolvedValue({ ok: true }) };

  await checkout(cart, paymentService);

  expect(paymentService.process).toHaveBeenCalledWith(cart.total);
});

// Better: proves observable behavior
test("checkout confirms a valid cart", async () => {
  const paymentService = { process: vi.fn().mockResolvedValue({ ok: true }) };

  const result = await checkout(cart, paymentService);

  expect(result.status).toBe("confirmed");
});
```

### Rewrite storage peeks into public read paths

```typescript
// Bad: bypasses the interface to verify behavior
test("createUser saves to the database", async () => {
  await createUser({ name: "Alice" });

  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);

  expect(row).toBeDefined();
});

// Better: proves the system behavior through its own API
test("createUser makes the user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);

  expect(retrieved.name).toBe("Alice");
});
```

### Rewrite broad repros into cheaper seams when possible

```typescript
// Expensive: only use a browser when the behavior truly lives there
test("user sees the discount applied at checkout", async () => {
  await page.goto("/checkout");
  await page.fill("[name=code]", "SPRING25");
  await page.click("text=Apply");

  await expect(page.getByText("$75.00")).toBeVisible();
});

// Cheaper: prove the pricing rule at the service boundary first
test("applyDiscount returns a discounted total for valid codes", async () => {
  const total = await applyDiscount({ subtotal: 100, code: "SPRING25" });

  expect(total).toBe(75);
});
```

## Use Characterization Tests When the Design Fights Back

When legacy code is hard to isolate, freeze current observable behavior at the
nearest stable seam first. That test buys safety for refactoring; it does not
mean the seam is ideal forever.

```typescript
test("legacy parser preserves repeated section order", () => {
  const input = loadFixture("repeated-sections.txt");

  expect(parseLegacyConfig(input)).toEqual([
    { name: "alpha" },
    { name: "alpha" },
    { name: "beta" },
  ]);
});
```

Refactor behind the characterization test until a better seam exists, then add
more targeted behavioral coverage where it pays off.
