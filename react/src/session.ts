/**
 * Internal session management for @auther-sdk/react.
 *
 * Tracks access-token expiry, schedules proactive refresh 60s before expiry,
 * and deduplicates concurrent refresh calls.
 */

let _endpoint: string = '';
let _expiresAt: number | null = null;
let _proactiveTimer: ReturnType<typeof setTimeout> | null = null;
let _refreshing: Promise<boolean> | null = null;

export function setEndpoint(endpoint: string): void {
    _endpoint = endpoint;
}

/** POST /auth/refresh — concurrent callers share the same in-flight request. */
export async function callRefresh(): Promise<boolean> {
    if (_refreshing) return _refreshing;

    _refreshing = (async (): Promise<boolean> => {
        try {
            const res = await fetch(`${_endpoint}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                const json = await res.json();
                setExpiresAt(json.data.expiresAt);
                // Patch the stored user with the new access token
                if (json.data.accessToken && typeof window !== 'undefined') {
                    const raw = localStorage.getItem('auther_user');
                    if (raw) {
                        const user = JSON.parse(raw);
                        user.accessToken = json.data.accessToken;
                        user.expiresAt = json.data.expiresAt;
                        localStorage.setItem('auther_user', JSON.stringify(user));
                    }
                }
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

/** Arm the proactive refresh timer for the given expiry timestamp. */
export function setExpiresAt(expiresAt: number): void {
    _expiresAt = expiresAt;
    _scheduleProactiveRefresh(expiresAt);
}

export function getExpiresAt(): number | null {
    return _expiresAt;
}

/** Clear all session state (call on logout). */
export function clearSession(): void {
    if (_proactiveTimer) clearTimeout(_proactiveTimer);
    _expiresAt = null;
    _proactiveTimer = null;
}

function _scheduleProactiveRefresh(expiresAt: number): void {
    if (_proactiveTimer) clearTimeout(_proactiveTimer);

    const delay = expiresAt - Date.now() - 60_000;
    if (delay <= 0) {
        callRefresh();
        return;
    }
    _proactiveTimer = setTimeout(() => callRefresh(), delay);
}
