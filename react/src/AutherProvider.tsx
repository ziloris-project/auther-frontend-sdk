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

// ── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = FrontendAuthUser;

export interface AutherProviderProps {
    /** Your Auther client key (public). */
    clientId: string;
    /** Auther API endpoint. Optional; defaults to the Auther production API. */
    endpoint?: string;
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

// ── Provider ─────────────────────────────────────────────────────────────────

export function AutherProvider({ clientId, endpoint, children }: AutherProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;

        // Initialise the underlying SDK. It holds the access token in memory
        // only and restores the session from the httpOnly refresh cookie.
        auther.init({ clientId, endpoint });

        // Await the initial restore so `ready` flips exactly when the session
        // is resolved (avoiding a logged-out flash on reload). refresh()
        // de-dupes in-flight calls, so this shares init()'s restore rather than
        // triggering a second one.
        auther.refresh().finally(() => { if (active) setReady(true); });

        // Track subsequent login / logout / background refresh.
        const unsub = auther.onAuthStateChange((u) => {
            if (active) setUser(u as AuthUser | null);
        });

        return () => {
            active = false;
            unsub();
        };
    }, [clientId, endpoint]);

    return (
        <AutherContext.Provider
            value={{
                user,
                ready,
                login:    () => auther.login(),
                signup:   () => auther.signup(),
                logout:   () => auther.logout(),
                getToken: () => auther.getFreshToken(),
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
