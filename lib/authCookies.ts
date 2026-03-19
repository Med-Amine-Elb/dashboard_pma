export function setAuthCookies(params: { token: string; role: string }) {
  const maxAgeSeconds = 60 * 60 * 24 * 7 // 7 days
  document.cookie = `jwt_token=${encodeURIComponent(params.token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
  document.cookie = `userRole=${encodeURIComponent(params.role)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
}

export function clearAuthCookies() {
  // Expire cookies
  document.cookie = "jwt_token=; Path=/; Max-Age=0; SameSite=Lax"
  document.cookie = "userRole=; Path=/; Max-Age=0; SameSite=Lax"
}

