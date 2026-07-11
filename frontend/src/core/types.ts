export interface AuthUser {
    id: string;
    email: string;
    expiresAt: number;        // Epoch ms — when access token expires
    refreshExpiresAt: number; // Epoch ms — when refresh token expires
    accessToken: string;      // JWT — for Bearer auth to non-Auther backends
}

export interface ProjectConfig {
    clientId: string;
    googleEnabled: boolean;
    githubEnabled: boolean;
    googleClientId?: string;
    githubClientId?: string;
}

export type ViewState = 'login' | 'signup';

export type AuthCallback = (user: AuthUser | null) => void;
