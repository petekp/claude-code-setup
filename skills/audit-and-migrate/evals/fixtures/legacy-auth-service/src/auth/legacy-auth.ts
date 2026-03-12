export type LegacyUser = {
  id: string
  role: "user" | "admin"
}

export function readLegacySession(cookieHeader: string | undefined): LegacyUser | null {
  if (!cookieHeader?.includes("legacy_session=")) {
    return null
  }

  return {
    id: "legacy-user",
    role: cookieHeader.includes("admin=true") ? "admin" : "user",
  }
}
