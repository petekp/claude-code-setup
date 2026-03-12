export type TokenClaims = {
  sub: string
  scopes: string[]
}

export function verifyAccessToken(header: string | undefined): TokenClaims | null {
  if (!header?.startsWith("Bearer ")) {
    return null
  }

  return {
    sub: "user-123",
    scopes: ["profile:read"],
  }
}
