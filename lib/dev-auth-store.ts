// In-memory dev user store for development/testing
interface DevUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  created_at: string
}

const devUsers = new Map<string, DevUser>()

export function addDevUser(email: string, user: DevUser) {
  devUsers.set(email, user)
}

export function getDevUser(email: string): DevUser | undefined {
  return devUsers.get(email)
}

export function getAllDevUsers(): DevUser[] {
  return Array.from(devUsers.values())
}
