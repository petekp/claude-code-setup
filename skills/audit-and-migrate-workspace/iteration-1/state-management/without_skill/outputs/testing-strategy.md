# Testing Strategy for State Management Migration

This document covers how to test during migration, what to test, and how to structure tests in the new Zustand world.

---

## Testing Philosophy

The migration should not change any user-visible behavior. Tests should verify behavior, not implementation. This means:

1. **Characterization tests** (written before migration) capture current behavior at the UI level
2. **Store unit tests** verify the new Zustand store logic works correctly
3. **Integration tests** verify components work with the new stores
4. **Analytics parity tests** verify the same events fire before and after

---

## Phase-by-Phase Testing Approach

### Before Each Slice Migration: Write Characterization Tests

A characterization test captures what the UI does today without caring how. These tests survive the migration unchanged.

```typescript
// tests/characterization/cart-feature.test.tsx
// This test does NOT import Redux or Zustand -- it tests through the UI

describe('Cart Feature (characterization)', () => {
  test('adding a product shows it in the cart', async () => {
    render(<App />) // full app render, all providers/stores intact

    await userEvent.click(screen.getByRole('button', { name: /add widget/i }))

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  test('removing the last item shows empty cart message', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /add widget/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove/i }))

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  test('checkout flow processes order', async () => {
    server.use(
      rest.post('/api/orders', (req, res, ctx) => res(ctx.json({ id: 'order-1' })))
    )

    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /add widget/i }))
    await userEvent.click(screen.getByRole('button', { name: /checkout/i }))

    await waitFor(() => {
      expect(screen.getByText(/order placed/i)).toBeInTheDocument()
    })
  })
})
```

**Rule:** If any characterization test fails after migration, the migration introduced a regression. Fix the store, not the test.

### During Migration: Update Component Tests

For each component being migrated:

1. Keep the characterization test passing (don't touch it)
2. Update or rewrite the component-level test to use Zustand patterns

```typescript
// Before: tests/components/CartSummary.test.tsx (Redux)
import { renderWithStore } from '@/test-utils'
import { addItem } from '@/features/cart/cartSlice'

test('displays cart total', () => {
  const { getByText, store } = renderWithStore(<CartSummary />, {
    preloadedState: {
      cart: { items: [{ id: '1', name: 'Widget', quantity: 2, price: 10 }] },
    },
  })

  expect(getByText('$20.00')).toBeInTheDocument()
})

// After: tests/components/CartSummary.test.tsx (Zustand)
import { render, screen } from '@testing-library/react'
import { useCartStore } from '@/stores/useCartStore'

beforeEach(() => {
  // Reset to initial state -- critical for test isolation
  useCartStore.setState({
    items: [],
    isOpen: false,
    checkoutLoading: false,
  }, true) // `true` replaces state entirely instead of merging
})

test('displays cart total', () => {
  useCartStore.setState({
    items: [{ id: '1', name: 'Widget', quantity: 2, price: 10 }],
  })

  render(<CartSummary />)

  expect(screen.getByText('$20.00')).toBeInTheDocument()
})
```

### After Migration: Store Unit Tests

Test store logic independently of React:

```typescript
// tests/stores/useCartStore.test.ts
import { useCartStore } from '@/stores/useCartStore'

beforeEach(() => {
  useCartStore.setState({
    items: [],
    isOpen: false,
    checkoutLoading: false,
  }, true)
})

describe('useCartStore', () => {
  describe('addItem', () => {
    test('adds a new item', () => {
      useCartStore.getState().addItem({
        id: '1', name: 'Widget', quantity: 1, price: 10,
      })

      expect(useCartStore.getState().items).toEqual([
        { id: '1', name: 'Widget', quantity: 1, price: 10 },
      ])
    })

    test('increases quantity for existing item', () => {
      useCartStore.setState({
        items: [{ id: '1', name: 'Widget', quantity: 1, price: 10 }],
      })

      useCartStore.getState().addItem({
        id: '1', name: 'Widget', quantity: 3, price: 10,
      })

      expect(useCartStore.getState().items[0].quantity).toBe(4)
    })
  })

  describe('removeItem', () => {
    test('removes item by id', () => {
      useCartStore.setState({
        items: [
          { id: '1', name: 'Widget', quantity: 1, price: 10 },
          { id: '2', name: 'Gadget', quantity: 1, price: 20 },
        ],
      })

      useCartStore.getState().removeItem('1')

      expect(useCartStore.getState().items).toEqual([
        { id: '2', name: 'Gadget', quantity: 1, price: 20 },
      ])
    })
  })

  describe('async actions', () => {
    test('fetchProducts sets loading then data', async () => {
      server.use(
        rest.get('/api/products', (req, res, ctx) =>
          res(ctx.json([{ id: '1', name: 'Widget' }]))
        )
      )

      const promise = useProductStore.getState().fetchProducts('category-1')

      // Loading state set synchronously
      expect(useProductStore.getState().loading).toBe(true)

      await promise

      expect(useProductStore.getState().loading).toBe(false)
      expect(useProductStore.getState().items).toEqual([{ id: '1', name: 'Widget' }])
    })
  })
})
```

---

## Analytics Parity Testing

This is the highest-risk area. Two complementary approaches:

### Approach 1: Unit Tests for Analytics Events

```typescript
// tests/analytics/cart-analytics.test.ts
import { useCartStore } from '@/stores/useCartStore'
import { trackEvent } from '@/lib/analytics'

jest.mock('@/lib/analytics')

beforeEach(() => {
  jest.clearAllMocks()
  useCartStore.setState({ items: [], isOpen: false }, true)
})

test('fires item_added_to_cart when item added', () => {
  useCartStore.getState().addItem({
    id: 'prod-1', name: 'Widget', quantity: 1, price: 9.99,
  })

  expect(trackEvent).toHaveBeenCalledWith('item_added_to_cart', {
    itemId: 'prod-1',
    price: 9.99,
  })
})

test('fires item_removed_from_cart when item removed', () => {
  useCartStore.setState({
    items: [{ id: 'prod-1', name: 'Widget', quantity: 1, price: 9.99 }],
  })

  useCartStore.getState().removeItem('prod-1')

  expect(trackEvent).toHaveBeenCalledWith('item_removed_from_cart', {
    itemId: 'prod-1',
  })
})
```

### Approach 2: Parallel Event Logging (Production Validation)

During Phase 2, run both Redux analytics middleware AND Zustand analytics in parallel:

```typescript
// middleware/analytics-comparison.ts (TEMPORARY -- remove after validation)
const reduxEvents: AnalyticsEvent[] = []
const zustandEvents: AnalyticsEvent[] = []

// In Redux middleware, push to reduxEvents
// In Zustand middleware, push to zustandEvents
// Every 60 seconds, compare and log discrepancies

setInterval(() => {
  const mismatches = findMismatches(reduxEvents, zustandEvents)
  if (mismatches.length > 0) {
    console.warn('Analytics parity mismatch:', mismatches)
    reportToMonitoring('analytics_parity_mismatch', { mismatches })
  }
  reduxEvents.length = 0
  zustandEvents.length = 0
}, 60_000)
```

---

## Cross-Store Subscription Testing

When stores subscribe to each other, test the reactive chain:

```typescript
// tests/stores/cross-store-subscriptions.test.ts
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeatureFlagStore } from '@/stores/useFeatureFlagStore'

beforeEach(() => {
  useAuthStore.setState({ user: null }, true)
  useFeatureFlagStore.setState({ flags: {}, loading: false }, true)
})

test('feature flags refresh when user changes', async () => {
  server.use(
    rest.get('/api/flags/:userId', (req, res, ctx) =>
      res(ctx.json({ darkMode: true, betaFeature: false }))
    )
  )

  // Simulate login
  useAuthStore.setState({ user: { id: 'user-1', name: 'Alice' } })

  // Wait for the subscription to trigger and async fetch to complete
  await waitFor(() => {
    expect(useFeatureFlagStore.getState().flags).toEqual({
      darkMode: true,
      betaFeature: false,
    })
  })
})

test('feature flags clear when user logs out', async () => {
  useAuthStore.setState({ user: { id: 'user-1', name: 'Alice' } })
  useFeatureFlagStore.setState({ flags: { darkMode: true } })

  // Simulate logout
  useAuthStore.setState({ user: null })

  await waitFor(() => {
    expect(useFeatureFlagStore.getState().flags).toEqual({})
  })
})
```

---

## Test Utilities

### Store Reset Helper

```typescript
// tests/utils/reset-stores.ts
import { useCartStore } from '@/stores/useCartStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
// ... import all stores

const initialStates: Record<string, unknown> = {
  cart: { items: [], isOpen: false, checkoutLoading: false },
  auth: { user: null, loading: false, error: null },
  products: { items: [], loading: false, error: null },
  // ... all stores
}

const stores = {
  cart: useCartStore,
  auth: useAuthStore,
  products: useProductStore,
  // ... all stores
}

export function resetAllStores() {
  for (const [name, store] of Object.entries(stores)) {
    store.setState(initialStates[name], true)
  }
}

// In test setup:
// beforeEach(() => resetAllStores())
```

### Zustand Testing with Jest/Vitest Auto-Reset

For projects using Jest or Vitest, you can auto-mock Zustand to reset stores:

```typescript
// __mocks__/zustand.ts (auto-resets stores between tests)
import { act } from '@testing-library/react'
import type * as ZustandType from 'zustand'

const { create: actualCreate, createStore: actualCreateStore } =
  jest.requireActual<typeof ZustandType>('zustand')

const storeResetFns = new Set<() => void>()

const createUncurried = <T>(stateCreator: ZustandType.StateCreator<T>) => {
  const store = actualCreate(stateCreator)
  const initialState = store.getInitialState()
  storeResetFns.add(() => {
    store.setState(initialState, true)
  })
  return store
}

export const create = (<T>(stateCreator: ZustandType.StateCreator<T>) => {
  return typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried
}) as typeof ZustandType.create

afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn()
    })
  })
})
```

---

## Test Coverage Targets

| Test Category | Target | Rationale |
|--------------|--------|-----------|
| Characterization tests | 1+ per user-facing feature | Regression safety net |
| Store unit tests | 100% of actions/state transitions | Store logic is pure and easy to test |
| Component integration tests | All components that changed | Verify hook migration works |
| Analytics parity tests | 100% of tracked events | Highest business risk |
| Cross-store subscription tests | All store-to-store subscriptions | Easy to break, hard to debug |

---

## CI Pipeline Integration

### Pre-Migration Baseline

Before starting any migration:

```bash
# Record test pass rate, coverage, and bundle size
npm test -- --coverage --json > .migration-baseline/test-results.json
npm run build && du -sh dist/ > .migration-baseline/bundle-size.txt
```

### Per-PR Checks

Every migration PR should:

1. Pass all existing characterization tests (no regressions)
2. Pass new store unit tests
3. Pass updated component tests
4. Not increase bundle size by more than 5KB (temporary tolerance during coexistence)

### Post-Phase Checks

After each phase:

1. Run the full test suite with coverage -- coverage should not decrease
2. Run performance benchmarks (React Profiler) on critical paths
3. Verify analytics event counts match the pre-migration baseline (within 5% tolerance)
4. After Phase 2 (Redux removal): verify bundle size decreased
