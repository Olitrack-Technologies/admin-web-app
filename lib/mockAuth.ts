const MOCK_ADMIN = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@olitrack.co.ke",
}

const KEY = "olitrack_session"

export function getMockSession() {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as typeof MOCK_ADMIN
  } catch {
    return null
  }
}

export function mockSignIn(email: string, password: string): boolean {
  if (email === "admin@olitrack.co.ke" && password === "admin123") {
    localStorage.setItem(KEY, JSON.stringify(MOCK_ADMIN))
    return true
  }
  return false
}

export function mockSignOut() {
  localStorage.removeItem(KEY)
}

export { MOCK_ADMIN }
