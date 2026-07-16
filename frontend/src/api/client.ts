import { AuthUser, ProjectConfig, ViewState } from '../core/types';

const REFRESH_SKEW_MS = 60_000;

export class ApiClient {
    private endpoint: string;
    private clientId: string;

    // Session lives ONLY in memory. The access token is never written to
    // localStorage (an XSS-readable store); the session is restored on page
    // load by calling /refresh, which is authenticated by the httpOnly,
    // JS-unreadable refresh cookie.
    private user: AuthUser | null = null;

    constructor(endpoint: string, clientId: string) {
        this.endpoint = endpoint;
        this.clientId = clientId;
    }

    /**
     * Authorize URL for a provider that uses the redirect flow (GitHub, Meta).
     * returnUrl tells the backend which origin may receive the resulting token
     * via postMessage, so it must be our own origin.
     */
    public getOAuthUrl(provider: string): string {
        const returnUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${this.endpoint}/auth/oauth/${encodeURIComponent(provider)}`
            + `?clientId=${encodeURIComponent(this.clientId)}`
            + `&returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    /** Scheme + host of the configured backend, for validating postMessage senders. */
    public getEndpointOrigin(): string {
        try {
            return new URL(this.endpoint).origin;
        } catch {
            return '';
        }
    }

    public async fetchConfig(): Promise<ProjectConfig | null> {
        try {
            const res = await fetch(`${this.endpoint}/auth/config`, {
                headers: { 'x-auther-client-id': this.clientId }
            });
            const result = await res.json();
            if (result.status === 'success') {
                return result.data as ProjectConfig;
            }
            return null;
        } catch (err) {
            console.error('Auther: Failed to fetch config', err);
            return null;
        }
    }

    public async authenticate(state: ViewState, data: any): Promise<AuthUser> {
        const res = await fetch(`${this.endpoint}/auth/${state}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'x-auther-client-id': this.clientId
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Authentication failed');
        }

        return {
            id:               result.data.user.id,
            email:            result.data.user.email,
            accessToken:      result.data.accessToken,
            expiresAt:        result.data.expiresAt,
            refreshExpiresAt: result.data.refreshExpiresAt,
        };
    }

    public async verifyOAuth(provider: string, code: string): Promise<AuthUser> {
        const res = await fetch(`${this.endpoint}/auth/oauth/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'x-auther-client-id': this.clientId
            },
            body: JSON.stringify({ provider, code })
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'OAuth verification failed');
        }

        return {
            id:               result.data.user.id,
            email:            result.data.user.email,
            accessToken:      result.data.accessToken,
            expiresAt:        result.data.expiresAt,
            refreshExpiresAt: result.data.refreshExpiresAt,
        };
    }

    /**
     * Exchange the httpOnly refresh cookie for a fresh access token. Also used
     * on page load to restore the session (memory starts empty), so it does
     * NOT require a prior in-memory user. Returns null when there is no valid
     * session (e.g. logged out or the refresh cookie expired).
     */
    public async refresh(): Promise<AuthUser | null> {
        const res = await fetch(`${this.endpoint}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'x-auther-client-id': this.clientId,
            },
        });

        if (!res.ok) {
            this.clearUser();
            return null;
        }

        const result = await res.json();
        const d = result.data;
        if (!d?.user || !d?.accessToken) {
            this.clearUser();
            return null;
        }

        const user: AuthUser = {
            id:               d.user.id,
            email:            d.user.email,
            accessToken:      d.accessToken,
            expiresAt:        d.expiresAt,
            refreshExpiresAt: d.refreshExpiresAt,
        };
        this.user = user;
        return user;
    }

    public saveUser(user: AuthUser): void {
        this.user = user;
    }

    public getUser(): AuthUser | null {
        const user = this.user;
        if (!user) return null;
        if (!user.accessToken || Date.now() > user.refreshExpiresAt) {
            this.user = null;
            return null;
        }
        return user;
    }

    public getToken(): string | null {
        const user = this.getUser();
        if (!user || Date.now() > user.expiresAt) return null;
        return user.accessToken;
    }

    public needsRefresh(skewMs = REFRESH_SKEW_MS): boolean {
        const user = this.getUser();
        return !!user && Date.now() > user.expiresAt - skewMs;
    }

    public clearUser(): void {
        this.user = null;
    }

    /**
     * Best-effort server-side logout: revokes the httpOnly refresh cookie so
     * the session cannot be resumed after the client clears local state.
     * keepalive lets the request finish even if the page navigates away
     * (logout is usually followed by a redirect). Failures are swallowed:
     * the local session is cleared regardless.
     */
    public async serverLogout(): Promise<void> {
        try {
            await fetch(`${this.endpoint}/auth/logout`, {
                method:      'POST',
                credentials: 'include',
                keepalive:   true,
                headers:     { 'x-auther-client-id': this.clientId },
            });
        } catch {
            /* offline or unreachable — local logout still proceeds */
        }
    }
}
