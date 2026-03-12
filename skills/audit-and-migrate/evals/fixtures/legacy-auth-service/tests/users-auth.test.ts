import { describe, expect, it } from "vitest"

import { getCurrentUser } from "../src/routes/users"

describe("getCurrentUser", () => {
  it("prefers the legacy session cookie", () => {
    const result = getCurrentUser({
      cookie: "legacy_session=abc; admin=true",
      authorization: "Bearer token",
    })

    expect(result.source).toBe("legacy")
  })
})
