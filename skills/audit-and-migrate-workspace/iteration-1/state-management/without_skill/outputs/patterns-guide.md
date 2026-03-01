# Migration Patterns Guide: Redux & Context API to Zustand

This document provides concrete, copy-paste-ready patterns for every conversion scenario you'll encounter during the migration.

---

## Table of Contents

1. [Redux Slice to Zustand Store](#1-redux-slice-to-zustand-store)
2. [Redux Thunks to Zustand Async Actions](#2-redux-thunks-to-zustand-async-actions)
3. [Redux Selectors to Zustand Selectors](#3-redux-selectors-to-zustand-selectors)
4. [Redux Middleware to Zustand Middleware](#4-redux-middleware-to-zustand-middleware)
5. [Connected Components to Zustand Hooks](#5-connected-components-to-zustand-hooks)
6. [Context Provider to Zustand Store](#6-context-provider-to-zustand-store)
7. [Nested Context Dependencies to Store Subscriptions](#7-nested-context-dependencies-to-store-subscriptions)
8. [Cross-Slice Coordination](#8-cross-slice-coordination)
9. [Testing Patterns](#9-testing-patterns)
10. [Common Gotchas](#10-common-gotchas)

---

## 1. Redux Slice to Zustand Store

### Before: Redux Toolkit Slice

```typescript
// features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type CartItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, updateQuantity, toggleCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
```

### After: Zustand Store

```typescript
// stores/useCartStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type CartItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
}

type CartActions = {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleCart: () => void
  clearCart: () => void
}

export const useCartStore = create<CartState & CartActions>()(
  devtools(
    immer((set) => ({
      // State
      items: [],
      isOpen: false,

      // Actions
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            existing.quantity += item.quantity
          } else {
            state.items.push(item)
          }
        }, false, 'addItem'),

      removeItem: (id) =>
        set((state) => {
          state.items = state.items.filter((i) => i.id !== id)
        }, false, 'removeItem'),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id)
          if (item) {
            item.quantity = quantity
          }
        }, false, 'updateQuantity'),

      toggleCart: () =>
        set((state) => {
          state.isOpen = !state.isOpen
        }, false, 'toggleCart'),

      clearCart: () =>
        set({ items: [] }, false, 'clearCart'),
    })),
    { name: 'CartStore' }
  )
)
```

**Key differences to note:**
- The `immer` middleware lets you keep the same mutable update syntax from Redux Toolkit
- The third argument to `set` (e.g., `'addItem'`) names the action in DevTools
- State and actions live together -- no separate action creators
- The `devtools` wrapper names the store for the browser extension

### Without Immer (if you prefer explicit immutable updates)

```typescript
export const useCartStore = create<CartState & CartActions>()(
  devtools(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }, false, 'addItem'),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }), false, 'removeItem'),

      // ... etc
    }),
    { name: 'CartStore' }
  )
)
```

---

## 2. Redux Thunks to Zustand Async Actions

### Before: Redux Async Thunk

```typescript
// features/products/productsSlice.ts
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.getProducts(categoryId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [] as Product[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})
```

### After: Zustand Async Action

```typescript
// stores/useProductStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ProductState = {
  items: Product[]
  loading: boolean
  error: string | null
}

type ProductActions = {
  fetchProducts: (categoryId: string) => Promise<void>
  clearError: () => void
}

export const useProductStore = create<ProductState & ProductActions>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: null,

      fetchProducts: async (categoryId) => {
        set({ loading: true, error: null }, false, 'fetchProducts/pending')
        try {
          const response = await api.getProducts(categoryId)
          set({ items: response.data, loading: false }, false, 'fetchProducts/fulfilled')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          set({ loading: false, error: message }, false, 'fetchProducts/rejected')
        }
      },

      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    { name: 'ProductStore' }
  )
)
```

**Key difference:** No more `pending/fulfilled/rejected` boilerplate. The async function handles all three states inline. This is actually much simpler.

### With abort/cancellation (if your thunks support it)

```typescript
fetchProducts: async (categoryId) => {
  // Store abort controller so other actions can cancel this
  const controller = new AbortController()
  set({ loading: true, error: null, _abortController: controller }, false, 'fetchProducts/pending')

  try {
    const response = await api.getProducts(categoryId, {
      signal: controller.signal,
    })
    set({ items: response.data, loading: false }, false, 'fetchProducts/fulfilled')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      set({ loading: false }, false, 'fetchProducts/aborted')
      return
    }
    set({ loading: false, error: error.message }, false, 'fetchProducts/rejected')
  }
},
```

---

## 3. Redux Selectors to Zustand Selectors

### Before: Redux Selectors with Reselect

```typescript
// features/cart/cartSelectors.ts
import { createSelector } from 'reselect'

const selectCartItems = (state: RootState) => state.cart.items

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
)

// Cross-slice selector
export const selectCartWithPromo = createSelector(
  [selectCartTotal, (state: RootState) => state.promo.activeDiscount],
  (total, discount) => total * (1 - discount)
)
```

### After: Zustand Selectors

```typescript
// stores/useCartStore.ts -- inline computed values
// Option A: Computed inside the store (for values used in many places)

export const useCartStore = create<CartState & CartActions & CartComputed>()(
  devtools(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Derived state as getter methods
      getTotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // ... actions
    }),
    { name: 'CartStore' }
  )
)

// Option B: Selector hooks (preferred for component consumption)

// Simple selectors -- just pass a function to the hook
function CartBadge() {
  const itemCount = useCartStore(
    (state) => state.items.reduce((sum, item) => sum + item.quantity, 0)
  )
  return <span>{itemCount}</span>
}

// Memoized selectors for expensive computations
import { useMemo } from 'react'

function CartSummary() {
  const items = useCartStore((state) => state.items)
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  return <span>${total}</span>
}

// Cross-store selector (replaces cross-slice selectors)
function CartWithPromo() {
  const total = useCartStore(
    (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const discount = usePromoStore((state) => state.activeDiscount)
  const finalTotal = useMemo(() => total * (1 - discount), [total, discount])
  return <span>${finalTotal}</span>
}
```

### Preventing unnecessary re-renders with useShallow

When selecting objects or arrays, use `useShallow` to prevent re-renders when the content hasn't changed:

```typescript
import { useShallow } from 'zustand/react/shallow'

function CartItemList() {
  // Without useShallow: re-renders on every store update because a new array is created
  // const items = useCartStore((state) => state.items.filter(i => i.quantity > 0))

  // With useShallow: only re-renders when the filtered array content changes
  const items = useCartStore(
    useShallow((state) => state.items.filter((i) => i.quantity > 0))
  )
  return <ul>{items.map(item => <CartItem key={item.id} item={item} />)}</ul>
}

// For selecting multiple fields as an object
function CartStatus() {
  const { isOpen, itemCount } = useCartStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      itemCount: state.items.length,
    }))
  )
  return isOpen ? <span>{itemCount} items</span> : null
}
```

---

## 4. Redux Middleware to Zustand Middleware

### Before: Redux Analytics Middleware

```typescript
// middleware/analytics.ts
const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case 'cart/addItem':
      trackEvent('item_added_to_cart', {
        itemId: action.payload.id,
        price: action.payload.price,
      })
      break
    case 'cart/removeItem':
      trackEvent('item_removed_from_cart', { itemId: action.payload })
      break
    case 'checkout/complete':
      trackEvent('checkout_completed', {
        total: store.getState().cart.total,
      })
      break
  }

  return result
}
```

### After: Zustand Analytics Middleware

```typescript
// stores/middleware/analytics.ts
import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

type ActionTracker<T> = {
  [actionName: string]: (args: {
    prevState: T
    nextState: T
  }) => void
}

type AnalyticsMiddleware = <
  T extends Record<string, unknown>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  trackers: ActionTracker<T>,
  initializer: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>

export const withAnalytics: AnalyticsMiddleware = (trackers, initializer) =>
  (set, get, store) => {
    type T = ReturnType<typeof get>

    const trackedSet: typeof set = (...args) => {
      const prevState = get()
      set(...(args as Parameters<typeof set>))
      const nextState = get()

      // Check each tracked field for changes and fire analytics
      for (const [, handler] of Object.entries(trackers)) {
        handler({ prevState, nextState })
      }
    }

    return initializer(trackedSet, get, store)
  }

// Usage in a store:
export const useCartStore = create<CartState & CartActions>()(
  devtools(
    withAnalytics<CartState & CartActions>(
      {
        itemAdded: ({ prevState, nextState }) => {
          if (nextState.items.length > prevState.items.length) {
            const newItem = nextState.items.find(
              (item) => !prevState.items.some((prev) => prev.id === item.id)
            )
            if (newItem) {
              trackEvent('item_added_to_cart', {
                itemId: newItem.id,
                price: newItem.price,
              })
            }
          }
        },
        itemRemoved: ({ prevState, nextState }) => {
          if (nextState.items.length < prevState.items.length) {
            const removedItem = prevState.items.find(
              (item) => !nextState.items.some((next) => next.id === item.id)
            )
            if (removedItem) {
              trackEvent('item_removed_from_cart', { itemId: removedItem.id })
            }
          }
        },
      },
      immer((set) => ({
        // ... store definition
      }))
    ),
    { name: 'CartStore' }
  )
)
```

### Alternative: Subscribe-based analytics (simpler, less intrusive)

If action-level tracking isn't needed and you only care about state changes:

```typescript
// Set up after store creation -- no middleware needed
useCartStore.subscribe(
  (state) => state.items,
  (items, prevItems) => {
    if (items.length > prevItems.length) {
      const newItem = items.find(
        (item) => !prevItems.some((prev) => prev.id === item.id)
      )
      if (newItem) {
        trackEvent('item_added_to_cart', { itemId: newItem.id, price: newItem.price })
      }
    }
    if (items.length < prevItems.length) {
      trackEvent('item_removed_from_cart', {})
    }
  },
  { equalityFn: shallow }
)
```

This approach is often cleaner because it separates analytics concerns from store logic entirely.

---

## 5. Connected Components to Zustand Hooks

### Before: Class Component with connect() HOC

```typescript
// components/CartSummary.tsx (legacy)
import { connect } from 'react-redux'

type OwnProps = { className?: string }
type StateProps = { items: CartItem[]; total: number }
type DispatchProps = { clearCart: () => void }

class CartSummary extends React.Component<OwnProps & StateProps & DispatchProps> {
  render() {
    return (
      <div className={this.props.className}>
        <p>{this.props.items.length} items</p>
        <p>Total: ${this.props.total}</p>
        <button onClick={this.props.clearCart}>Clear</button>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  items: state.cart.items,
  total: selectCartTotal(state),
})

const mapDispatchToProps: DispatchProps = {
  clearCart,
}

export default connect(mapStateToProps, mapDispatchToProps)(CartSummary)
```

### After: Function Component with Zustand Hook

```typescript
// components/CartSummary.tsx
import { useCartStore } from '@/stores/useCartStore'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

type CartSummaryProps = {
  className?: string
}

export function CartSummary({ className }: CartSummaryProps) {
  const { items, clearCart } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      clearCart: state.clearCart,
    }))
  )

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  return (
    <div className={className}>
      <p>{items.length} items</p>
      <p>Total: ${total}</p>
      <button onClick={clearCart}>Clear</button>
    </div>
  )
}
```

### Before: Function Component with useSelector/useDispatch

```typescript
function ProductCard({ productId }: { productId: string }) {
  const product = useSelector((state: RootState) => selectProductById(state, productId))
  const cartQuantity = useSelector((state: RootState) =>
    state.cart.items.find(i => i.id === productId)?.quantity ?? 0
  )
  const dispatch = useDispatch()

  const handleAdd = () => {
    dispatch(addItem({ id: productId, name: product.name, quantity: 1, price: product.price }))
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p>In cart: {cartQuantity}</p>
      <button onClick={handleAdd}>Add to Cart</button>
    </div>
  )
}
```

### After: Function Component with Zustand

```typescript
function ProductCard({ productId }: { productId: string }) {
  const product = useProductStore((state) =>
    state.items.find((p) => p.id === productId)
  )
  const cartQuantity = useCartStore((state) =>
    state.items.find((i) => i.id === productId)?.quantity ?? 0
  )
  const addItem = useCartStore((state) => state.addItem)

  if (!product) return null

  const handleAdd = () => {
    addItem({ id: productId, name: product.name, quantity: 1, price: product.price })
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p>In cart: {cartQuantity}</p>
      <button onClick={handleAdd}>Add to Cart</button>
    </div>
  )
}
```

---

## 6. Context Provider to Zustand Store

### Before: Context Provider with useState

```typescript
// contexts/ThemeContext.tsx
type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return (stored as Theme) ?? 'system'
  })

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [theme, resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setTheme('system') // triggers re-eval
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

### After: Zustand Store

```typescript
// stores/useThemeStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

type ThemeState = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
}

type ThemeActions = {
  setTheme: (theme: Theme) => void
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        resolvedTheme: resolveTheme('system'),

        setTheme: (theme) => {
          const resolvedTheme = resolveTheme(theme)
          document.documentElement.setAttribute('data-theme', resolvedTheme)
          set({ theme, resolvedTheme }, false, 'setTheme')
        },
      }),
      {
        name: 'theme-storage', // localStorage key
        partialize: (state) => ({ theme: state.theme }), // only persist theme, not resolvedTheme
      }
    ),
    { name: 'ThemeStore' }
  )
)

// Side effect: listen for system theme changes
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      useThemeStore.getState().setTheme('system')
    }
  })

  // Apply theme on initial load
  const { resolvedTheme } = useThemeStore.getState()
  document.documentElement.setAttribute('data-theme', resolvedTheme)
}
```

**Key improvements:**
- `persist` middleware replaces manual `localStorage` logic
- No provider wrapper needed in the component tree
- The system theme listener is set up once at module scope, not in every render cycle
- `useTheme()` → `useThemeStore()` -- same API, less boilerplate

---

## 7. Nested Context Dependencies to Store Subscriptions

### Before: Provider B reads from Provider A via useContext

```typescript
// contexts/FeatureFlagContext.tsx
function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth() // reads from AuthContext
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user?.id) {
      fetchFlags(user.id).then(setFlags)
    }
  }, [user?.id])

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  )
}
```

### After: Zustand store subscribes to another store

```typescript
// stores/useFeatureFlagStore.ts
import { useAuthStore } from './useAuthStore'

type FeatureFlagState = {
  flags: Record<string, boolean>
  loading: boolean
  fetchFlags: (userId: string) => Promise<void>
}

export const useFeatureFlagStore = create<FeatureFlagState>()(
  devtools(
    (set) => ({
      flags: {},
      loading: false,

      fetchFlags: async (userId) => {
        set({ loading: true }, false, 'fetchFlags/pending')
        const flags = await fetchFlags(userId)
        set({ flags, loading: false }, false, 'fetchFlags/fulfilled')
      },
    }),
    { name: 'FeatureFlagStore' }
  )
)

// Reactive subscription: when auth user changes, re-fetch flags
useAuthStore.subscribe(
  (state) => state.user?.id,
  (userId, prevUserId) => {
    if (userId && userId !== prevUserId) {
      useFeatureFlagStore.getState().fetchFlags(userId)
    }
    if (!userId) {
      // User logged out -- clear flags
      useFeatureFlagStore.setState({ flags: {} })
    }
  },
  { equalityFn: Object.is }
)
```

**Why this is better:** The dependency between auth and feature flags is now explicit, testable, and doesn't require a specific component tree structure.

---

## 8. Cross-Slice Coordination

### Before: Redux thunk dispatching to multiple slices

```typescript
const checkout = createAsyncThunk('checkout', async (_, { dispatch, getState }) => {
  const state = getState() as RootState
  const items = state.cart.items

  dispatch(setCheckoutLoading(true))

  try {
    const order = await api.createOrder(items)
    dispatch(clearCart())
    dispatch(addOrder(order))
    dispatch(showNotification({ type: 'success', message: 'Order placed!' }))
    dispatch(trackAnalytics('checkout_complete', { orderId: order.id }))
  } catch (error) {
    dispatch(showNotification({ type: 'error', message: 'Checkout failed' }))
  } finally {
    dispatch(setCheckoutLoading(false))
  }
})
```

### After: Plain async function coordinating multiple Zustand stores

```typescript
// actions/checkout.ts
import { useCartStore } from '@/stores/useCartStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export async function checkout() {
  const items = useCartStore.getState().items
  useCartStore.setState({ checkoutLoading: true })

  try {
    const order = await api.createOrder(items)
    useCartStore.getState().clearCart()
    useOrderStore.getState().addOrder(order)
    useNotificationStore.getState().show({ type: 'success', message: 'Order placed!' })
    trackEvent('checkout_complete', { orderId: order.id })
  } catch (error) {
    useNotificationStore.getState().show({ type: 'error', message: 'Checkout failed' })
  } finally {
    useCartStore.setState({ checkoutLoading: false })
  }
}

// Used in a component:
function CheckoutButton() {
  const loading = useCartStore((state) => state.checkoutLoading)
  return (
    <button onClick={checkout} disabled={loading}>
      {loading ? 'Processing...' : 'Checkout'}
    </button>
  )
}
```

**This is actually simpler than Redux.** No thunk middleware, no dispatch chain -- just a function that calls store methods. Each store is responsible for its own state transitions.

---

## 9. Testing Patterns

### Before: Testing with Redux mock store

```typescript
import { renderWithStore } from '@/test-utils'

test('shows cart items', () => {
  const preloadedState = {
    cart: {
      items: [{ id: '1', name: 'Widget', quantity: 2, price: 10 }],
      isOpen: true,
    },
  }

  const { getByText } = renderWithStore(<CartSummary />, { preloadedState })
  expect(getByText('1 items')).toBeInTheDocument()
  expect(getByText('Total: $20')).toBeInTheDocument()
})
```

### After: Testing with Zustand store

```typescript
import { render } from '@testing-library/react'
import { useCartStore } from '@/stores/useCartStore'

// Reset store before each test
beforeEach(() => {
  useCartStore.setState({
    items: [],
    isOpen: false,
  })
})

test('shows cart items', () => {
  // Set initial state directly
  useCartStore.setState({
    items: [{ id: '1', name: 'Widget', quantity: 2, price: 10 }],
    isOpen: true,
  })

  const { getByText } = render(<CartSummary />)
  expect(getByText('1 items')).toBeInTheDocument()
  expect(getByText('Total: $20')).toBeInTheDocument()
})

test('clears cart when button clicked', async () => {
  useCartStore.setState({
    items: [{ id: '1', name: 'Widget', quantity: 1, price: 10 }],
  })

  const { getByText } = render(<CartSummary />)
  await userEvent.click(getByText('Clear'))

  expect(useCartStore.getState().items).toHaveLength(0)
})
```

**Key advantage:** No mock store, no provider wrapper, no renderWithProviders utility. Just `setState` and `getState`.

### Testing store logic in isolation

```typescript
test('addItem increases quantity for existing items', () => {
  useCartStore.setState({
    items: [{ id: '1', name: 'Widget', quantity: 1, price: 10 }],
  })

  useCartStore.getState().addItem({ id: '1', name: 'Widget', quantity: 3, price: 10 })

  expect(useCartStore.getState().items[0].quantity).toBe(4)
})
```

---

## 10. Common Gotchas

### Gotcha 1: Stale closures in event handlers

```typescript
// WRONG: handler captures stale state
function BadComponent() {
  const count = useCountStore((s) => s.count)

  useEffect(() => {
    const handler = () => {
      console.log(count) // stale!
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, []) // missing count dependency

  // RIGHT: read from store directly in the handler
  useEffect(() => {
    const handler = () => {
      console.log(useCountStore.getState().count) // always fresh
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
}
```

### Gotcha 2: Object selectors causing infinite re-renders

```typescript
// WRONG: creates a new object every render
const { items, total } = useCartStore((s) => ({
  items: s.items,
  total: s.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
// This re-renders on EVERY store update because {} !== {}

// RIGHT: use useShallow
import { useShallow } from 'zustand/react/shallow'

const { items, total } = useCartStore(
  useShallow((s) => ({
    items: s.items,
    total: s.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }))
)
```

### Gotcha 3: Calling actions inside render

```typescript
// WRONG: calling set during render
function BadComponent() {
  const items = useCartStore((s) => s.items)
  if (items.length === 0) {
    useCartStore.getState().setEmpty(true) // side effect during render!
  }
}

// RIGHT: derive state, don't set it
function GoodComponent() {
  const isEmpty = useCartStore((s) => s.items.length === 0)
  // just use isEmpty directly
}
```

### Gotcha 4: Store initialization ordering

If store B subscribes to store A at module scope, make sure store A's module is imported first. In practice this is rarely an issue because ES module imports are hoisted, but be aware of it for circular dependency scenarios.

### Gotcha 5: SSR hydration mismatch

If using Next.js with SSR, Zustand stores are created on the server with default state but hydrated on the client with persisted state. This can cause hydration mismatches.

```typescript
// Solution: skip hydration on first render
import { useEffect, useState } from 'react'

export function useHydratedStore<T>(store: () => T): T | undefined {
  const [hydrated, setHydrated] = useState(false)
  const state = store()

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated ? state : undefined
}
```

Or use Zustand's built-in `skipHydration` option with the `persist` middleware.
