const USERNAME_KEY = 'syncsketch_username'

export function getStoredUsername(): string {
  try {
    return localStorage.getItem(USERNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredUsername(value: string): void {
  try {
    if (value.trim()) {
      localStorage.setItem(USERNAME_KEY, value.trim())
    } else {
      localStorage.removeItem(USERNAME_KEY)
    }
  } catch {
    // ignore
  }
}
