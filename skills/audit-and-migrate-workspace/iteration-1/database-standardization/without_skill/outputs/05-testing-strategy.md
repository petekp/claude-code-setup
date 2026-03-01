# Testing Strategy for Database Migration

## Principles

1. **Every query migration gets a test.** No exceptions.
2. **Tests are written BEFORE the migration**, not after.
3. **Tests verify behavior, not SQL.** We don't care what SQL the ORM generates. We care that the same inputs produce the same outputs.
4. **Performance tests are separate from correctness tests.** Don't block a migration on performance unless it's a known hot path.

---

## Test Categories

### Category 1: Query Equivalence Tests

For each migrated query, verify that the ORM version returns the same results as the original.

```python
# tests/test_query_migration.py

from django.test import TestCase
from django.db import connection
from myapp.models import Order, User
from decimal import Decimal
from datetime import date


class TestOrderQueries(TestCase):
    """Tests for migrating order-related raw SQL to ORM."""

    @classmethod
    def setUpTestData(cls):
        """Create test data once for all tests in this class."""
        cls.user = User.objects.create(email="test@example.com", is_active=True)
        cls.orders = Order.objects.bulk_create([
            Order(user=cls.user, total=Decimal("100.00"), status="completed", created_at=date(2024, 1, 15)),
            Order(user=cls.user, total=Decimal("200.00"), status="completed", created_at=date(2024, 2, 15)),
            Order(user=cls.user, total=Decimal("50.00"), status="pending", created_at=date(2024, 3, 15)),
        ])

    def test_monthly_revenue_raw_sql(self):
        """Verify the original raw SQL query returns expected results.

        This test documents the CURRENT behavior before migration.
        Once the migration is done, this test stays to prove equivalence.
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DATE_TRUNC('month', created_at) as month,
                       SUM(total) as revenue
                FROM orders
                WHERE user_id = %s AND status = 'completed'
                GROUP BY 1
                ORDER BY 1
            """, [self.user.id])
            raw_results = cursor.fetchall()

        self.assertEqual(len(raw_results), 2)
        self.assertEqual(raw_results[0][1], Decimal("100.00"))
        self.assertEqual(raw_results[1][1], Decimal("200.00"))

    def test_monthly_revenue_orm(self):
        """Verify the ORM version returns the same results."""
        from django.db.models import Sum
        from django.db.models.functions import TruncMonth

        orm_results = list(
            Order.objects.filter(
                user=self.user,
                status="completed",
            ).annotate(
                month=TruncMonth("created_at"),
            ).values("month").annotate(
                revenue=Sum("total"),
            ).order_by("month").values_list("month", "revenue")
        )

        self.assertEqual(len(orm_results), 2)
        self.assertEqual(orm_results[0][1], Decimal("100.00"))
        self.assertEqual(orm_results[1][1], Decimal("200.00"))
```

### Category 2: Endpoint Integration Tests

For each view/endpoint being modified, verify the full request/response cycle.

```python
# tests/test_views_migration.py

from django.test import TestCase, Client
from myapp.models import User, UserPreference
import json


class TestUserPreferencesEndpoint(TestCase):
    """Integration tests for the user preferences endpoint.

    Originally powered by SQLAlchemy, now migrated to Django ORM.
    These tests verify the endpoint behavior is unchanged.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
        )
        UserPreference.objects.bulk_create([
            UserPreference(user=cls.user, key="theme", value="dark"),
            UserPreference(user=cls.user, key="language", value="en"),
            UserPreference(user=cls.user, key="timezone", value="UTC"),
        ])

    def setUp(self):
        self.client = Client()
        self.client.login(email="test@example.com", password="testpass123")

    def test_get_preferences_returns_all(self):
        response = self.client.get(f"/api/users/{self.user.id}/preferences/")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 3)
        keys = {item["key"] for item in data}
        self.assertEqual(keys, {"theme", "language", "timezone"})

    def test_get_preferences_values_correct(self):
        response = self.client.get(f"/api/users/{self.user.id}/preferences/")
        data = response.json()

        theme_pref = next(p for p in data if p["key"] == "theme")
        self.assertEqual(theme_pref["value"], "dark")

    def test_update_preference(self):
        response = self.client.put(
            f"/api/users/{self.user.id}/preferences/theme/",
            data=json.dumps({"value": "light"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        pref = UserPreference.objects.get(user=self.user, key="theme")
        self.assertEqual(pref.value, "light")

    def test_nonexistent_user_returns_404(self):
        response = self.client.get("/api/users/99999/preferences/")
        self.assertEqual(response.status_code, 404)
```

### Category 3: Query Count Tests

Verify that migrations don't introduce N+1 queries or other performance regressions.

```python
# tests/test_query_performance.py

from django.test import TestCase, Client


class TestQueryCounts(TestCase):
    """Verify query counts don't regress after migration."""

    @classmethod
    def setUpTestData(cls):
        # Create enough data to trigger N+1 if it exists
        users = User.objects.bulk_create([
            User(email=f"user{i}@example.com") for i in range(20)
        ])
        for user in users:
            Order.objects.bulk_create([
                Order(user=user, total=10) for _ in range(5)
            ])

    def setUp(self):
        self.client = Client()
        self.client.login(email="admin@example.com", password="adminpass")

    def test_order_list_query_count(self):
        """Order list should use constant number of queries regardless of result count."""
        with self.assertNumQueries(3):  # 1 auth + 1 orders + 1 prefetch users
            response = self.client.get("/api/orders/")
            self.assertEqual(response.status_code, 200)

    def test_user_with_orders_query_count(self):
        """User detail with orders should not N+1."""
        with self.assertNumQueries(3):  # 1 auth + 1 user + 1 prefetch orders
            response = self.client.get("/api/users/1/")
            self.assertEqual(response.status_code, 200)
```

### Category 4: Edge Case Tests

Test the specific gotchas documented in `04-edge-cases-and-gotchas.md`.

```python
# tests/test_edge_cases.py

from django.test import TestCase
from myapp.models import Product


class TestNullHandling(TestCase):
    """Verify NULL handling is consistent after migration."""

    @classmethod
    def setUpTestData(cls):
        Product.objects.bulk_create([
            Product(name="Widget", category_id=5),
            Product(name="Gadget", category_id=3),
            Product(name="Orphan", category_id=None),  # no category
        ])

    def test_exclude_category_does_not_include_null(self):
        """Excluding category=5 should NOT return products with NULL category."""
        results = Product.objects.exclude(category_id=5)
        names = set(results.values_list("name", flat=True))
        self.assertEqual(names, {"Gadget"})  # "Orphan" is excluded due to NULL

    def test_exclude_category_with_null_included(self):
        """If we want NULLs included, we need explicit Q objects."""
        from django.db.models import Q
        results = Product.objects.filter(
            ~Q(category_id=5) | Q(category_id__isnull=True)
        )
        names = set(results.values_list("name", flat=True))
        self.assertEqual(names, {"Gadget", "Orphan"})


class TestBulkOperations(TestCase):
    """Verify bulk operations handle edge cases."""

    def test_bulk_create_empty_list(self):
        """bulk_create with empty list should not error."""
        result = Product.objects.bulk_create([])
        self.assertEqual(result, [])

    def test_bulk_create_respects_batch_size(self):
        """bulk_create with batch_size should work for large batches."""
        products = [Product(name=f"Product {i}", price=i) for i in range(5000)]
        created = Product.objects.bulk_create(products, batch_size=1000)
        self.assertEqual(len(created), 5000)
        self.assertEqual(Product.objects.count(), 5000)
```

---

## Test Execution Plan

### Before Migration (for each query/endpoint)

1. Write the integration test for the current behavior
2. Run it, verify it passes with the CURRENT implementation
3. Commit the test

### During Migration

1. Rewrite the query using Django ORM
2. Run the existing test -- it must pass without changes to test assertions
3. If the test fails, the migration is wrong (not the test)
4. Add query count assertions if applicable

### After Migration

1. Run the full test suite
2. Run any additional E2E or smoke tests
3. On staging: run the endpoint manually and compare responses to production

---

## Test Data Strategy

### Use Factories (recommended)

If the project uses `factory_boy` or similar:

```python
import factory
from myapp.models import User, Order

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    is_active = True

class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order
    user = factory.SubFactory(UserFactory)
    total = factory.Faker("pydecimal", left_digits=3, right_digits=2, positive=True)
    status = "completed"
```

### Use setUpTestData (not setUp)

`setUpTestData` creates data once for the entire test class (wrapped in a transaction that rolls back). `setUp` creates data before each test method. For query migration tests, `setUpTestData` is almost always what you want -- it's faster and the data is read-only.

### Avoid Fixtures

JSON/YAML fixtures are brittle and hard to maintain. Use factories or `setUpTestData` with `objects.create()`.

---

## Continuous Integration

Add these CI checks during the migration:

```yaml
# .github/workflows/migration-checks.yml (conceptual)

- name: Run migration tests
  run: python manage.py test tests/test_query_migration -v 2

- name: Check for banned patterns
  run: |
    # Fail if any new SQLAlchemy imports are added
    if grep -rn "from sqlalchemy" --include="*.py" app/; then
      echo "ERROR: New SQLAlchemy imports found"
      exit 1
    fi

- name: Check for raw cursor usage
  run: |
    # Warn (but don't fail) on new cursor.execute usage
    if grep -rn "cursor.execute" --include="*.py" app/ | grep -v "# nosql-lint"; then
      echo "WARNING: New cursor.execute found without nosql-lint override"
    fi
```
