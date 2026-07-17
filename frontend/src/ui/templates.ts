import { ProjectConfig, ViewState } from '../core/types';

export const getGoogleIcon = (): string =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

export const getGithubIcon = (): string =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.25C6.07 1.25 1.25 6.07 1.25 12c0 4.75 3.08 8.78 7.36 10.2.53.1.73-.23.73-.52 0-.26-.01-.95-.01-1.87-3 .65-3.63-1.44-3.63-1.44-.48-1.22-1.18-1.55-1.18-1.55-.97-.67.07-.66.07-.66 1.08.08 1.64 1.11 1.64 1.11.96 1.64 2.52 1.17 3.14.89.1-.69.37-1.17.68-1.44-2.39-.27-4.9-1.2-4.9-5.33 0-1.18.42-2.14 1.11-2.9-.11-.27-.48-1.37.11-2.86 0 0 .91-.29 2.97 1.11a10.3 10.3 0 0 1 5.42 0c2.06-1.4 2.97-1.11 2.97-1.11.59 1.49.22 2.59.11 2.86.69.76 1.11 1.72 1.11 2.9 0 4.14-2.51 5.06-4.91 5.32.38.33.72.98.72 1.97 0 1.42-.01 2.57-.01 2.92 0 .3.19.62.74.52C20.93 20.78 24 16.75 24 12c0-5.93-4.81-10.75-10.75-10.75z"/></svg>`;

export const getMetaIcon = (): string =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.9 2.25c-2.6 0-4.65 2.1-4.65 6.06 0 3.6 1.77 6.06 4.35 6.06 1.86 0 3.15-1.02 4.86-3.93l1.2-2.07c.24-.42.48-.84.72-1.23l.75 1.35c1.86 3.36 3.03 5.88 5.7 5.88 2.55 0 4.02-2.31 4.02-5.85 0-4.14-2.07-6.27-4.53-6.27-1.98 0-3.42 1.32-5.13 4.29l-.63 1.11c-.15-.24-.3-.48-.42-.72C11.4 3.72 9.72 2.25 6.9 2.25zm-.09 2.4c1.44 0 2.61 1.05 4.11 3.66l.36.63-.99 1.71c-1.35 2.31-2.13 2.94-3.24 2.94-1.29 0-2.16-1.35-2.16-3.72 0-2.55.93-3.72 1.92-3.22zm10.29.03c1.14 0 2.16 1.14 2.16 3.75 0 2.31-.75 3.54-1.86 3.54-1.11 0-1.98-1.02-3.51-3.75l-.48-.87.51-.87c1.29-2.19 2.16-3.3 3.18-2.79z" fill="#0866FF"/></svg>`;

export const getMagicLinkIcon = (): string =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;

export function renderForm(type: ViewState, config: ProjectConfig | null, magicEmail = ''): string {
    // Magic link is its own view: no password field, and a different button.
    // Squeezing it into the login form would mean a password input that is
    // sometimes required and sometimes ignored.
    if (type === 'magic')     return renderMagicLink();
    if (type === 'magicSent') return renderMagicLinkSent(magicEmail);

    const isLogin = type === 'login';
    const title = isLogin ? 'Welcome back' : 'Create account';
    const subtitle = isLogin ? 'Enter your details to access your account' : 'Get started with your free account';
    const buttonText = isLogin ? 'Sign In' : 'Create Account';
    const toggleText = isLogin ? "Don't have an account?" : "Already have an account?";
    const toggleLink = isLogin ? "Sign up" : "Log in";
    const targetState = isLogin ? 'signup' : 'login';

    const googleBtn = config?.googleEnabled ? `
            <button class="auther-btn-social" type="button" data-provider="google">
                ${getGoogleIcon()}
                Continue with Google
            </button>` : '';

    const githubBtn = config?.githubEnabled ? `
            <button class="auther-btn-social" type="button" data-provider="github">
                ${getGithubIcon()}
                Continue with GitHub
            </button>` : '';

    const metaBtn = config?.metaEnabled ? `
            <button class="auther-btn-social" type="button" data-provider="meta">
                ${getMetaIcon()}
                Continue with Meta
            </button>` : '';

    // Not a social provider, but it belongs in the same stack: from the user's
    // side it is another one-click way in that is not a password.
    const magicBtn = config?.magicLinkEnabled ? `
            <button class="auther-btn-social" type="button" data-magic="request">
                ${getMagicLinkIcon()}
                Email me a sign-in link
            </button>` : '';

    const hasSocial = !!(googleBtn || githubBtn || metaBtn || magicBtn);
    const socialStack = hasSocial ? `
        <div class="auther-social-stack">
            ${googleBtn}
            ${githubBtn}
            ${metaBtn}
            ${magicBtn}
        </div>

        <div class="auther-divider">
            <span>Or continue with</span>
        </div>
    ` : '';

    return `
        <div class="auther-header">
            <h2 class="auther-title">${title}</h2>
            <p class="auther-subtitle">${subtitle}</p>
        </div>

        ${socialStack}

        <form class="auther-form-real">
            ${!isLogin ? `
            <div class="auther-input-group">
                <input type="text" class="auther-input" placeholder="Full name" required />
            </div>
            ` : ''}

            <div class="auther-input-group">
                <input type="email" class="auther-input" placeholder="Email address" required />
            </div>

            <div class="auther-input-group">
                <input type="password" class="auther-input" placeholder="Password" required />
            </div>

            <button class="auther-btn-primary" type="submit">
                ${buttonText}
            </button>
        </form>

        <div class="auther-footer">
            ${toggleText} <span class="auther-link" data-switch="${targetState}">${toggleLink}</span>
        </div>
    `;
}

/**
 * Magic link request view. Email only: there is no password in this flow, and
 * showing one would suggest otherwise.
 */
export function renderMagicLink(): string {
    return `
        <div class="auther-header">
            <h2 class="auther-title">Sign in with a link</h2>
            <p class="auther-subtitle">We will email you a link that signs you in. No password needed.</p>
        </div>

        <form class="auther-form-real" data-magic="form">
            <div class="auther-input-group">
                <input type="email" class="auther-input" placeholder="Email address" required />
            </div>

            <button class="auther-btn-primary" type="submit">
                Send sign-in link
            </button>
        </form>

        <div class="auther-footer">
            Prefer a password? <span class="auther-link" data-switch="login">Sign in</span>
        </div>
    `;
}

/**
 * Shown after a link is requested.
 *
 * Deliberately says "if an account exists" rather than "check your inbox": the
 * API does not reveal whether the address is registered, and a confident
 * "we sent it" would leak exactly what that is protecting.
 */
export function renderMagicLinkSent(email: string): string {
    const safeEmail = email.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
    return `
        <div class="auther-header">
            <h2 class="auther-title">Check your email</h2>
            <p class="auther-subtitle">
                If an account exists for <strong>${safeEmail}</strong>, a sign-in link is on its way.
                It works once and expires in 15 minutes.
            </p>
        </div>

        <div class="auther-footer">
            <span class="auther-link" data-switch="magic">Use a different email</span>
        </div>
    `;
}
