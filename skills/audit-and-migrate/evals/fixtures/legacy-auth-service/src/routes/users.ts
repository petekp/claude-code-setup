import { readLegacySession } from "../auth/legacy-auth"
import { verifyAccessToken } from "../auth/token-auth"

export function getCurrentUser(headers: Record<string, string | undefined>) {
  const legacyUser = readLegacySession(headers.cookie)

  if (legacyUser) {
    return { source: "legacy", id: legacyUser.id }
  }

  const claims = verifyAccessToken(headers.authorization)
  if (claims) {
    return { source: "token", id: claims.sub }
  }

  throw new Error("unauthorized")
}
