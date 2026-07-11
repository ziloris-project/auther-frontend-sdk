/**
 * Dashboard session management — lives in the SDK, not the dashboard frontend.
 *
 * Responsibilities:
 *  - Track access-token expiry (expiresAt)
 *  - Proactively refresh 60 s before expiry
 *  - Expose callRefresh() for apiFetch to use on reactive 401 handling
 *  - Expose clearSession() for logout
 */

declare const process: { env: Record<string, string | undefined> } | undefined;
const API_BASE =
    typeof process !== 'undefined' && process?.env?.DEV_ENV === 'development'
        ? 'http://localhost:4000'
        : 'https://OAutherbackend.ziloris.com';

// ── Token state ───────────────────────────────────────────────────────────────
let _expiresAt: number | null = null;
let _proactiveTimer: ReturnType<typeof setTimeout> | null = null;

// ── Collapsed in-flight refresh ───────────────────────────────────────────────
let _refreshing: Promise<boolean> | null = null;

// ── Refresh ───────────────────────────────────────────────────────────────────

/** Call /auth/refresh once; concurrent callers share the same in-flight request. */
export async function callRefresh(): Promise<boolean> {
    if (_refreshing) return _refreshing;

    _refreshing = (async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
                method:      'POST',
                credentials: 'include',
            });
            if (res.ok) {
                const json = await res.json();
                // Update state (also re-schedules proactive timer)
                setExpiresAt(json.data.expiresAt);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            _refreshing = null;
        }
    })();

    return _refreshing;
}

// ── Token state helpers ───────────────────────────────────────────────────────

/** Call this after login, signup, or any action that returns a new expiresAt. */
export function setExpiresAt(expiresAt: number): void {
    _expiresAt = expiresAt;
    _scheduleProactiveRefresh(expiresAt);
}

export function getExpiresAt(): number | null {
    return _expiresAt;
}

/** Clear all auth state (call on logout). */
export function clearSession(): void {
    if (_proactiveTimer) clearTimeout(_proactiveTimer);
    _expiresAt     = null;
    _proactiveTimer = null;
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _scheduleProactiveRefresh(expiresAt: number): void {
    if (_proactiveTimer) clearTimeout(_proactiveTimer);

    const delay = expiresAt - Date.now() - 60_000; // 60 s before expiry
    if (delay <= 0) {
        // Already expired or about to — refresh immediately
        callRefresh();
        return;
    }
    _proactiveTimer = setTimeout(() => callRefresh(), delay);
}
