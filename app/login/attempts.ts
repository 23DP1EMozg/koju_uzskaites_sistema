// Failed login attempts per personal code, kept in server memory: enough to slow down password guessing
// on a single server, and a restart only resets the counters

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60_000
const LOCK_MS = 5 * 60_000

type Attempts = { failures: number, firstFailureAt: number, lockedUntil: number }

const attempts = new Map<string, Attempts>()

// Minutes left until the code can be tried again, or 0 when it isn't locked
export const lockedMinutes = (ssn: string) => {
    const entry = attempts.get(ssn)
    if (!entry || entry.lockedUntil <= Date.now()) return 0
    return Math.ceil((entry.lockedUntil - Date.now()) / 60_000)
}

export const recordFailure = (ssn: string) => {
    const now = Date.now()
    const entry = attempts.get(ssn)

    // Start counting again once the window or a previous lock is over
    if (!entry || now - entry.firstFailureAt > WINDOW_MS || (entry.lockedUntil && entry.lockedUntil <= now)) {
        attempts.set(ssn, { failures: 1, firstFailureAt: now, lockedUntil: 0 })
        return
    }

    entry.failures++
    if (entry.failures >= MAX_FAILURES) entry.lockedUntil = now + LOCK_MS
}

export const clearFailures = (ssn: string) => {
    attempts.delete(ssn)
}
