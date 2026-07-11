/**
 * Central fetch wrapper for the Auther dashboard.
 *
 * Token rotation is transparent to callers:
 *  - Proactive: if the access token expires in < 60 s, refresh before the request.
 *  - Reactive:  if the server returns 401, refresh once and retry.
 *
 * Import this instead of raw fetch in every dashboard store/page.
 */

import { getExpiresAt, callRefresh } from './session';

declare const process: { env: Record<string, string | undefined> } | undefined;
const API_BASE =
    typeof process !== 'undefined' && process?.env?.DEV_ENV === 'development'
        ? 'http://localhost:4000'
        : 'https://OAutherbackend.ziloris.com';

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    // Proactive: refresh if token is about to expire
    const expiresAt = getExpiresAt();
    if (expiresAt && Date.now() > expiresAt - 60_000) {
        await callRefresh();
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
    });

    // Reactive: one refresh + retry on unexpected 401
    if (res.status === 401) {
        const refreshed = await callRefresh();
        if (refreshed) {
            return fetch(`${API_BASE}${path}`, { ...options, credentials: 'include' });
        }
        // Refresh failed — session gone, redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Session expired. Please log in again.');
    }

    return res;
}
