'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import auther from '@auther-sdk/frontend';
import type { AuthUser as FrontendAuthUser } from '@auther-sdk/frontend';
import { setEndpoint, setExpiresAt, clearSession, callRefresh, getExpiresAt } from './session';

// ── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = FrontendAuthUser;

export interface AutherProviderProps {
    /** Your Auther client key (public). */
    clientId: string;
    /** Auther API endpoint, e.g. "https://oautherbackend.ziloris.com/api/v1". */
    endpoint: string;
    children: ReactNode;
}

export interface AutherContextValue {
    user: AuthUser | null;
    ready: boolean;
    login: () => void;
    signup: () => void;
    logout: () => void;
    getToken: () => Promise<string | null>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AutherContext = createContext<AutherContextValue | null>(null);

// ── Helpers ──────────────────────────────────────────────────────────────────

function armSession(u: AuthUser | null) {
    if (u) {
        setExpiresAt(u.expiresAt);
    } else {
        clearSession();
    }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AutherProvider({ clientId, endpoint, children }: AutherProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Point the session module at the correct endpoint
        setEndpoint(endpoint);

        // Initialise the underlying frontend SDK
        auther.init({
            clientId,
            endpoint,
            onAuth: (u: AuthUser | null) => {
                setUser(u);
                armSession(u);
            },
        });

        // Resolve existing session on mount (page refresh / SSR hydration)
        const existing = auther.getUser() as AuthUser | null;
        setUser(existing);
        armSession(existing);
        setReady(true);

        // Stay in sync with future login / logout events
        const unsub = auther.onAuthStateChange((u: AuthUser | null) => {
            setUser(u);
            armSession(u);
        });

        // When the user returns to a suspended tab, check token freshness
        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            const exp = getExpiresAt();
            if (exp && Date.now() > exp - 60_000) {
                callRefresh();
            }
        };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            unsub();
            document.removeEventListener('visibilitychange', onVisible);
            clearSession();
        };
    }, [clientId, endpoint]);

    return (
        <AutherContext.Provider
            value={{
                user,
                ready,
                login: () => auther.login(),
                signup: () => auther.signup(),
                getToken: async () => {
                    const maybeGetFreshToken = (auther as any).getFreshToken as (() => Promise<string | null>) | undefined;
                    return maybeGetFreshToken ? maybeGetFreshToken() : auther.getToken();
                },
                logout: () => {
                    auther.logout();
                    clearSession();
                },
            }}
        >
            {children}
        </AutherContext.Provider>
    );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuther(): AutherContextValue {
    const ctx = useContext(AutherContext);
    if (!ctx) {
        throw new Error('useAuther() must be used inside <AutherProvider>.');
    }
    return ctx;
}
