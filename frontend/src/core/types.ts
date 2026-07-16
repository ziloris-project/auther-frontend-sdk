export interface AuthUser {
    id: string;
    email: string;
    /** Display name. Null for users who signed up before it was collected, or who left it blank. */
    name: string | null;
    expiresAt: number;        // Epoch ms — when access token expires
    refreshExpiresAt: number; // Epoch ms — when refresh token expires
    accessToken: string;      // JWT — for Bearer auth to non-Auther backends
}

export interface ProjectConfig {
    clientId: string;
    googleEnabled: boolean;
    githubEnabled: boolean;
    metaEnabled: boolean;
    googleClientId?: string;
    githubClientId?: string;
    metaClientId?: string;
}

export type ViewState = 'login' | 'signup';

export type AuthCallback = (user: AuthUser | null) => void;
