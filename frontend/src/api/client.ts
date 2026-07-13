import { AuthUser, ProjectConfig, ViewState } from '../core/types';

const STORAGE_KEY = 'auther_user';
const REFRESH_SKEW_MS = 60_000;

export class ApiClient {
    private endpoint: string;
    private clientId: string;

    constructor(endpoint: string, clientId: string) {
        this.endpoint = endpoint;
        this.clientId = clientId;
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

    public async refresh(): Promise<AuthUser | null> {
        const existing = this.getUser();
        if (!existing) return null;

        const res = await fetch(`${this.endpoint}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'x-auther-client-id': this.clientId,
            },
        });

        if (!res.ok) {
            if (res.status === 401) this.clearUser();
            return null;
        }

        const result = await res.json();
        const refreshed: AuthUser = {
            ...existing,
            accessToken:      result.data.accessToken,
            expiresAt:        result.data.expiresAt,
            refreshExpiresAt: result.data.refreshExpiresAt,
        };
        this.saveUser(refreshed);
        return refreshed;
    }

    public saveUser(user: AuthUser): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    public getStoredUser(): AuthUser | null {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) as AuthUser : null;
        } catch {
            return null;
        }
    }

    public getUser(): AuthUser | null {
        if (typeof window === 'undefined') return null;
        try {
            const user = this.getStoredUser();
            if (!user) return null;
            if (!user.accessToken || Date.now() > user.refreshExpiresAt) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return user;
        } catch {
            return null;
        }
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
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
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
